"use client";

import { ArrowLeft, Search, Sparkles } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

  const currentCategory =
    view.type === "category" && view.categoryId
      ? CATEGORIES.find((c) => c.id === view.categoryId)
      : null;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#1D1F21]">
      {/* Titlebar toolbar */}
      <div className="flex w-full items-center justify-between gap-3 px-3 py-1.5 pointer-events-none">
        <div className="flex items-center gap-2 pl-16">
          {view.type !== "discover" && (
            <Button
              size="icon"
              variant="ghost"
              className="size-7 rounded-full text-white/90 hover:bg-white/10 pointer-events-auto"
              onClick={() => setView({ type: "discover" })}
              aria-label="Back to Discover"
            >
              <ArrowLeft className="size-4" />
            </Button>
          )}
          {currentCategory && (
            <div className="flex items-center gap-2 text-[0.8125rem] text-white/80 pointer-events-none">
              <span>{currentCategory.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex h-full w-full overflow-hidden">
        {/* Sidebar */}
        <aside className="flex w-[180px] flex-col border-r border-white/5 bg-white/[0.02] rounded-2xl m-2 mb-3 mt-0 mr-0">
          <div className="flex flex-col gap-4 p-3">
            <div className="relative w-[14rem] max-w-[40vw] pointer-events-auto">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-white/50" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search experiments..."
                className="h-7 w-full rounded-lg bg-black/20 pl-8 text-[0.8125rem] text-white placeholder:text-white/50 border-white/10"
              />
            </div>
            <SidebarSection title="Discover">
              <SidebarItem
                label="Featured"
                icon={<Sparkles className="size-4 text-purple-400" />}
                active={view.type === "discover"}
                onClick={() => setView({ type: "discover" })}
              />
            </SidebarSection>

            <SidebarSection title="Categories">
              {CATEGORIES.map((cat) => (
                <SidebarItem
                  key={cat.id}
                  label={cat.name}
                  icon={
                    <Image
                      src={`/assets/icons/apps/${cat.icon}.ico`}
                      alt=""
                      width={16}
                      height={16}
                      className="size-4"
                    />
                  }
                  active={
                    view.type === "category" && view.categoryId === cat.id
                  }
                  onClick={() =>
                    setView({ type: "category", categoryId: cat.id })
                  }
                  color={cat.color}
                />
              ))}
            </SidebarSection>
          </div>

          <div className="mt-auto border-t border-white/5 p-3 text-[0.6875rem] text-white/40">
            <div className="font-medium text-white/60">Experiment Lab</div>
            <div className="mt-0.5">by Mohamed Bechir Mejri</div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="relative flex-1 overflow-auto">
          <div className="p-6">
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
    </div>
  );
}

function SidebarSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <div className="mb-1.5 px-2 text-[0.6875rem] font-semibold uppercase tracking-wider text-white/40">
        {title}
      </div>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

function SidebarItem({
  label,
  icon,
  active,
  onClick,
  color,
}: {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  color?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-[0.8125rem] transition-colors",
        active
          ? "bg-white/10 text-white"
          : "text-white/70 hover:bg-white/5 hover:text-white/90",
      )}
    >
      <span className={cn("flex-shrink-0", color && `text-[${color}]`)}>
        {icon}
      </span>
      <span className="truncate font-medium">{label}</span>
    </button>
  );
}

function DiscoverView({ onViewApp }: { onViewApp: (id: string) => void }) {
  const featured = getFeaturedApps();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[2.5rem] font-bold tracking-tight text-white">
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
          <h2 className="mb-4 text-[1.375rem] font-semibold text-white">
            Featured Experiments
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
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
        <h2 className="mb-4 text-[1.375rem] font-semibold text-white">
          Browse by Category
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {CATEGORIES.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      {/* All Apps */}
      <section>
        <h2 className="mb-4 text-[1.375rem] font-semibold text-white">
          All Experiments
        </h2>
        <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(140px,1fr))]">
          {EXPERIMENT_APPS.map((app) => (
            <GridAppCard
              key={app.id}
              app={app}
              onClick={() => onViewApp(app.id)}
            />
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
      <div className="flex items-center gap-4">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-white/10 to-white/5">
          <Image
            src={`/assets/icons/apps/${category.icon}.ico`}
            alt=""
            width={40}
            height={40}
          />
        </div>
        <div>
          <h1 className="text-[2.5rem] font-bold tracking-tight text-white">
            {category.name}
          </h1>
          <p className="text-[0.9375rem] text-white/60">
            {category.description}
          </p>
        </div>
      </div>

      <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(140px,1fr))]">
        {apps.map((app) => (
          <GridAppCard
            key={app.id}
            app={app}
            onClick={() => onViewApp(app.id)}
          />
        ))}
      </div>

      {apps.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-[3rem] opacity-20">🧪</div>
          <p className="mt-4 text-white/50">
            No experiments in this category yet.
          </p>
          <p className="mt-1 text-[0.875rem] text-white/40">Check back soon!</p>
        </div>
      )}
    </div>
  );
}

