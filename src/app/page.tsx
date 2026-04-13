import { AllianceCarousel } from "@/components/home/alliance-carousel";
import { HomeHero } from "@/components/home/home-hero";
import { LatestUpdates } from "@/components/home/latest-updates";
import { QuickStats } from "@/components/home/quick-stats";
import { allianceCarouselSlides } from "@/lib/content";

export default function Home() {
  return (
    <section className="space-y-5">
      <HomeHero />

      <QuickStats />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-cyan-100">Alliance Gallery</h2>
          <p className="text-xs tracking-[0.12em] text-slate-300">
            MOBILE CAROUSEL
          </p>
        </div>
        <AllianceCarousel slides={allianceCarouselSlides} />
      </div>
 
      <LatestUpdates />
    </section>
  );
}
