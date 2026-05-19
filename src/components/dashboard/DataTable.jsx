"use client";

import React from "react";
import Card from "@/components/ui/Card";
import { formatDate } from "@/utils/helpers";

export default function DataTable({ title, columns, data, pagination }) {
  return (
    <Card>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              {columns.map((col) => (
                <th
                  key={col.accessor}
                  className="text-left py-3 px-4 font-semibold text-gray-700 text-sm"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr
                key={idx}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={`${idx}-${col.accessor}`}
                    className="py-3 px-4 text-sm text-gray-700"
                  >
                    {col.render
                      ? col.render(row[col.accessor], row)
                      : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
          <span>
            Showing {(pagination.page - 1) * pagination.pageSize + 1} to{" "}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)}{" "}
            of {pagination.total}
          </span>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 transition-colors">
              Previous
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 transition-colors">
              Next
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
