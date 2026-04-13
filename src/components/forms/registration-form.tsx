"use client";

import { FormEvent, useState } from "react";
import { hasSupabaseEnv, supabase } from "@/lib/supabase-client";

type SubmitState = "idle" | "loading" | "success" | "error";

export function RegistrationForm() {
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState("loading");
    setMessage("");

    if (!supabase || !hasSupabaseEnv) {
      setSubmitState("error");
      setMessage(
        "Supabase environment variable belum diatur. Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY."
      );
      return;
    }

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") || "").trim();
    const gameId = String(formData.get("gameId") || "").trim();
    const note = String(formData.get("note") || "").trim();
    const powerImage = formData.get("powerImage") as File | null;

    if (!name || !gameId || !powerImage || powerImage.size === 0) {
      setSubmitState("error");
      setMessage("Nama, Game ID, dan Foto Power wajib diisi.");
      return;
    }

    const safeFileName = `${Date.now()}-${powerImage.name.replaceAll(/\s+/g, "-")}`;
    const filePath = `registration/${safeFileName}`;

    const uploadResult = await supabase.storage
      .from("registration-proof")
      .upload(filePath, powerImage, { upsert: false });

    if (uploadResult.error) {
      setSubmitState("error");
      setMessage(`Gagal upload gambar: ${uploadResult.error.message}`);
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
      setMessage(`Gagal kirim pendaftaran: ${error.message}`);
      return;
    }

    event.currentTarget.reset();
    setSubmitState("success");
    setMessage("Pendaftaran berhasil dikirim. Tim recruiter akan review data kamu.");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4">
        <label className="text-sm">
          Nama
          <input
            name="name"
            required
            className="mt-1 w-full rounded-xl border border-cyan-300/30 bg-slate-950/70 px-3 py-2"
            placeholder="Masukkan nama"
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
            placeholder="Tambahkan info singkat jika perlu"
          />
        </label>

        <label className="text-sm">
          Foto Power
          <input
            name="powerImage"
            type="file"
            accept="image/*"
            required
            className="mt-1 w-full rounded-xl border border-dashed border-cyan-300/30 bg-slate-950/70 px-3 py-2"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={submitState === "loading"}
        className="frost-button w-full rounded-xl px-4 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitState === "loading" ? "Mengirim..." : "Kirim Pendaftaran"}
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
