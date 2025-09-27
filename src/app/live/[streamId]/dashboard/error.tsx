"use client";

import { redirect } from "next/navigation";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return redirect(window.location.pathname.replace("/dashboard", ""));
}
