"use client";

import type { AdminPackage, AdminService } from "@taj/types";
import { FieldArray, type FormikErrors } from "formik";
import { Plus, X } from "lucide-react";
import { useEffect } from "react";

import { blankToNull, required, SLUG_PATTERN, slugify } from "@/lib/admin/form";
import { useList } from "@/lib/admin/queries";
import { useEntityForm } from "@/lib/admin/use-entity-form";

import { AdminButton } from "../AdminButton";
import { EntityForm } from "../EntityForm";
import { CheckboxGroupField } from "../fields/CheckboxGroupField";
import { ListField } from "../fields/ListField";
import { MediaField } from "../fields/MediaField";
import { SwitchField } from "../fields/SwitchField";
import { TextAreaField } from "../fields/TextAreaField";
import { TextField } from "../fields/TextField";
import { PageHeader } from "../PageHeader";
import { Panel } from "../Panel";

type Values = {
  title: string;
  slug: string;
  h1: string;
  shortDescription: string;
  intro: string;
  sections: { heading: string; body: string }[];
  inclusions: string[];
  areaCopy: string;
  heroImageId: string | null;
  seoTitle: string;
  seoDescription: string;
  ogImageId: string | null;
  published: boolean;
  relatedPackageIds: string[];
};

const toValues = (s?: AdminService): Values => ({
  title: s?.title ?? "",
  slug: s?.slug ?? "",
  h1: s?.h1 ?? "",
  shortDescription: s?.shortDescription ?? "",
  intro: s?.intro ?? "",
  sections: s?.sections ?? [{ heading: "What's included", body: "" }],
  inclusions: s?.inclusions ?? [],
  areaCopy: s?.areaCopy ?? "",
  heroImageId: s?.heroImageId ?? null,
  seoTitle: s?.seoTitle ?? "",
  seoDescription: s?.seoDescription ?? "",
  ogImageId: s?.ogImageId ?? null,
  published: s?.published ?? false,
  relatedPackageIds: s?.relatedPackages.map((p) => p.id) ?? [],
});

function validate(v: Values): FormikErrors<Values> {
  const e: FormikErrors<Values> = {};
  e.title = required(v.title, "Name");
  e.slug = !SLUG_PATTERN.test(v.slug)
    ? "Use lowercase words separated by hyphens, e.g. dhol-players"
    : undefined;
  e.h1 = required(v.h1, "Page heading");
  e.shortDescription = required(v.shortDescription, "Short description");
  e.intro = required(v.intro, "Introduction");
  for (const k of Object.keys(e) as (keyof Values)[]) if (!e[k]) delete e[k];
  return e;
}

const toPayload = (v: Values) => ({
  ...blankToNull(v, ["areaCopy", "seoTitle", "seoDescription"]),
  title: v.title.trim(),
  sections: v.sections.filter((s) => s.heading.trim() && s.body.trim()),
  inclusions: v.inclusions.map((i) => i.trim()).filter(Boolean),
});

