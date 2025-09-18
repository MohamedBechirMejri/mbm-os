"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { DesktopAPI, useDesktop } from "../../window-manager";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { CATALOG, type CatalogEntry } from "./catalog";

type Section = "discover" | "arcade" | "create" | "work" | "play" | "develop" | "categories" | "updates";

export function AppStoreApp({ instanceId: _ }: { instanceId: string }) {
  const apps = useDesktop((s) => s.apps);
  const [active, setActive] = useState<Section>("discover");
  const installed = useMemo(() => new Set(Object.keys(apps)), [apps]);

  const entries = useMemo(() => CATALOG, []);

  function doInstall(entry: CatalogEntry) {
    // No-op if already installed
    if (installed.has(entry.meta.id)) return;
    DesktopAPI.registerApps([entry.meta]);
  }

  function open(entry: CatalogEntry) {
    DesktopAPI.launch(entry.meta.id);
  }

  return (
    <div className="grid h-full w-full grid-cols-[240px_minmax(0,1fr)] overflow-hidden bg-[#0E1116]/60 text-white">
      {/* Sidebar */}
      <aside className="flex h-full flex-col gap-1 border-r border-white/10 bg-white/5 p-3">
        <SearchBox />
        <nav className="mt-2 flex flex-col gap-1 text-[14px]">
          {(
            [
              ["discover", "Discover"],
              ["arcade", "Arcade"],
              ["create", "Create"],
              ["work", "Work"],
              ["play", "Play"],
              ["develop", "Develop"],
              ["categories", "Categories"],
              ["updates", "Updates"],
            ] as Array<[Section, string]>
          ).map(([id, label]) => (
            <SidebarItem
              key={id}
              label={label}
              active={active === id}
              onClick={() => setActive(id)}
            />
          ))}
        </nav>
        <div className="mt-auto text-xs text-white/50">
          <div className="truncate">Mohamed Bechir Mejri</div>
          <div className="truncate">App Store</div>
        </div>
      </aside>

      {/* Content */}
      <main className="relative h-full overflow-auto">
        <div className="mx-auto max-w-[1200px] px-6 py-6">
          <h1 className="text-[28px] font-semibold tracking-tight">Discover</h1>

          {/* Hero card */}
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <HeroCard />
            <WelcomeCard />
          </div>

          {/* App list */}
          <section className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white/90">
                Apps That Look Great on macOS Tahoe
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {entries.map((e: CatalogEntry) => {
                const isInstalled = installed.has(e.meta.id);
                return (
                  <AppCard
                    key={e.meta.id}
                    entry={e}
                    installed={isInstalled}
                    onInstall={() => doInstall(e)}
                    onOpen={() => open(e)}
                  />
                );
              })}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function SidebarItem({ label, active, onClick }: { label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-white/80 hover:bg-white/10",
        active && "bg-white/15 text-white"
      )}
    >
      <span className="h-[18px] w-[18px] rounded-md bg-white/20" />
      <span>{label}</span>
    </button>
  );
}

function SearchBox() {
  return (
    <div className="relative">
      <input
        placeholder="Search"
        className="h-9 w-full rounded-lg border border-white/10 bg-black/25 px-3 text-[14px] text-white placeholder:text-white/60 outline-none"
      />
    </div>
  );
}

function HeroCard() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-0">
      <div className="px-5 py-4">
        <div className="text-[12px] font-semibold tracking-wide text-white/70">MAJOR UPDATE</div>
        <div className="mt-1 text-[22px] font-semibold">See What’s New in macOS Tahoe</div>
        <p className="mt-2 text-[13px] text-white/70 max-w-prose">
          A gorgeous new look, a supercharged Spotlight, and more.
        </p>
      </div>
      <div className="relative h-[160px] w-full overflow-hidden">
        <Image src="/assets/Tahoe%20default%20wallpapers/macOS%20Tahoe%2026%20Light%20Wallpaper.png" alt="Tahoe" fill className="object-cover" />
      </div>
    </div>
  );
}

function WelcomeCard() {
  return (
    <div className="grid grid-rows-2 gap-4">
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <div className="text-[12px] text-white/70">GET STARTED</div>
        <div className="mt-1 text-[18px] font-semibold">The Apple Games App Is Your New Home for Play</div>
        <p className="mt-2 text-[13px] text-white/70">Find new favorites, play with friends—it’s all here.</p>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <div className="text-[12px] text-white/70">FROM THE EDITORS</div>
        <div className="mt-1 text-[18px] font-semibold">Welcome to the Mac App Store!</div>
        <p className="mt-2 text-[13px] text-white/70">Take a tour and find your next favorite app.</p>
      </div>
    </div>
  );
}

function AppCard({ entry, installed, onInstall, onOpen }: { entry: CatalogEntry; installed: boolean; onInstall: () => void; onOpen: () => void }) {
  const { meta, subtitle } = entry;
  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-3">
        <Image
          src={`/assets/icons/apps/${meta.icon}.ico`}
          alt="icon"
          width={56}
          height={56}
          className="rounded-lg"
        />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] font-semibold">{meta.title}</div>
          <div className="truncate text-[12px] text-white/70">{subtitle}</div>
        </div>
        <div className="flex items-center gap-2">
          {installed ? (
            <Button size="sm" className="rounded-full bg-white text-black hover:bg-white/90" onClick={onOpen}>
              Open
            </Button>
          ) : (
            <Button size="sm" className="rounded-full" onClick={onInstall}>
              Get
            </Button>
          )}
        </div>
      </div>
      <Separator className="my-3 bg-white/10" />
      <div className="flex items-center justify-between text-[12px] text-white/60">
        <div className="truncate">In-App Purchases</div>
        <div className="truncate">Utilities</div>
      </div>
    </div>
  );
}

export default AppStoreApp;
