"use client";

import { type FormikErrors, type FormikValues, useFormik } from "formik";
import { useRouter } from "next/navigation";

import { useAdminUi } from "@/stores/admin-ui-store";

import { AdminApiError, splitFieldErrors } from "./api";
import { type Resource, useItem, useRemove, useSave } from "./queries";

type Options<Item, Values extends FormikValues> = {
  resource: Resource;
  /** undefined → create a new record. */
  id?: string;
  /** Item → form values (item is undefined when creating). */
  toValues: (item: Item | undefined) => Values;
  /** Form values → API payload. */
  toPayload: (values: Values) => unknown;
  validate?: (values: Values) => FormikErrors<Values>;
  listHref: string;
  noun: string;
};

/**
 * Shared create/edit form logic for admin entities: load → Formik → save →
 * toast → back to the list; server validation messages land on their fields.
 */
export function useEntityForm<Item extends { id: string }, Values extends FormikValues>(
  opts: Options<Item, Values>,
) {
  const router = useRouter();
  const toast = useAdminUi((s) => s.toast);
  const confirm = useAdminUi((s) => s.confirm);
  const query = useItem<Item>(opts.resource, opts.id);
  const save = useSave<Item>(opts.resource);
  const remove = useRemove(opts.resource);
  const isNew = !opts.id;

  const formik = useFormik<Values>({
    initialValues: opts.toValues(query.data),
    enableReinitialize: true,
    validate: opts.validate,
    onSubmit: async (values, helpers) => {
      try {
        await save.mutateAsync({ id: opts.id, data: opts.toPayload(values) });
        toast(
          "success",
          isNew
            ? `${opts.noun} created — live on the site within seconds`
            : "Saved — the website updates within seconds",
        );
        if (isNew) router.push(opts.listHref);
      } catch (err) {
        if (err instanceof AdminApiError) {
          const { fieldErrors, rest } = splitFieldErrors(err.messages, Object.keys(values));
          helpers.setErrors(fieldErrors as FormikErrors<Values>);
          toast("error", rest.join(" ") || "Please fix the highlighted fields.");
        } else {
          toast("error", "Could not save. Please try again.");
        }
      }
    },
  });

  async function onDelete(label: string) {
    if (!opts.id) return;
    const ok = await confirm({
      title: `Delete ${opts.noun.toLowerCase()}?`,
      message: `“${label}” will be removed from the website. This cannot be undone.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    try {
      await remove.mutateAsync(opts.id);
      toast("success", `${opts.noun} deleted`);
      router.push(opts.listHref);
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Could not delete.");
    }
  }

  return { formik, query, isNew, onDelete, deleting: remove.isPending };
}
