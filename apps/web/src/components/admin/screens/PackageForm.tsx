"use client";

import type { AdminPackage, AdminService } from "@taj/types";
import type { FormikErrors } from "formik";
import { useEffect } from "react";

import { blankToNull, required, SLUG_PATTERN, slugify, toNumberOrNull } from "@/lib/admin/form";
import { useList } from "@/lib/admin/queries";
import { useEntityForm } from "@/lib/admin/use-entity-form";

import { EntityForm } from "../EntityForm";
import { CheckboxGroupField } from "../fields/CheckboxGroupField";
import { ListField } from "../fields/ListField";
import { SwitchField } from "../fields/SwitchField";
import { TextField } from "../fields/TextField";
import { PageHeader } from "../PageHeader";
import { Panel } from "../Panel";

type Values = {
  name: string;
  slug: string;
  tagline: string;
  startingPrice: string;
  priceNote: string;
  inclusions: string[];
  highlighted: boolean;
  published: boolean;
  serviceIds: string[];
};

const toValues = (p?: AdminPackage): Values => ({
  name: p?.name ?? "",
  slug: p?.slug ?? "",
  tagline: p?.tagline ?? "",
  startingPrice: p?.startingPrice?.toString() ?? "",
  priceNote: p?.priceNote ?? "",
  inclusions: p?.inclusions ?? [],
  highlighted: p?.highlighted ?? false,
  published: p?.published ?? false,
  serviceIds: p?.services.map((s) => s.id) ?? [],
});

function validate(v: Values): FormikErrors<Values> {
  const e: FormikErrors<Values> = {};
  const name = required(v.name, "Name");
  if (name) e.name = name;
  if (!SLUG_PATTERN.test(v.slug)) e.slug = "Use lowercase words separated by hyphens, e.g. royal";
  if (v.startingPrice && !/^\d+$/.test(v.startingPrice))
    e.startingPrice = "Whole rupees only, e.g. 75000";
  return e;
}

const toPayload = (v: Values) => ({
  ...blankToNull(v, ["tagline", "priceNote"]),
  name: v.name.trim(),
  startingPrice: toNumberOrNull(v.startingPrice),
  inclusions: v.inclusions.map((i) => i.trim()).filter(Boolean),
});

export function PackageForm({ id }: { id?: string }) {
  const services = useList<AdminService>("services");
  const { formik, query, isNew, onDelete, deleting } = useEntityForm<AdminPackage, Values>({
    resource: "packages",
    id,
    toValues,
    toPayload,
    validate,
    listHref: "/admin/packages",
    noun: "Package",
  });
  const { values, touched, setFieldValue } = formik;

  useEffect(() => {
    if (isNew && !touched.slug) void setFieldValue("slug", slugify(values.name), false);
  }, [isNew, touched.slug, values.name, setFieldValue]);

  return (
    <>
      <PageHeader
        title={isNew ? "Add package" : (query.data?.name ?? "Edit package")}
        back={{ href: "/admin/packages", label: "All packages" }}
      />
      <EntityForm
        formik={formik}
        loading={!isNew && query.isLoading}
        error={query.error}
        onRetry={() => void query.refetch()}
        cancelHref="/admin/packages"
        viewHref={!isNew && query.data?.published ? "/packages" : undefined}
        onDelete={isNew ? undefined : () => void onDelete(query.data?.name ?? "")}
        deleting={deleting}
      >
        <Panel title="Package">
          <SwitchField name="published" label="Show on website" />
          <SwitchField
            name="highlighted"
            label="Mark as “Most booked”"
            help="Highlights this package in gold. Use on one package only."
          />
          <div className="grid gap-5 md:grid-cols-2">
            <TextField
              name="name"
              label="Name"
              required
              maxLength={60}
              help="e.g. Classic, Royal, Grand"
            />
            <TextField
              name="slug"
              label="Short ID"
              required
              maxLength={80}
              help="Lowercase, no spaces."
            />
          </div>
          <TextField
            name="tagline"
            label="Tagline"
            maxLength={120}
            help="e.g. Our signature baraat"
          />
          <div className="grid gap-5 md:grid-cols-2">
            <TextField
              name="startingPrice"
              label="Starting price (₹)"
              inputMode="numeric"
              help="Leave empty to show “Price on request”."
            />
            <TextField
              name="priceNote"
              label="Price note"
              maxLength={120}
              help="e.g. per baraat, Delhi-NCR"
            />
          </div>
          <ListField name="inclusions" label="What's included" addLabel="Add item" />
        </Panel>
        <Panel title="Services in this package">
          {services.data && (
            <CheckboxGroupField
              name="serviceIds"
              label="Services"
              options={services.data.map((s) => ({ value: s.id, label: s.title }))}
            />
          )}
        </Panel>
      </EntityForm>
    </>
  );
}
