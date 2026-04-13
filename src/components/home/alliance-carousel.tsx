"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";

type Slide = {
  title: string;
  subtitle: string;
  image: string;
};

type AllianceCarouselProps = {
  slides: Slide[];
};

export function AllianceCarousel({ slides }: AllianceCarouselProps) {
  // Logic grouping slide: 2 gambar per halaman
  const groupedSlides = useMemo(() => {
    const groups: Slide[][] = [];
    for (let i = 0; i < slides.length; i += 2) {
      groups.push(slides.slice(i, i + 2));
    }
    return groups;
  }, [slides]);

  const totalPages = groupedSlides.length;
  
  // State untuk indeks (kita tambah 1 untuk keperluan cloning jika manual, 
  // tapi di sini kita pakai logika modulo yang bersih)
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Fungsi navigasi dengan logika loop
  const goNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % totalPages);
  }, [totalPages]);

  const goPrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + totalPages) % totalPages);
  }, [totalPages]);

  // Auto-play
  useEffect(() => {
    if (totalPages <= 1) return;
    const timer = setInterval(goNext, 6000);
    return () => clearInterval(timer);
  }, [totalPages, goNext]);

  if (!slides.length) return null;

  return (
    <section className="w-full mx-auto max-w-7xl px-4 py-8 font-sans">
      <div 
        className="relative overflow-hidden bg-[#020617] border-y border-cyan-500/20"
        onTouchStart={(e) => setTouchStartX(e.changedTouches[0]?.clientX ?? null)}
        onTouchEnd={(e) => {
          if (touchStartX === null) return;
          const delta = (e.changedTouches[0]?.clientX ?? touchStartX) - touchStartX;
          if (Math.abs(delta) > 50) delta < 0 ? goNext() : goPrev();
          setTouchStartX(null);
        }}
      >
        {/* Decorative Global Scanline HUD Overlay */}
        <div className="absolute inset-0 z-30 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px]" />

        {/* Carousel Track */}
        <div
          className="flex transition-transform duration-[800ms] cubic-bezier(0.4, 0, 0.2, 1)"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {groupedSlides.map((group, groupIndex) => (
            <div key={`group-${groupIndex}`} className="min-w-full grid grid-cols-1 md:grid-cols-2">
              {group.map((slide, idx) => (
                <article 
                  key={`${slide.title}-${idx}`} 
                  className="relative h-[550px] sm:h-[700px] flex flex-col justify-center items-center overflow-hidden border-x border-white/5 group/card"
                >
                  {/* BACKGROUND DESIGN */}
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-black" />
                  <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#888_1px,transparent_1px),linear-gradient(to_bottom,#888_1px,transparent_1px)] bg-[size:32px_32px]" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.08),transparent_70%)]" />
                  
                  {/* Glow Effects */}
                  <div className="absolute -top-10 -left-10 w-40 h-40 bg-cyan-500 blur-[60px] rounded-full opacity-0 group-hover/card:opacity-30 transition-opacity duration-700" />
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500 blur-[60px] rounded-full opacity-0 group-hover/card:opacity-20 transition-opacity duration-700" />

                  {/* Main Image (FULL HEIGHT) */}
                  <div className="relative z-10 w-full h-full p-4 sm:p-10">
                    <div className="relative w-full h-full transition-all duration-700 group-hover/card:scale-[1.03] group-hover/card:drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                      <Image
                        src={slide.image}
                        alt={slide.title}
                        fill
                        className="object-contain"
                        priority={groupIndex === 0}
                      />
                    </div>
                  </div>
                  
                  {/* Gaming Content Info */}
                  <div className="absolute inset-x-0 bottom-0 p-8 z-40 bg-gradient-to-t from-black via-black/80 to-transparent">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-1.5 h-1.5 bg-cyan-500 rotate-45 animate-pulse" />
                      <span className="text-cyan-400 text-[10px] font-bold tracking-[0.4em] uppercase font-mono">
                        Data_Node::{groupIndex}{idx}
                      </span>
                    </div>
                    
                    <h3 className="text-2xl sm:text-3xl font-black text-white italic uppercase tracking-tighter mb-1.5 group-hover/card:text-cyan-300 transition-colors">
                      {slide.title}
                    </h3>
                    <p className="text-slate-400 text-xs sm:text-sm max-w-xs leading-relaxed font-medium">
                      {slide.subtitle}
                    </p>

                    {/* Cyber Button Style */}
                    <div className="mt-5 flex items-center gap-4">
                      <div className="h-[1px] flex-1 bg-gradient-to-r from-cyan-500/50 via-cyan-500/10 to-transparent" />
                      <button className="text-[10px] font-bold text-cyan-400 border border-cyan-500/30 px-5 py-1.5 hover:bg-cyan-500 hover:text-black hover:border-cyan-500 transition-all skew-x-[-15deg] shadow-[0_0_10px_rgba(6,182,212,0.2)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)]">
                        <span className="inline-block skew-x-[15deg] tracking-widest">ACCESS_FILE</span>
                      </button>
                    </div>
                  </div>

                  {/* Aesthetic HUD Elements */}
                  <div className="absolute top-6 left-6 z-40 opacity-30 flex gap-1">
                    <div className="w-1 h-3 bg-cyan-500" />
                    <div className="w-1 h-3 bg-slate-700" />
                    <div className="w-1 h-3 bg-slate-700" />
                  </div>
                </article>
              ))}
            </div>
          ))}
        </div>

        {/* Tactical Nav Buttons */}
        <button 
          onClick={goPrev} 
          className="absolute left-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 border border-cyan-500/30 bg-black/70 text-cyan-500 hover:bg-cyan-500 hover:text-black transition-all flex items-center justify-center font-bold text-xl backdrop-blur-sm"
          aria-label="Previous Page"
        >
          {"<"}
        </button>
        <button 
          onClick={goNext} 
          className="absolute right-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 border border-cyan-500/30 bg-black/70 text-cyan-500 hover:bg-cyan-500 hover:text-black transition-all flex items-center justify-center font-bold text-xl backdrop-blur-sm"
          aria-label="Next Page"
        >
          {">"}
        </button>
      </div>

      {/* Pagination - Progress Style */}
      <div className="mt-8 flex justify-center gap-3">
        {groupedSlides.map((_, index) => (
          <button
            key={`dot-${index}`}
            onClick={() => setActiveIndex(index)}
            className={`h-1.5 transition-all duration-500 rounded-sm ${
              activeIndex === index 
                ? "w-20 bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" 
                : "w-6 bg-slate-800 hover:bg-slate-700"
            }`}
          />
        ))}
      </div>
    </section>
  );
}