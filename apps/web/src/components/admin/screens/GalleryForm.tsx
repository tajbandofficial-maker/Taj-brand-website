"use client";

import type { AdminGalleryCategory, AdminGalleryItem, AdminService } from "@taj/types";
import type { FormikErrors } from "formik";

import { blankToNull } from "@/lib/admin/form";
import { useList } from "@/lib/admin/queries";
import { useEntityForm } from "@/lib/admin/use-entity-form";

import { EntityForm } from "../EntityForm";
import { MediaField } from "../fields/MediaField";
import { SelectField } from "../fields/SelectField";
import { SwitchField } from "../fields/SwitchField";
import { TextField } from "../fields/TextField";
import { PageHeader } from "../PageHeader";
import { Panel } from "../Panel";
import { categoryLabels, parseYouTubeId } from "./gallery-meta";

type Values = {
  type: "IMAGE" | "VIDEO";
  category: AdminGalleryCategory;
  mediaId: string | null;
  youtube: string;
  caption: string;
  serviceId: string;
  published: boolean;
};

const toValues = (g?: AdminGalleryItem): Values => ({
  type: g?.type ?? "IMAGE",
  category: g?.category ?? "BARAAT",
  mediaId: g?.mediaId ?? null,
  youtube: g?.youtubeId ? `https://www.youtube.com/watch?v=${g.youtubeId}` : "",
  caption: g?.caption ?? "",
  serviceId: g?.serviceId ?? "",
  published: g?.published ?? true,
});

function validate(v: Values): FormikErrors<Values> {
  const e: FormikErrors<Values> = {};
  if (v.type === "IMAGE" && !v.mediaId) e.mediaId = "Upload or choose a photo";
  if (v.type === "VIDEO" && !parseYouTubeId(v.youtube))
    e.youtube = "Paste a YouTube link, e.g. https://youtu.be/…";
  return e;
}

const toPayload = (v: Values) => {
  const { youtube, ...rest } = blankToNull(v, ["caption", "serviceId"]);
  return {
    ...rest,
    category: v.type === "VIDEO" ? "VIDEO" : v.category,
    youtubeId: v.type === "VIDEO" ? parseYouTubeId(youtube) : null,
  };
};

export function GalleryForm({ id }: { id?: string }) {
  const services = useList<AdminService>("services");
  const { formik, query, isNew, onDelete, deleting } = useEntityForm<AdminGalleryItem, Values>({
    resource: "gallery",
    id,
    toValues,
    toPayload,
    validate,
    listHref: "/admin/gallery",
    noun: "Gallery item",
  });
  const isVideo = formik.values.type === "VIDEO";

  return (
    <>
      <PageHeader
        title={isNew ? "Add to gallery" : "Edit gallery item"}
        back={{ href: "/admin/gallery", label: "Gallery" }}
      />
      <EntityForm
        formik={formik}
        loading={!isNew && query.isLoading}
        error={query.error}
        onRetry={() => void query.refetch()}
        cancelHref="/admin/gallery"
        viewHref={!isNew ? "/gallery" : undefined}
        onDelete={
          isNew
            ? undefined
            : () => void onDelete(query.data?.caption || query.data?.media?.alt || "this item")
        }
        deleting={deleting}
      >
        <Panel title="Item">
          <SwitchField name="published" label="Show on website" />
          <div className="grid gap-5 md:grid-cols-2">
            <SelectField
              name="type"
              label="Type"
              options={[
                { value: "IMAGE", label: "Photo" },
                { value: "VIDEO", label: "YouTube video" },
              ]}
            />
            {!isVideo && (
              <SelectField
                name="category"
                label="Category"
                help="The Gallery page filter it appears under."
                options={Object.entries(categoryLabels)
                  .filter(([k]) => k !== "VIDEO")
                  .map(([value, label]) => ({ value, label }))}
              />
            )}
          </div>
          {isVideo && (
            <TextField
              name="youtube"
              label="YouTube link"
              required
              placeholder="https://www.youtube.com/watch?v=…"
              help="Videos only load when a visitor taps them."
            />
          )}
          <MediaField
            name="mediaId"
            label={isVideo ? "Cover image (optional)" : "Photo"}
            required={!isVideo}
            help={isVideo ? "Leave empty to use YouTube's own thumbnail." : undefined}
            initialMedia={query.data?.media ?? null}
          />
          <TextField
            name="caption"
            label={isVideo ? "Video title" : "Caption (optional)"}
            maxLength={160}
          />
          <SelectField
            name="serviceId"
            label="Also show on a service page"
            emptyLabel="No"
            help="Photos only — up to 6 appear on that service's page."
            options={(services.data ?? []).map((s) => ({ value: s.id, label: s.title }))}
          />
        </Panel>
      </EntityForm>
    </>
  );
}
