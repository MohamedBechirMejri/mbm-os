"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CATEGORIES, EXPERIMENT_APPS, getFeaturedApps } from "./data";
import type { Category, CategoryInfo, ExperimentApp } from "./types";

type View = "discover" | "category" | "app-detail";

interface ViewState {
  type: View;
  categoryId?: Category;
  appId?: string;
}

export function AppStoreApp({ instanceId: _ }: { instanceId: string }) {
  const [view, setView] = useState<ViewState>({ type: "discover" });
  const [searchQuery, setSearchQuery] = useState("");

  const filteredApps = searchQuery
    ? EXPERIMENT_APPS.filter(
        (app) =>
          app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
      )
    : null;

  return (
    <div className="grid h-full w-full grid-cols-[220px_minmax(0,1fr)] overflow-hidden bg-gradient-to-br from-[#0A0E27]/95 via-[#0E1116]/95 to-[#1A1625]/95 text-white backdrop-blur-xl">
      {/* Sidebar */}
      <aside className="flex h-full flex-col gap-2 border-r border-white/5 bg-white/[0.02] p-3 backdrop-blur-sm">
        <div className="mb-1 px-2 py-1">
          <div className="text-[0.75rem] font-semibold tracking-wide text-white/50">
            EXPERIMENT LAB
          </div>
        </div>

        <nav className="flex flex-col gap-0.5">
          <SidebarItem
            label="Discover"
            icon="emblem-favorite"
            active={view.type === "discover"}
            onClick={() => setView({ type: "discover" })}
          />

          <div className="mb-1 mt-3 px-2 py-1">
            <div className="text-[0.7rem] font-semibold tracking-wider text-white/40">
              CATEGORIES
            </div>
          </div>

          {CATEGORIES.map((cat) => (
            <SidebarItem
              key={cat.id}
              label={cat.name}
              icon={cat.icon}
              active={view.type === "category" && view.categoryId === cat.id}
              onClick={() => setView({ type: "category", categoryId: cat.id })}
              accentColor={cat.color}
            />
          ))}
        </nav>

        <div className="mt-auto space-y-1 rounded-lg bg-white/5 p-3 text-[0.7rem] text-white/60">
          <div className="font-medium text-white/80">Experiment Lab</div>
          <div>A collection of web experiments</div>
          <div className="pt-1 text-white/40">by Mohamed Bechir Mejri</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="relative h-full overflow-auto">
        {/* Search Bar */}
        <div className="sticky top-0 z-10 border-b border-white/5 bg-[#0E1116]/80 px-6 py-3 backdrop-blur-xl">
          <div className="relative mx-auto max-w-[1200px]">
            <input
              type="text"
              placeholder="Search experiments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-4 text-[0.875rem] text-white placeholder:text-white/50 outline-none transition-all focus:border-white/20 focus:bg-black/40"
            />
          </div>
        </div>

        <div className="mx-auto max-w-[1200px] px-6 py-6">
          {filteredApps ? (
            <SearchResults
              apps={filteredApps}
              onViewApp={(id) => setView({ type: "app-detail", appId: id })}
            />
          ) : view.type === "discover" ? (
            <DiscoverView
              onViewApp={(id) => setView({ type: "app-detail", appId: id })}
            />
          ) : view.type === "category" && view.categoryId ? (
            <CategoryView
              categoryId={view.categoryId}
              onViewApp={(id) => setView({ type: "app-detail", appId: id })}
            />
          ) : view.type === "app-detail" && view.appId ? (
            <AppDetailView
              appId={view.appId}
              onBack={() => setView({ type: "discover" })}
            />
          ) : null}
        </div>
      </main>
    </div>
  );
}

function SidebarItem({
  label,
  icon,
  active,
  onClick,
  accentColor,
}: {
  label: string;
  icon?: string;
  active?: boolean;
  onClick?: () => void;
  accentColor?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[0.8125rem] text-white/70 transition-all hover:bg-white/8",
        active && "bg-white/10 text-white shadow-sm",
      )}
    >
      {icon && (
        <Image
          src={`/assets/icons/apps/${icon}.ico`}
          alt=""
          width={18}
          height={18}
          className="rounded-sm opacity-80 group-hover:opacity-100"
          style={
            accentColor
              ? { filter: `drop-shadow(0 0 4px ${accentColor}40)` }
              : {}
          }
        />
      )}
      <span className="font-medium">{label}</span>
    </button>
  );
}

