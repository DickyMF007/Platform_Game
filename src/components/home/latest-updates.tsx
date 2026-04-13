"use client";

import { hasSupabaseEnv, supabase } from "@/lib/supabase-client";
import { useEffect, useState } from "react";

type UpdateItem = {
  id: string;
  title: string;
  content: string;
  created_at: string;
};

export function LatestUpdates() {
  const [updates, setUpdates] = useState<UpdateItem[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUpdates() {
      if (!supabase || !hasSupabaseEnv) {
        setErrorMessage("Supabase belum dikonfigurasi.");
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("state_updates")
        .select("id, title, content, created_at")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }

      const sortedUpdates = (data ?? []).sort((a, b) => {
        const aTime = new Date(a.created_at).getTime();
        const bTime = new Date(b.created_at).getTime();
        return bTime - aTime;
      });

      setUpdates(sortedUpdates);
      setIsLoading(false);
    }

    void loadUpdates();
  }, []);

  return (
    <div className="ice-panel rounded-3xl p-5">
      <h2 className="text-lg font-semibold text-cyan-100">Latest Update</h2>

      {isLoading && <p className="mt-4 text-sm text-slate-300">Loading update...</p>}

      {!isLoading && errorMessage && (
        <p className="mt-4 text-sm text-rose-300">Gagal memuat data: {errorMessage}</p>
      )}

      {!isLoading && !errorMessage && updates.length === 0 && (
        <p className="mt-4 text-sm text-slate-300">Belum ada update terbaru.</p>
      )}

      {!isLoading && !errorMessage && updates.length > 0 && (
        <div className="mt-4 space-y-3">
          {updates.map((item) => (
            <article key={item.id} className="rounded-2xl bg-slate-900/45 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold">{item.title}</h3>
                <span className="text-xs text-slate-300">
                  {new Date(item.created_at).toLocaleDateString("id-ID")}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-200">{item.content}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
