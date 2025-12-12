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

  const initialStartCursorRef = useRef(startCursor);
  const initialStartCursor = initialStartCursorRef.current;

  const initialPageCursor = useMemo(() => {
    if (initialStartCursor === null) return null;
    return Math.max(initialStartCursor - 1, 0);
  }, [initialStartCursor]);

  const query = useInfiniteQuery<
    GridResponse,
    Error,
    GridResponse,
    [string, { limit: number; start: number | null }],
    number | null
  >({
    queryKey: ["million-row-grid", { limit, start: initialStartCursor }],
    initialPageParam: initialPageCursor,
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      params.set("limit", String(limit));
      if (pageParam !== null && pageParam !== undefined) {
        params.set("cursor", String(pageParam));
      }

      const response = await fetch(
        `/api/million-row-grid?${params.toString()}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch demo events.");
      }

      const payload = (await response.json()) as GridResponse;
      return payload;
    },
    getNextPageParam: lastPage => lastPage.nextCursor,
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
    [query.data]
  );

  const allRows = useMemo(
    () => dataPages.flatMap(page => page.rows),
    [dataPages]
  );

  const lastRowId =
    allRows.length > 0 ? allRows[allRows.length - 1]?.id ?? null : null;

  const columns = useMemo<ColumnDef<DemoEvent>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        cell: info => (
          <span className="font-mono text-xs text-white/40">
            #{String(info.getValue())}
          </span>
        ),
        size: 80,
      },
      {
        accessorKey: "companyName",
        header: "Company",
        cell: info => {
          const value = info.getValue() as string | null;
          return value ? (
            <span className="font-medium text-white/90">{value}</span>
          ) : (
            <span className="text-white/30">—</span>
          );
        },
        size: 200,
      },
      {
        accessorKey: "title",
        header: "Title",
        cell: info => {
          const value = info.getValue() as string | null;
          return value ? (
            <span className="text-white/80">{value}</span>
          ) : (
            <span className="text-white/30">—</span>
          );
        },
        size: 360,
      },
      {
        accessorKey: "body",
        header: "Description",
        cell: info => {
          const value = info.getValue() as string | null;
          return value ? (
            <div className="line-clamp-2 text-xs leading-relaxed text-white/60">
              {value}
            </div>
          ) : (
            <span className="text-white/30">—</span>
          );
        },
        size: 440,
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: info => {
          const value = info.getValue() as string | null;
          return value ? (
            <span className="text-xs text-white/50">{formatDate(value)}</span>
          ) : (
            <span className="text-white/30">—</span>
          );
        },
        size: 160,
      },
    ],
    []
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

  // Clean up URL params on unmount so they don't persist after closing the app
  useEffect(() => {
    return () => {
      const params = new URLSearchParams(window.location.search);
      params.delete(LIMIT_PARAM);
      params.delete(START_CURSOR_PARAM);
      params.delete(END_CURSOR_PARAM);

      const nextQuery = params.toString();
      const target = nextQuery ? `${pathname}?${nextQuery}` : pathname;
      window.history.replaceState(null, "", target);
    };
  }, [pathname]);

  useEffect(() => {
    if (!query.data) return;

    const params = new URLSearchParams(searchParamsString);
    params.set(LIMIT_PARAM, String(limit));

    const firstVirtualRow = virtualRows.find(
      virtualRow => virtualRow.index < allRows.length
    );
    const candidateIndex = firstVirtualRow?.index ?? null;
    const candidateStartId =
      candidateIndex !== null ? allRows[candidateIndex]?.id ?? null : null;

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
        <div className="text-sm text-white/70">Loading events…</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full w-full items-center justify-center text-white">
        <div className="text-sm text-red-400/90">
          {(error instanceof Error ? error.message : "Unexpected error.") ||
            "Unable to load data."}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col bg-white/5 text-white backdrop-blur-[24rem] pt-8">
      <header className="flex items-center justify-between border-b border-white/10 bg-black/20 px-4 py-2.5 backdrop-blur-xl">
        <div>
          <h1 className="text-sm font-medium tracking-tight text-white/90">
            Demo Events
          </h1>
          <p className="mt-0.5 text-xs text-white/50">
            <span className="font-medium text-white/70">
              {allRows.length.toLocaleString()}
            </span>{" "}
            rows
            {hasNextPage && (
              <span className="ml-2 inline-flex items-center gap-1">
                <span className="inline-block h-1 w-1 animate-pulse rounded-full bg-white/60" />
                <span className="text-white/60">streaming</span>
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-md bg-white/5 px-2 py-1 text-xs backdrop-blur-sm">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="font-medium text-white/70">
              {isFetching ? "Syncing" : "Live"}
            </span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-hidden">
          <div className="max-h-full overflow-hidden">
            <table className="min-w-full border-collapse">
              <thead className="sticky top-0 z-10 bg-black/30 backdrop-blur-xl">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th
                        key={header.id}
                        className="border-b border-white/10 px-3 py-2 text-left text-xs font-medium tracking-wide text-white/50"
                        style={{ width: header.getSize() }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
            </table>
          </div>
          <div
            ref={parentRef}
            className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30 relative max-h-full overflow-y-auto"
          >
            <div
              style={{
                height: rowVirtualizer.getTotalSize(),
                position: "relative",
              }}
            >
              {virtualRows.map(virtualRow => {
                const row = table.getRowModel().rows[virtualRow.index];
                const isLoaderRow = virtualRow.index >= allRows.length;

                if (isLoaderRow) {
                  return (
                    <div
                      key={virtualRow.key}
                      ref={rowVirtualizer.measureElement}
                      className="absolute left-0 right-0 flex items-center justify-center border-b border-white/10 bg-white/5 py-4 text-xs text-white/50 backdrop-blur-xl"
                      style={{ transform: `translateY(${virtualRow.start}px)` }}
                    >
                      {isFetchingNextPage ? (
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 animate-spin rounded-full border border-white/30 border-t-white/70" />
                          <span>Loading more rows</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-white/60">
                          <svg
                            className="h-3 w-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            aria-label="Check"
                          >
                            <title>Check</title>
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>All caught up</span>
                        </div>
                      )}
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
                      <tr className="group border-b border-white/5 transition-colors duration-150 hover:bg-white/5">
                        {row.getVisibleCells().map(cell => (
                          <td
                            key={cell.id}
                            className="px-3 py-2.5"
                            style={{ width: cell.column.getSize() }}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
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
      </div>

      <footer className="flex items-center justify-between border-t border-white/10 bg-black/20 px-4 py-2 text-xs backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <span className="font-mono text-white/40">
            Cursor: <span className="text-white/60">{startCursor ?? "—"}</span>{" "}
            → <span className="text-white/60">{lastRowId ?? "—"}</span>
          </span>
          <span className="text-white/20">•</span>
          <span className="text-white/40">
            Page size: <span className="text-white/60">{limit}</span>
          </span>
        </div>
        <div className="font-mono text-white/40">
          Virtualized • Cursor-based pagination
        </div>
      </footer>
    </div>
  );
}
