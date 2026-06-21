import React from 'react';
import { Loader2 } from 'lucide-react';

export default function DataTable({ columns, data, loading, emptyMessage = 'Tidak ada data' }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/50">
            {columns.map((col, i) => (
              <th key={i} className="px-4 py-3 text-left font-semibold text-foreground whitespace-nowrap">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((row, rowIdx) => (
            <tr key={row.id || rowIdx} className="hover:bg-muted/30 transition-colors">
              {columns.map((col, colIdx) => (
                <td key={colIdx} className="px-4 py-3 text-foreground">
                  {col.cell ? col.cell(row, rowIdx) : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}