function AppDetailView({
  appId,
  onBack: _,
}: {
  appId: string;
  onBack: () => void;
}) {
  const app = EXPERIMENT_APPS.find((a) => a.id === appId);

  if (!app) return null;

  const category = CATEGORIES.find((c) => c.id === app.category);
  const relatedApps = EXPERIMENT_APPS.filter(
    (a) => a.category === app.category && a.id !== app.id,
  ).slice(0, 6);

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-6">
        <div className="flex size-32 items-center justify-center rounded-3xl bg-gradient-to-br from-white/10 to-white/5 p-4 shadow-2xl">
          <Image
            src={`/assets/icons/apps/${app.icon}.ico`}
            alt={app.name}
            width={96}
            height={96}
            className="size-full"
          />
        </div>
        <div className="flex-1 space-y-4">
          <div>
            <h1 className="text-[2.5rem] font-bold leading-none tracking-tight text-white">
              {app.name}
            </h1>
            <p className="mt-3 text-[1.125rem] text-white/70">{app.tagline}</p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              disabled={!app.available}
              size="lg"
              className="rounded-full px-8 text-[0.9375rem] font-semibold disabled:opacity-50"
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

      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-6">
            <h2 className="mb-3 text-[1.125rem] font-semibold text-white">
              About
            </h2>
            <p className="text-[0.9375rem] leading-relaxed text-white/70">
              {app.description}
            </p>
          </div>

          {relatedApps.length > 0 && (
            <div>
              <h2 className="mb-4 text-[1.125rem] font-semibold text-white">
                More in {category?.name}
              </h2>
              <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(140px,1fr))]">
                {relatedApps.map((relApp) => (
                  <GridAppCard
                    key={relApp.id}
                    app={relApp}
                    onClick={() => {}}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-5">
            <h3 className="mb-3 text-[0.875rem] font-semibold uppercase tracking-wide text-white/60">
              Information
            </h3>
            <div className="space-y-3 text-[0.875rem]">
              <div>
                <div className="text-white/50">Category</div>
                <div className="mt-0.5 font-medium text-white">
                  {category?.name}
                </div>
              </div>
              <div>
                <div className="text-white/50">Status</div>
                <div className="mt-0.5 font-medium text-white">
                  {app.available ? "Available" : "In Development"}
                </div>
              </div>
            </div>
          </div>

          {app.tags.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-5">
              <h3 className="mb-3 text-[0.875rem] font-semibold uppercase tracking-wide text-white/60">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {app.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-white/10 px-3 py-1 text-[0.75rem] font-medium text-white/80"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
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
        <h1 className="text-[2.5rem] font-bold tracking-tight text-white">
          Search Results
        </h1>
        <p className="mt-1 text-white/60">
          {apps.length} {apps.length === 1 ? "experiment" : "experiments"} found
        </p>
      </div>

      {apps.length > 0 ? (
        <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(140px,1fr))]">
          {apps.map((app) => (
            <GridAppCard
              key={app.id}
              app={app}
              onClick={() => onViewApp(app.id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-[3rem] opacity-20">🔍</div>
          <p className="mt-4 text-white/50">No experiments found</p>
          <p className="mt-1 text-[0.875rem] text-white/40">
            Try a different search term
          </p>
        </div>
      )}
    </div>
  );
}

function GridAppCard({
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
      className="group flex flex-col items-center gap-2 rounded-xl p-3 text-center transition-all hover:bg-white/5"
    >
      <div className="relative flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-white/10 to-white/5 transition-transform group-hover:scale-105">
        <Image
          src={`/assets/icons/apps/${app.icon}.ico`}
          alt={app.name}
          width={56}
          height={56}
          className="size-14"
        />
      </div>
      <div className="w-full space-y-0.5">
        <div className="truncate text-[0.8125rem] font-semibold text-white">
          {app.name}
        </div>
        {!app.available && (
          <div className="text-[0.6875rem] text-white/40">Coming Soon</div>
        )}
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
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 text-left transition-all hover:border-white/20 hover:from-white/15 hover:to-white/10"
    >
      <div className="flex items-start gap-5">
        <div className="flex size-20 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-white/20 to-white/10 transition-transform group-hover:scale-105">
          <Image
            src={`/assets/icons/apps/${app.icon}.ico`}
            alt={app.name}
            width={64}
            height={64}
            className="size-16"
          />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="text-[0.6875rem] font-semibold uppercase tracking-wider text-purple-300">
            Featured
          </div>
          <div className="text-[1.25rem] font-bold leading-tight text-white">
            {app.name}
          </div>
          <p className="line-clamp-2 text-[0.875rem] leading-relaxed text-white/70">
            {app.description}
          </p>
        </div>
      </div>
    </button>
  );
}

function CategoryCard({ category }: { category: CategoryInfo }) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-4 transition-all hover:border-white/20 hover:from-white/10">
      <div className="flex items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-xl bg-white/10">
          <Image
            src={`/assets/icons/apps/${category.icon}.ico`}
            alt={category.name}
            width={32}
            height={32}
            className="size-8"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[0.9375rem] font-semibold text-white">
            {category.name}
          </div>
          <div className="mt-0.5 truncate text-[0.75rem] text-white/60">
            {EXPERIMENT_APPS.filter((a) => a.category === category.id).length}{" "}
            experiments
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppStoreApp;
