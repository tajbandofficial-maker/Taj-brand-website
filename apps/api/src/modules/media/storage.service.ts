import {
  CreateBucketCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  PutBucketCorsCommand,
  PutBucketPolicyCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Injectable, Logger, OnModuleInit, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import type { Env } from "../../config/env.schema.js";

export const PRESIGN_TTL_SECONDS = 300;

type StorageConfig = {
  /** Server-side calls (head/delete/provisioning). */
  client: S3Client;
  /** Signs browser uploads; differs from `client` when storage is internal-only. */
  presignClient: S3Client;
  bucket: string;
  publicBaseUrl: string;
  /** RustFS/MinIO we run ourselves (not Cloudflare R2): path-style + self-provisioned bucket. */
  selfHosted: boolean;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** S3-compatible object storage: Cloudflare R2, or RustFS (dev, and self-hosted on a VPS). */
@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private readonly cfg: StorageConfig | null;

  constructor(config: ConfigService<Env, true>) {
    const get = <K extends keyof Env>(k: K) => config.get(k, { infer: true });
    const bucket = get("R2_BUCKET");
    const accessKeyId = get("R2_ACCESS_KEY_ID");
    const secretAccessKey = get("R2_SECRET_ACCESS_KEY");
    const publicBaseUrl = get("R2_PUBLIC_BASE_URL");
    const endpoint =
      get("R2_ENDPOINT") ??
      (get("R2_ACCOUNT_ID")
        ? `https://${get("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`
        : undefined);

    if (!bucket || !accessKeyId || !secretAccessKey || !publicBaseUrl || !endpoint) {
      this.cfg = null;
      return;
    }
    const selfHosted = !/\.r2\.cloudflarestorage\.com/.test(endpoint);
    const s3 = (url: string) =>
      new S3Client({
        region: "auto",
        endpoint: url,
        forcePathStyle: selfHosted,
        credentials: { accessKeyId, secretAccessKey },
      });
    const client = s3(endpoint);
    const publicEndpoint = get("R2_PUBLIC_ENDPOINT");
    this.cfg = {
      bucket,
      publicBaseUrl: publicBaseUrl.replace(/\/$/, ""),
      selfHosted,
      client,
      presignClient: publicEndpoint ? s3(publicEndpoint) : client,
    };
  }

  get configured(): boolean {
    return this.cfg !== null;
  }

  /** Self-hosted storage: create the public bucket + CORS that R2 is configured with by hand. */
  onModuleInit(): void {
    if (!this.cfg) {
      this.logger.warn("Object storage not configured — image uploads are disabled.");
      return;
    }
    // In the background: the storage container may still be starting.
    if (this.cfg.selfHosted) void this.provision(this.cfg);
  }

  private async provision({ client, bucket }: StorageConfig, attempts = 10): Promise<void> {
    for (let i = 1; i <= attempts; i++) {
      try {
        await this.ensureBucket(client, bucket);
        return;
      } catch (err) {
        if (i === attempts) {
          this.logger.warn({ err: String(err) }, "Storage not reachable — image uploads may fail");
          return;
        }
        await sleep(3000);
      }
    }
  }

  private async ensureBucket(client: S3Client, bucket: string): Promise<void> {
    try {
      await client.send(new HeadBucketCommand({ Bucket: bucket }));
      return;
    } catch {
      // Missing — or storage still starting, in which case CreateBucket throws and we retry.
    }
    await client.send(new CreateBucketCommand({ Bucket: bucket }));
    await client.send(
      new PutBucketPolicyCommand({
        Bucket: bucket,
        Policy: JSON.stringify({
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Principal: { AWS: ["*"] },
              Action: ["s3:GetObject"],
              Resource: [`arn:aws:s3:::${bucket}/*`],
            },
          ],
        }),
      }),
    );
    await client.send(
      new PutBucketCorsCommand({
        Bucket: bucket,
        CORSConfiguration: {
          CORSRules: [
            {
              AllowedOrigins: ["*"],
              AllowedMethods: ["PUT", "GET"],
              AllowedHeaders: ["*"],
              MaxAgeSeconds: 3600,
            },
          ],
        },
      }),
    );
    this.logger.log(`Created public media bucket "${bucket}"`);
  }

  private require(): StorageConfig {
    if (!this.cfg) throw new ServiceUnavailableException("Image storage is not configured.");
    return this.cfg;
  }

  publicUrl(key: string): string {
    return `${this.require().publicBaseUrl}/${key}`;
  }

  async presignPut(key: string, contentType: string, size: number): Promise<string> {
    const { presignClient, bucket } = this.require();
    return getSignedUrl(
      presignClient,
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: contentType,
        ContentLength: size,
      }),
      { expiresIn: PRESIGN_TTL_SECONDS },
    );
  }

  async exists(key: string): Promise<boolean> {
    const { client, bucket } = this.require();
    try {
      await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
      return true;
    } catch {
      return false;
    }
  }

  async remove(key: string): Promise<void> {
    const { client, bucket } = this.require();
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  }
}
