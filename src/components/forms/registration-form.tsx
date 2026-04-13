"use client";

import { FormEvent, useEffect, useState } from "react";
import { hasSupabaseEnv, supabase } from "@/lib/supabase-client";
import { registrationProofBucket } from "@/lib/storage";

type SubmitState = "idle" | "loading" | "success" | "error";

export function RegistrationForm() {
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState("loading");
    setMessage("");
    const formEl = event.currentTarget;

    if (!supabase || !hasSupabaseEnv) {
      setSubmitState("error");
      setMessage(
        "Supabase environment variables are not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
      );
      return;
    }

    const formData = new FormData(formEl);
    const name = String(formData.get("name") || "").trim();
    const gameId = String(formData.get("gameId") || "").trim();
    const note = String(formData.get("note") || "").trim();
    const powerImage = formData.get("powerImage") as File | null;

    if (!name || !gameId || !powerImage || powerImage.size === 0) {
      setSubmitState("error");
      setMessage("Name, Game ID, and Power Screenshot are required.");
      return;
    }

    const safeFileName = `${Date.now()}-${powerImage.name.replaceAll(/\s+/g, "-")}`;
    const filePath = `registration/${safeFileName}`;

    const uploadResult = await supabase.storage
      .from(registrationProofBucket)
      .upload(filePath, powerImage, { upsert: false });

    if (uploadResult.error) {
      setSubmitState("error");
      if (uploadResult.error.message.toLowerCase().includes("bucket not found")) {
        setMessage(
          `Storage bucket "${registrationProofBucket}" was not found. Create the bucket in Supabase Storage or set NEXT_PUBLIC_REGISTRATION_PROOF_BUCKET to an existing bucket name.`
        );
      } else {
        setMessage(`Failed to upload image: ${uploadResult.error.message}`);
      }
      return;
    }

    const { error } = await supabase.from("registrations").insert({
      name,
      game_id: gameId,
      note,
      power_image_url: filePath,
      status: "pending",
    });

    if (error) {
      setSubmitState("error");
      setMessage(`Failed to submit registration: ${error.message}`);
      return;
    }

    formEl.reset();
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
    }
    setSubmitState("success");
    setMessage("Registration submitted successfully. The recruiter team will review your data.");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4">
        <label className="text-sm">
          Name
          <input
            name="name"
            required
            className="mt-1 w-full rounded-xl border border-cyan-300/30 bg-slate-950/70 px-3 py-2"
            placeholder="Enter your name"
          />
        </label>

        <label className="text-sm">
          Game ID
          <input
            name="gameId"
            required
            className="mt-1 w-full rounded-xl border border-cyan-300/30 bg-slate-950/70 px-3 py-2"
            placeholder="Contoh: WOS-12345"
          />
        </label>

        <label className="text-sm">
          Note
          <textarea
            name="note"
            rows={3}
            className="mt-1 w-full rounded-xl border border-cyan-300/30 bg-slate-950/70 px-3 py-2"
            placeholder="Add short info if needed"
          />
        </label>

        <label className="text-sm">
          Power Screenshot
          <input
            name="powerImage"
            type="file"
            accept="image/*"
            required
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) {
                if (previewUrl) {
                  URL.revokeObjectURL(previewUrl);
                }
                setPreviewUrl("");
                return;
              }

              const nextPreviewUrl = URL.createObjectURL(file);
              if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
              }
              setPreviewUrl(nextPreviewUrl);
            }}
            className="mt-1 w-full rounded-xl border border-dashed border-cyan-300/30 bg-slate-950/70 px-3 py-2"
          />
        </label>

        {previewUrl && (
          <div className="rounded-2xl border border-cyan-300/25 bg-slate-900/40 p-3">
            <p className="mb-2 text-xs text-cyan-200/80">Power Screenshot Preview</p>
            <img
              src={previewUrl}
              alt="Power screenshot preview"
              className="max-h-72 w-full rounded-xl object-contain"
            />
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={submitState === "loading"}
        className="frost-button w-full rounded-xl px-4 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitState === "loading" ? "Submitting..." : "Submit Registration"}
      </button>

      {message && (
        <p
          className={`text-sm ${
            submitState === "success" ? "text-emerald-300" : "text-rose-300"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
}