export function ServiceForm({ id }: { id?: string }) {
  const packages = useList<AdminPackage>("packages");
  const { formik, query, isNew, onDelete, deleting } = useEntityForm<AdminService, Values>({
    resource: "services",
    id,
    toValues,
    toPayload,
    validate,
    listHref: "/admin/services",
    noun: "Service",
  });
  const { values, touched, setFieldValue } = formik;

  // New services: suggest the URL slug from the name until the slug is edited by hand.
  useEffect(() => {
    if (isNew && !touched.slug) void setFieldValue("slug", slugify(values.title), false);
  }, [isNew, touched.slug, values.title, setFieldValue]);

  return (
    <>
      <PageHeader
        title={isNew ? "Add service" : (query.data?.title ?? "Edit service")}
        back={{ href: "/admin/services", label: "All services" }}
      />
      <EntityForm
        formik={formik}
        loading={!isNew && query.isLoading}
        error={query.error}
        onRetry={() => void query.refetch()}
        cancelHref="/admin/services"
        viewHref={!isNew && query.data?.published ? `/services/${query.data.slug}` : undefined}
        onDelete={isNew ? undefined : () => void onDelete(query.data?.title ?? "")}
        deleting={deleting}
      >
        <Panel title="Basics">
          <SwitchField
            name="published"
            label="Show on website"
            help="Turn off to hide this service while you work on it."
          />
          <div className="grid gap-5 md:grid-cols-2">
            <TextField
              name="title"
              label="Name"
              required
              help="Used in menus and cards, e.g. Dhol Players."
              maxLength={80}
            />
            <TextField
              name="slug"
              label="Web address"
              required
              help={`Page address: /services/${values.slug || "…"}. Changing it later breaks old links.`}
              maxLength={80}
            />
          </div>
          <TextField
            name="h1"
            label="Page heading"
            required
            help="The big heading on the service page (good for Google)."
            maxLength={160}
          />
          <TextAreaField
            name="shortDescription"
            label="Short description"
            required
            help="One line shown on service cards."
            rows={2}
            maxLength={300}
          />
          <TextAreaField
            name="intro"
            label="Introduction"
            required
            help="Opening paragraph under the heading."
            maxLength={1500}
          />
          <MediaField
            name="heroImageId"
            label="Main photo"
            help="Shown at the top of the page and on cards."
            initialMedia={query.data?.heroImage ?? null}
          />
        </Panel>

        <Panel title="Page content">
          <FieldArray name="sections">
            {({ push, remove }) => (
              <div className="flex flex-col gap-4">
                {values.sections.map((_, i) => (
                  <div key={i} className="flex flex-col gap-3 rounded-lg border border-line p-4">
                    <div className="flex items-start gap-2">
                      <TextField
                        name={`sections.${i}.heading`}
                        label={`Section ${i + 1} heading`}
                        className="flex-1"
                        maxLength={120}
                      />
                      <AdminButton
                        size="sm"
                        variant="ghost"
                        aria-label={`Remove section ${i + 1}`}
                        className="mt-7"
                        onClick={() => remove(i)}
                      >
                        <X aria-hidden="true" className="size-4" />
                      </AdminButton>
                    </div>
                    <TextAreaField name={`sections.${i}.body`} label="Text" maxLength={4000} />
                  </div>
                ))}
                <AdminButton
                  size="sm"
                  className="self-start"
                  onClick={() => push({ heading: "", body: "" })}
                >
                  <Plus aria-hidden="true" className="size-4" />
                  Add section
                </AdminButton>
              </div>
            )}
          </FieldArray>
          <ListField
            name="inclusions"
            label="What's included"
            help="Short points shown as ticked tiles."
            addLabel="Add point"
          />
          <TextAreaField
            name="areaCopy"
            label="Areas served (optional)"
            help="A short paragraph naming the areas you cover for this service — helps local Google searches."
            maxLength={1500}
          />
        </Panel>

        <Panel title="Related packages" description="Packages that include this service.">
          {packages.data && (
            <CheckboxGroupField
              name="relatedPackageIds"
              label="Packages"
              options={packages.data.map((p) => ({ value: p.id, label: p.name }))}
            />
          )}
        </Panel>

        <Panel
          title="Google & sharing (optional)"
          description="Leave empty to use the page heading, introduction and main photo."
        >
          <TextField
            name="seoTitle"
            label="Search title"
            maxLength={70}
            help="Up to ~60 characters."
          />
          <TextAreaField
            name="seoDescription"
            label="Search description"
            rows={2}
            maxLength={170}
          />
          <MediaField
            name="ogImageId"
            label="Share image"
            help="Shown when the page is shared on WhatsApp or Facebook. Empty = the main photo."
            initialMedia={query.data?.ogImage ?? null}
          />
        </Panel>
      </EntityForm>
    </>
  );
}
