"use server";

import { revalidatePath } from "next/cache";
import { isDashboardToken } from "@/lib/jobs/auth";
import { setStatus } from "@/lib/jobs/store";
import { runJobScan } from "@/lib/jobs/run";

/* Server actions are separately addressable endpoints, so each one re-checks
   the token rather than trusting that the caller rendered the page. */

const ALLOWED_STATUS = new Set(["new", "saved", "applied", "dismissed"]);

export async function updateStatus(formData: FormData): Promise<void> {
  const token = String(formData.get("k") ?? "");
  if (!isDashboardToken(token)) return;

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !ALLOWED_STATUS.has(status)) return;

  await setStatus(id, status);
  revalidatePath("/opportunities");
}

export async function scanNow(formData: FormData): Promise<void> {
  const token = String(formData.get("k") ?? "");
  if (!isDashboardToken(token)) return;

  await runJobScan();
  revalidatePath("/opportunities");
}
