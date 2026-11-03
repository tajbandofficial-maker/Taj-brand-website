"use client";

import type { AdminFaq, AdminService } from "@taj/types";
import type { FormikErrors } from "formik";

import { blankToNull, required } from "@/lib/admin/form";
import { useList } from "@/lib/admin/queries";
import { useEntityForm } from "@/lib/admin/use-entity-form";

import { EntityForm } from "../EntityForm";
import { SelectField } from "../fields/SelectField";
import { SwitchField } from "../fields/SwitchField";
import { TextAreaField } from "../fields/TextAreaField";
import { TextField } from "../fields/TextField";
import { PageHeader } from "../PageHeader";
import { Panel } from "../Panel";

type Values = { question: string; answer: string; serviceId: string; published: boolean };

const toValues = (f?: AdminFaq): Values => ({
  question: f?.question ?? "",
  answer: f?.answer ?? "",
  serviceId: f?.serviceId ?? "",
  published: f?.published ?? true,
});

function validate(v: Values): FormikErrors<Values> {
  const e: FormikErrors<Values> = {};
  const q = required(v.question, "Question");
  const a = required(v.answer, "Answer");
  if (q) e.question = q;
  if (a) e.answer = a;
  return e;
}

const toPayload = (v: Values) => ({
  ...blankToNull(v, ["serviceId"]),
  question: v.question.trim(),
  answer: v.answer.trim(),
});

export function FaqForm({ id }: { id?: string }) {
  const services = useList<AdminService>("services");
  const { formik, query, isNew, onDelete, deleting } = useEntityForm<AdminFaq, Values>({
    resource: "faqs",
    id,
    toValues,
    toPayload,
    validate,
    listHref: "/admin/faqs",
    noun: "Question",
  });
  const service = services.data?.find((s) => s.id === formik.values.serviceId);

  return (
    <>
      <PageHeader
        title={isNew ? "Add question" : "Edit question"}
        back={{ href: "/admin/faqs", label: "All FAQs" }}
      />
      <EntityForm
        formik={formik}
        loading={!isNew && query.isLoading}
        error={query.error}
        onRetry={() => void query.refetch()}
        cancelHref="/admin/faqs"
        viewHref={!isNew && service ? `/services/${service.slug}` : undefined}
        onDelete={isNew ? undefined : () => void onDelete(query.data?.question ?? "")}
        deleting={deleting}
      >
        <Panel title="Question">
          <SwitchField name="published" label="Show on website" />
          <SelectField
            name="serviceId"
            label="Service page"
            emptyLabel="General (not tied to a service)"
            options={(services.data ?? []).map((s) => ({ value: s.id, label: s.title }))}
          />
          <TextField name="question" label="Question" required maxLength={200} />
          <TextAreaField name="answer" label="Answer" required maxLength={2000} />
        </Panel>
      </EntityForm>
    </>
  );
}
