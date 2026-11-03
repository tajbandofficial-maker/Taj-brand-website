"use client";

import type { AdminAddOn, AdminService } from "@taj/types";
import type { FormikErrors } from "formik";

import { blankToNull, required, toNumberOrNull } from "@/lib/admin/form";
import { useList } from "@/lib/admin/queries";
import { useEntityForm } from "@/lib/admin/use-entity-form";

import { EntityForm } from "../EntityForm";
import { SelectField } from "../fields/SelectField";
import { SwitchField } from "../fields/SwitchField";
import { TextAreaField } from "../fields/TextAreaField";
import { TextField } from "../fields/TextField";
import { PageHeader } from "../PageHeader";
import { Panel } from "../Panel";

type Values = {
  name: string;
  description: string;
  startingPrice: string;
  serviceId: string;
  published: boolean;
};

const toValues = (a?: AdminAddOn): Values => ({
  name: a?.name ?? "",
  description: a?.description ?? "",
  startingPrice: a?.startingPrice?.toString() ?? "",
  serviceId: a?.serviceId ?? "",
  published: a?.published ?? true,
});

function validate(v: Values): FormikErrors<Values> {
  const e: FormikErrors<Values> = {};
  const name = required(v.name, "Name");
  if (name) e.name = name;
  if (v.startingPrice && !/^\d+$/.test(v.startingPrice)) e.startingPrice = "Whole rupees only";
  return e;
}

const toPayload = (v: Values) => ({
  ...blankToNull(v, ["description", "serviceId"]),
  name: v.name.trim(),
  startingPrice: toNumberOrNull(v.startingPrice),
});

export function AddOnForm({ id }: { id?: string }) {
  const services = useList<AdminService>("services");
  const { formik, query, isNew, onDelete, deleting } = useEntityForm<AdminAddOn, Values>({
    resource: "addons",
    id,
    toValues,
    toPayload,
    validate,
    listHref: "/admin/addons",
    noun: "Add-on",
  });

  return (
    <>
      <PageHeader
        title={isNew ? "Add add-on" : (query.data?.name ?? "Edit add-on")}
        back={{ href: "/admin/addons", label: "All add-ons" }}
      />
      <EntityForm
        formik={formik}
        loading={!isNew && query.isLoading}
        error={query.error}
        onRetry={() => void query.refetch()}
        cancelHref="/admin/addons"
        viewHref={!isNew ? "/packages" : undefined}
        onDelete={isNew ? undefined : () => void onDelete(query.data?.name ?? "")}
        deleting={deleting}
      >
        <Panel title="Add-on">
          <SwitchField name="published" label="Show on website" />
          <TextField name="name" label="Name" required maxLength={80} help="e.g. Extra dhol" />
          <TextAreaField name="description" label="Short description" rows={2} maxLength={300} />
          <div className="grid gap-5 md:grid-cols-2">
            <TextField
              name="startingPrice"
              label="Starting price (₹)"
              inputMode="numeric"
              help="Optional."
            />
            <SelectField
              name="serviceId"
              label="Links to service page"
              emptyLabel="No link"
              options={(services.data ?? []).map((s) => ({ value: s.id, label: s.title }))}
            />
          </div>
        </Panel>
      </EntityForm>
    </>
  );
}