function DiscoverView({ onViewApp }: { onViewApp: (id: string) => void }) {
  const featured = getFeaturedApps();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[2rem] font-semibold tracking-tight">
          Welcome to the Lab
        </h1>
        <p className="mt-2 text-[0.9375rem] text-white/60">
          A collection of web experiments, interactive demos, and creative
          coding projects
        </p>
      </div>

      {/* Featured */}
      {featured.length > 0 && (
        <section>
          <h2 className="mb-4 text-[1.25rem] font-semibold">
            Featured Experiments
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {featured.map((app) => (
              <FeaturedCard
                key={app.id}
                app={app}
                onClick={() => onViewApp(app.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Categories Grid */}
      <section>
        <h2 className="mb-4 text-[1.25rem] font-semibold">
          Browse by Category
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      {/* All Apps */}
      <section>
        <h2 className="mb-4 text-[1.25rem] font-semibold">All Experiments</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {EXPERIMENT_APPS.map((app) => (
            <AppCard key={app.id} app={app} onClick={() => onViewApp(app.id)} />
          ))}
        </div>
      </section>
    </div>
  );
}

function CategoryView({
  categoryId,
  onViewApp,
}: {
  categoryId: Category;
  onViewApp: (id: string) => void;
}) {
  const category = CATEGORIES.find((c) => c.id === categoryId);
  const apps = EXPERIMENT_APPS.filter((a) => a.category === categoryId);

  if (!category) return null;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <Image
            src={`/assets/icons/apps/${category.icon}.ico`}
            alt=""
            width={48}
            height={48}
            className="rounded-xl"
          />
          <div>
            <h1 className="text-[2rem] font-semibold tracking-tight">
              {category.name}
            </h1>
            <p className="text-[0.9375rem] text-white/60">
              {category.description}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {apps.map((app) => (
          <AppCard key={app.id} app={app} onClick={() => onViewApp(app.id)} />
        ))}
      </div>

      {apps.length === 0 && (
        <div className="py-12 text-center text-white/50">
          No experiments in this category yet. Check back soon!
        </div>
      )}
    </div>
  );
}

function AppDetailView({
  appId,
  onBack,
}: {
  appId: string;
  onBack: () => void;
}) {
  const app = EXPERIMENT_APPS.find((a) => a.id === appId);

  if (!app) return null;

  const category = CATEGORIES.find((c) => c.id === app.category);

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="text-[0.875rem] text-white/60 hover:text-white"
      >
        ← Back
      </button>

      <div className="flex items-start gap-6">
        <Image
          src={`/assets/icons/apps/${app.icon}.ico`}
          alt={app.name}
          width={120}
          height={120}
          className="rounded-2xl"
        />
        <div className="flex-1">
          <h1 className="text-[2.5rem] font-bold tracking-tight">{app.name}</h1>
          <p className="mt-2 text-[1.125rem] text-white/70">{app.tagline}</p>

          <div className="mt-4 flex items-center gap-3">
            <Button
              disabled={!app.available}
              className="rounded-full px-8 disabled:opacity-50"
            >
              {app.available ? "Download" : "Coming Soon"}
            </Button>
            {category && (
              <span className="text-[0.875rem] text-white/50">
                {category.name}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h2 className="mb-3 text-[1.125rem] font-semibold">About</h2>
        <p className="text-[0.9375rem] leading-relaxed text-white/70">
          {app.description}
        </p>

        {app.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {app.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-white/10 px-3 py-1 text-[0.75rem] text-white/80"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SearchResults({
  apps,
  onViewApp,
}: {
  apps: ExperimentApp[];
  onViewApp: (id: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[2rem] font-semibold tracking-tight">
          Search Results
        </h1>
        <p className="mt-1 text-white/60">Found {apps.length} experiments</p>
      </div>

      {apps.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {apps.map((app) => (
            <AppCard key={app.id} app={app} onClick={() => onViewApp(app.id)} />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center text-white/50">
          No experiments found. Try a different search term.
        </div>
      )}
    </div>
  );
}

function AppCard({
  app,
  onClick,
}: {
  app: ExperimentApp;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 text-left transition-all hover:border-white/20 hover:bg-white/10"
    >
      <div className="flex items-start gap-3">
        <Image
          src={`/assets/icons/apps/${app.icon}.ico`}
          alt={app.name}
          width={56}
          height={56}
          className="rounded-xl"
        />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[0.9375rem] font-semibold text-white">
            {app.name}
          </div>
          <div className="mt-0.5 line-clamp-2 text-[0.8125rem] leading-snug text-white/60">
            {app.tagline}
          </div>
          {!app.available && (
            <div className="mt-2 text-[0.75rem] text-white/40">Coming Soon</div>
          )}
        </div>
      </div>
    </button>
  );
}

function FeaturedCard({
  app,
  onClick,
}: {
  app: ExperimentApp;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 text-left transition-all hover:border-white/20 hover:shadow-lg"
    >
      <div className="flex items-start gap-4">
        <Image
          src={`/assets/icons/apps/${app.icon}.ico`}
          alt={app.name}
          width={80}
          height={80}
          className="rounded-2xl"
        />
        <div className="flex-1">
          <div className="text-[0.6875rem] font-semibold tracking-wider text-white/50">
            FEATURED
          </div>
          <div className="mt-1 text-[1.25rem] font-bold text-white">
            {app.name}
          </div>
          <div className="mt-2 line-clamp-2 text-[0.875rem] leading-relaxed text-white/70">
            {app.description}
          </div>
        </div>
      </div>
    </button>
  );
}

function CategoryCard({ category }: { category: CategoryInfo }) {
  return (
    <div
      className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-5 transition-all hover:border-white/20"
      style={{
        background: `linear-gradient(135deg, ${category.color}15, transparent)`,
      }}
    >
      <div className="flex items-center gap-3">
        <Image
          src={`/assets/icons/apps/${category.icon}.ico`}
          alt={category.name}
          width={40}
          height={40}
          className="rounded-lg"
        />
        <div>
          <div className="text-[1rem] font-semibold text-white">
            {category.name}
          </div>
          <div className="mt-0.5 text-[0.8125rem] text-white/60">
            {category.description}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppStoreApp;
