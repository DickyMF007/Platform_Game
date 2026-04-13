"use client";

import { hasSupabaseEnv, supabase } from "@/lib/supabase-client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/state", label: "State" },
  { href: "/alliance", label: "Alliance" },
  { href: "/players", label: "Player" },
  { href: "/leaderboard", label: "Rank" },
  { href: "/register", label: "Daftar" },
  { href: "/admin", label: "Admin" },
];

function navClass(active: boolean) {
  return active
    ? "rounded-xl bg-cyan-400/20 px-3 py-2 text-cyan-200"
    : "rounded-xl px-3 py-2 text-slate-300 hover:bg-slate-700/40";
}

function useAllianceBrand() {
  const [brand, setBrand] = useState("EVE HUB");

  useEffect(() => {
    if (!hasSupabaseEnv || !supabase) return;
    const supabaseClient = supabase;

    const timer = setTimeout(async () => {
      const { data, error } = await supabaseClient
        .from("alliances")
        .select("name, tag")
        .order("id", { ascending: false })
        .limit(1)
        .maybeSingle<{ name: string; tag: string }>();

      if (error || !data) return;

      const nextBrand = `${data.tag} HUB`.toUpperCase();
      setBrand(nextBrand);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  return brand;
}

export function TopNav() {
  const pathname = usePathname();
  const brand = useAllianceBrand();

  return (
    <nav className="sticky top-4 z-20 hidden items-center justify-between rounded-2xl border border-cyan-200/25 bg-[#0b1730] px-4 py-3 shadow-[0_16px_36px_rgba(0,0,0,0.45)] md:flex">
      <div className="text-sm font-semibold tracking-[0.16em] text-cyan-100">
        {brand}
      </div>
      <div className="flex items-center gap-2 text-sm">
        {links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={navClass(pathname === item.href)}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const brand = useAllianceBrand();

  return (
    <nav className="fixed inset-x-4 bottom-4 z-30 rounded-2xl border border-cyan-200/25 bg-[#0b1730] px-2 py-2 shadow-[0_14px_32px_rgba(0,0,0,0.5)] md:hidden">
      <div className="pb-1 text-center text-[10px] font-semibold tracking-[0.14em] text-cyan-200/90">
        {brand}
      </div>
      <ul className="grid grid-cols-7 gap-1 text-center text-xs">
        {links.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`block rounded-xl py-2 ${
                pathname === item.href
                  ? "bg-cyan-400/20 font-semibold text-cyan-100"
                  : "text-slate-300"
              }`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
