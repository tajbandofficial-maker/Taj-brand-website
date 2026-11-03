"use client";

import type { AdminReview, AdminReviewSource } from "@taj/types";
import type { FormikErrors } from "formik";

import { blankToNull, required } from "@/lib/admin/form";
import { useEntityForm } from "@/lib/admin/use-entity-form";

import { EntityForm } from "../EntityForm";
import { MediaField } from "../fields/MediaField";
import { SelectField } from "../fields/SelectField";
import { SwitchField } from "../fields/SwitchField";
import { TextAreaField } from "../fields/TextAreaField";
import { TextField } from "../fields/TextField";
import { PageHeader } from "../PageHeader";
import { Panel } from "../Panel";

export const reviewSourceLabels: Record<AdminReviewSource, string> = {
  GOOGLE: "Google review",
  DIRECT: "Direct from client",
  HIGH_PROFILE: "High-profile wedding",
};

type Values = {
  author: string;
  rating: string;
  text: string;
  meta: string;
  source: AdminReviewSource;
  imageId: string | null;
  eventDate: string;
  featured: boolean;
  published: boolean;
};

const toValues = (r?: AdminReview): Values => ({
  author: r?.author ?? "",
  rating: String(r?.rating ?? 5),
  text: r?.text ?? "",
  meta: r?.meta ?? "",
  source: r?.source ?? "GOOGLE",
  imageId: r?.imageId ?? null,
  eventDate: r?.eventDate?.slice(0, 10) ?? "",
  featured: r?.featured ?? false,
  published: r?.published ?? true,
});

function validate(v: Values): FormikErrors<Values> {
  const e: FormikErrors<Values> = {};
  const author = required(v.author, "Name");
  if (author) e.author = author;
  if (v.source !== "HIGH_PROFILE" && !v.text.trim()) e.text = "Review text is required";
  return e;
}

const toPayload = (v: Values) => ({
  ...blankToNull(v, ["meta", "eventDate"]),
  author: v.author.trim(),
  text: v.text.trim() || "—",
  rating: Number(v.rating),
});

export function ReviewForm({ id }: { id?: string }) {
  const { formik, query, isNew, onDelete, deleting } = useEntityForm<AdminReview, Values>({
    resource: "reviews",
    id,
    toValues,
    toPayload,
    validate,
    listHref: "/admin/reviews",
    noun: "Review",
  });
  const highProfile = formik.values.source === "HIGH_PROFILE";

  return (
    <>
      <PageHeader
        title={isNew ? "Add review" : "Edit review"}
        back={{ href: "/admin/reviews", label: "All reviews" }}
      />
      <EntityForm
        formik={formik}
        loading={!isNew && query.isLoading}
        error={query.error}
        onRetry={() => void query.refetch()}
        cancelHref="/admin/reviews"
        viewHref={!isNew ? "/reviews" : undefined}
        onDelete={isNew ? undefined : () => void onDelete(query.data?.author ?? "")}
        deleting={deleting}
      >
        <Panel title="Review" description="Only publish real reviews you have permission to use.">
          <SwitchField name="published" label="Show on website" />
          <SwitchField name="featured" label="Show on home page" help="Pick your best 3." />
          <div className="grid gap-5 md:grid-cols-2">
            <SelectField
              name="source"
              label="Type"
              options={Object.entries(reviewSourceLabels).map(([value, label]) => ({
                value,
                label,
              }))}
            />
            <SelectField
              name="rating"
              label="Stars"
              options={["5", "4", "3", "2", "1"].map((n) => ({
                value: n,
                label: "★".repeat(Number(n)),
              }))}
            />
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <TextField
              name="author"
              label={highProfile ? "Client name" : "Name"}
              required
              maxLength={80}
              help="e.g. Riya & Kunal"
            />
            <TextField
              name="meta"
              label="Details"
              maxLength={120}
              help="e.g. Royal package · Gurugram"
            />
          </div>
          <TextAreaField name="text" label="Review text" required={!highProfile} maxLength={2000} />
          <TextField name="eventDate" label="Wedding date (optional)" type="date" />
          {highProfile && (
            <MediaField
              name="imageId"
              label="Photo with the client"
              help="Shown in the “High-profile weddings” section."
              initialMedia={query.data?.image ?? null}
            />
          )}
        </Panel>
      </EntityForm>
    </>
  );
}
