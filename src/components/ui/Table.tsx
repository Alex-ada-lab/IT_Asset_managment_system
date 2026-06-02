'use client';

import React from 'react';
import Spinner from './Spinner';

export interface TableColumn<T> {
  key: string;
  header: string;
  render?: (row: T, index: number) => React.ReactNode;
  className?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface TableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  keyExtractor?: (row: T, index: number) => string | number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Table<T = any>({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No records found.',
  onRowClick,
  keyExtractor,
}: TableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 bg-white text-sm">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={[
                  'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500',
                  col.className ?? '',
                ].join(' ')}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="py-12 text-center">
                <div className="flex justify-center">
                  <Spinner size="lg" className="text-primary-600" />
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="py-12 text-center text-slate-500"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={keyExtractor ? keyExtractor(row, idx) : idx}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={[
                  'transition-colors',
                  onRowClick
                    ? 'cursor-pointer hover:bg-slate-50'
                    : '',
                ].join(' ')}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={['px-4 py-3 text-slate-700', col.className ?? ''].join(
                      ' '
                    )}
                  >
                    {col.render
                      ? col.render(row, idx)
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      : ((row as any)[col.key] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
