"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo } from "react";

type Person = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export function MillionRowGrid({ instanceId: _ }: { instanceId: string }) {
  const data = useMemo<Person[]>(
    () => [
      {
        id: 1,
        name: "Alice Johnson",
        email: "alice@example.com",
        role: "Developer",
      },
      { id: 2, name: "Bob Smith", email: "bob@example.com", role: "Designer" },
      {
        id: 3,
        name: "Carol Williams",
        email: "carol@example.com",
        role: "Manager",
      },
      {
        id: 4,
        name: "David Brown",
        email: "david@example.com",
        role: "Developer",
      },
      {
        id: 5,
        name: "Eve Davis",
        email: "eve@example.com",
        role: "QA Engineer",
      },
    ],
    [],
  );

  const columns = useMemo<ColumnDef<Person>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: (info) => info.getValue(),
      },
    ],
    [],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex h-full w-full flex-col p-6 text-white">
      <h1 className="mb-6 text-2xl font-bold">Simple Table</h1>
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
