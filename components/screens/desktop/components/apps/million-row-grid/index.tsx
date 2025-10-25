"use client";

import type { InfiniteData } from "@tanstack/react-query";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";

const LIMIT_PARAM = "million-limit";
const START_CURSOR_PARAM = "million-start";
const END_CURSOR_PARAM = "million-end";
const DEFAULT_LIMIT = 50;
const MIN_LIMIT = 10;
const MAX_LIMIT = 200;
const START_SYNC_STEP = 20;

type DemoEvent = {
  id: number;
  orgId: number | null;
  searchId: number | null;
  companyId: number | null;
  createdAt: string | null;
  companyName: string | null;
  title: string | null;
  body: string | null;
  meta: Record<string, unknown> | null;
};

type GridResponse = {
  rows: DemoEvent[];
  nextCursor: number | null;
  hasMore: boolean;
};

const formatDate = (value: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function MillionRowGrid({ instanceId: _ }: { instanceId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams?.toString() ?? "";

  const limit = useMemo(() => {
    const params = new URLSearchParams(searchParamsString);
    const raw = params.get(LIMIT_PARAM);
    const value = raw ? Number.parseInt(raw, 10) : Number.NaN;
    if (Number.isFinite(value)) {
      return Math.min(Math.max(value, MIN_LIMIT), MAX_LIMIT);
    }
    return DEFAULT_LIMIT;
  }, [searchParamsString]);

  const startCursor = useMemo(() => {
    const params = new URLSearchParams(searchParamsString);
    const raw = params.get(START_CURSOR_PARAM);
    if (!raw) return null;
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) ? parsed : null;
  }, [searchParamsString]);

  const initialPageCursor = useMemo(() => {
    if (startCursor === null) return null;
    return Math.max(startCursor - 1, 0);
  }, [startCursor]);

  const query = useInfiniteQuery<
    GridResponse,
    Error,
    GridResponse,
    [string, { limit: number; start: number | null }],
    number | null
  >({
    queryKey: ["million-row-grid", { limit, start: startCursor }],
    initialPageParam: initialPageCursor,
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      params.set("limit", String(limit));
      if (pageParam !== null && pageParam !== undefined) {
        params.set("cursor", String(pageParam));
      }

      const response = await fetch(
        `/api/million-row-grid?${params.toString()}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch demo events.");
      }

      const payload = (await response.json()) as GridResponse;
      return payload;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    retry: false,
  });

  const {
    error,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetching,
    isFetchingNextPage,
    isPending,
  } = query;

  const dataPages = useMemo(
    () =>
      ((query.data as InfiniteData<GridResponse> | undefined)?.pages ??
        []) as GridResponse[],
    [query.data],
  );

  const allRows = useMemo(
    () => dataPages.flatMap((page) => page.rows),
    [dataPages],
  );

  const lastRowId =
    allRows.length > 0 ? (allRows[allRows.length - 1]?.id ?? null) : null;

  const columns = useMemo<ColumnDef<DemoEvent>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        cell: (info) => info.getValue(),
        size: 96,
      },
      {
        accessorKey: "companyName",
        header: "Company",
        cell: (info) => info.getValue() || "—",
        size: 240,
      },
      {
        accessorKey: "title",
        header: "Title",
        cell: (info) => info.getValue() || "—",
        size: 320,
      },
      {
        accessorKey: "body",
        header: "Summary",
        cell: (info) => {
          const value = info.getValue() as string | null;
          return value ? (
            <div className="line-clamp-2 text-sm text-slate-200/90">
              {value}
            </div>
          ) : (
            "—"
          );
        },
        size: 480,
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: (info) => formatDate(info.getValue() as string | null),
        size: 200,
      },
    ],
    [],
  );

  const table = useReactTable({
    data: allRows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: "onChange",
  });

  const parentRef = useRef<HTMLDivElement>(null);
  const lastSyncedStartIndexRef = useRef<number | null>(null);
  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? allRows.length + 1 : allRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 88,
    overscan: 12,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const lastVirtualRow = virtualRows[virtualRows.length - 1];

  useEffect(() => {
    if (!query.data) return;

    const params = new URLSearchParams(searchParamsString);
    params.set(LIMIT_PARAM, String(limit));

    const firstVirtualRow = virtualRows.find(
      (virtualRow) => virtualRow.index < allRows.length,
    );
    const candidateIndex = firstVirtualRow?.index ?? null;
    const candidateStartId =
      candidateIndex !== null ? (allRows[candidateIndex]?.id ?? null) : null;

    if (candidateStartId !== null && candidateIndex !== null) {
      const lastSyncedIndex = lastSyncedStartIndexRef.current;
      if (
        lastSyncedIndex === null ||
        Math.abs(candidateIndex - lastSyncedIndex) >= START_SYNC_STEP ||
        !params.has(START_CURSOR_PARAM)
      ) {
        params.set(START_CURSOR_PARAM, String(candidateStartId));
        lastSyncedStartIndexRef.current = candidateIndex;
      }
    } else if (allRows.length === 0) {
      params.delete(START_CURSOR_PARAM);
      lastSyncedStartIndexRef.current = null;
    }

    if (lastRowId !== null) {
      params.set(END_CURSOR_PARAM, String(lastRowId));
    } else {
      params.delete(END_CURSOR_PARAM);
    }

    const nextQuery = params.toString();
    if (nextQuery === searchParamsString) return;

    const target = nextQuery ? `${pathname}?${nextQuery}` : pathname;
    router.replace(target, { scroll: false });
  }, [
    allRows,
    lastRowId,
    limit,
    pathname,
    query.data,
    router,
    searchParamsString,
    virtualRows,
  ]);

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage || !lastVirtualRow) return;
    if (lastVirtualRow.index < allRows.length) return;
    fetchNextPage();
  }, [
    allRows.length,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    lastVirtualRow,
  ]);

  if (isPending && allRows.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center text-white">
        <div className="text-lg">Loading events…</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full w-full items-center justify-center text-white">
        <div className="text-lg text-red-400">
          {(error instanceof Error ? error.message : "Unexpected error.") ||
            "Unable to load data."}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col gap-4 p-6 text-white">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Demo Events</h1>
          <p className="text-sm text-slate-300/80">
            Streaming {allRows.length.toLocaleString()} rows
            {hasNextPage ? " (fetching more…)" : ""}
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-hidden rounded-xl border border-slate-800/80 bg-slate-950/40 backdrop-blur">
        <div className="max-h-full overflow-hidden">
          <table className="min-w-full border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="select-none border-b border-slate-800/80 px-4 py-3 text-left text-sm font-medium uppercase tracking-wide text-slate-300"
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
          </table>
        </div>
        <div ref={parentRef} className="relative max-h-full overflow-y-auto">
          <div
            style={{
              height: rowVirtualizer.getTotalSize(),
              position: "relative",
            }}
          >
            {virtualRows.map((virtualRow) => {
              const row = table.getRowModel().rows[virtualRow.index];
              const isLoaderRow = virtualRow.index >= allRows.length;

              if (isLoaderRow) {
                return (
                  <div
                    key={virtualRow.key}
                    ref={rowVirtualizer.measureElement}
                    className="absolute left-0 right-0 flex items-center justify-center border-b border-slate-800/60 bg-slate-900/60 text-sm text-slate-300"
                    style={{ transform: `translateY(${virtualRow.start}px)` }}
                  >
                    {isFetchingNextPage ? "Loading more…" : "All caught up"}
                  </div>
                );
              }

              return (
                <table
                  key={row.id}
                  ref={rowVirtualizer.measureElement}
                  className="absolute left-0 right-0"
                  style={{ transform: `translateY(${virtualRow.start}px)` }}
                >
                  <tbody>
                    <tr className="border-b border-slate-800/60 bg-slate-900/40 transition-colors hover:bg-slate-900/70">
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-4 py-4 text-sm text-slate-200"
                          style={{ width: cell.column.getSize() }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              );
            })}
          </div>
        </div>
      </div>

      <footer className="flex items-center justify-between text-xs text-slate-400">
        <span>{isFetching ? "Syncing…" : "Up to date"}</span>
        <span>
          Limit {limit} • Start {startCursor ?? "—"} • End {lastRowId ?? "—"}
        </span>
      </footer>
    </div>
  );
}
