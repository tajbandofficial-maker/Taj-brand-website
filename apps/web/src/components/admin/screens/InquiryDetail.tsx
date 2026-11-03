"use client";

import type { AdminInquiry, InquiryStatus } from "@taj/types";
import { useQueryClient } from "@tanstack/react-query";
import { FormikProvider, useFormik } from "formik";
import { Mail, MessageCircle, Phone, Save } from "lucide-react";

import { bff } from "@/lib/admin/api";
import { formatDate, formatDateTime } from "@/lib/admin/form";
import { useItem } from "@/lib/admin/queries";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { useAdminUi } from "@/stores/admin-ui-store";

import { AdminButton, AdminLinkButton } from "../AdminButton";
import { SelectField } from "../fields/SelectField";
import { TextAreaField } from "../fields/TextAreaField";
import { inquiryStatusMeta } from "../InquiryStatusBadge";
import { PageHeader } from "../PageHeader";
import { Panel } from "../Panel";
import { ErrorState, LoadingState } from "../States";

type Values = { status: InquiryStatus; notes: string };

export function InquiryDetail({ id }: { id: string }) {
  const item = useItem<AdminInquiry>("inquiries", id);
  const qc = useQueryClient();
  const toast = useAdminUi((s) => s.toast);

  const formik = useFormik<Values>({
    initialValues: { status: item.data?.status ?? "NEW", notes: item.data?.notes ?? "" },
    enableReinitialize: true,
    onSubmit: async (v) => {
      try {
        await bff(`inquiries/${id}`, {
          method: "PATCH",
          body: { status: v.status, notes: v.notes.trim() || null },
        });
        await qc.invalidateQueries({ queryKey: ["inquiries"] });
        await qc.invalidateQueries({ queryKey: ["stats"] });
        toast("success", "Inquiry updated");
      } catch (err) {
        toast("error", err instanceof Error ? err.message : "Could not save");
      }
    },
  });

  if (item.isLoading) return <LoadingState />;
  if (item.error || !item.data)
    return <ErrorState error={item.error} onRetry={() => void item.refetch()} />;
  const i = item.data;
  const firstName = i.name.split(" ")[0];

  const rows: [string, string][] = [
    ["Phone", `+${i.phone}`],
    ["Email", i.email ?? "—"],
    ["Wedding date", formatDate(i.weddingDate)],
    ["Venue / area", i.venue ?? "—"],
    ["Services", i.services.join(", ") || "—"],
    ["Message", i.message ?? "—"],
    ["Sent from page", i.sourcePage ?? "—"],
    ["Received", formatDateTime(i.createdAt)],
  ];

  return (
    <>
      <PageHeader
        title={i.name}
        back={{ href: "/admin/inquiries", label: "All inquiries" }}
        actions={
          <>
            <AdminLinkButton
              href={buildWhatsAppUrl(
                i.phone,
                `Hi ${firstName}, this is Taj Band replying to your wedding enquiry.`,
              )}
              variant="primary"
              external
            >
              <MessageCircle aria-hidden="true" className="size-4" />
              Reply on WhatsApp
            </AdminLinkButton>
            <AdminLinkButton href={`tel:+${i.phone}`} external>
              <Phone aria-hidden="true" className="size-4" />
              Call
            </AdminLinkButton>
            {i.email && (
              <AdminLinkButton href={`mailto:${i.email}`} external>
                <Mail aria-hidden="true" className="size-4" />
                Email
              </AdminLinkButton>
            )}
          </>
        }
      />
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <Panel title="Enquiry">
          <dl className="m-0 grid grid-cols-[140px_1fr] gap-x-4 gap-y-3 text-[15px]">
            {rows.map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-ink-muted">{k}</dt>
                <dd className="m-0 whitespace-pre-wrap">{v}</dd>
              </div>
            ))}
          </dl>
        </Panel>
        <Panel title="Follow-up">
          <FormikProvider value={formik}>
            <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
              <SelectField
                name="status"
                label="Status"
                options={Object.entries(inquiryStatusMeta).map(([value, m]) => ({
                  value,
                  label: m.label,
                }))}
              />
              <TextAreaField
                name="notes"
                label="Private notes"
                rows={6}
                maxLength={5000}
                help="Only visible in the admin."
              />
              <AdminButton
                type="submit"
                variant="primary"
                disabled={formik.isSubmitting}
                className="self-start"
              >
                <Save aria-hidden="true" className="size-4" />
                {formik.isSubmitting ? "Saving…" : "Save"}
              </AdminButton>
            </form>
          </FormikProvider>
        </Panel>
      </div>
    </>
  );
}
