"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";

type DemoEvent = {
  id: number;
  orgId: number | null;
  searchId: number | null;
  companyId: number | null;
  createdAt: string | null;
  companyName: string | null;
  title: string | null;
  body: string | null;
  meta: unknown;
};

export function MillionRowGrid({ instanceId: _ }: { instanceId: string }) {
  const [data, setData] = useState<DemoEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useMemo(() => {
    fetch("/api/million-row-grid")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch data");
        return res.json();
      })
      .then((payload) => {
        setData(payload.rows);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  const columns = useMemo<ColumnDef<DemoEvent>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "companyName",
        header: "Company",
        cell: (info) => info.getValue() || "—",
      },
      {
        accessorKey: "title",
        header: "Title",
        cell: (info) => info.getValue() || "—",
      },
      {
        accessorKey: "body",
        header: "Body",
        cell: (info) => {
          const value = info.getValue() as string | null;
          return value ? <div className="max-w-md truncate">{value}</div> : "—";
        },
      },
      {
        accessorKey: "createdAt",
        header: "Created At",
        cell: (info) => {
          const value = info.getValue() as string | null;
          return value ? new Date(value).toLocaleDateString() : "—";
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center text-white">
        <div className="text-lg">Loading data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center text-white">
        <div className="text-lg text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col p-6 text-white">
      <h1 className="mb-6 text-2xl font-bold">
        Demo Events ({data.length} rows)
      </h1>
      <div className="overflow-auto rounded-lg border border-gray-700">
        <table className="w-full">
          <thead className="bg-gray-800">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="border-b border-gray-700 px-4 py-3 text-left font-semibold"
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
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="transition-colors hover:bg-gray-800/50"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="border-b border-gray-700/50 px-4 py-3"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
