import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface DataTableProps {
  headers: string[];
  rows: React.ReactNode[][];
  className?: string;
}

export const DataTable: React.FC<DataTableProps> = ({ headers, rows, className }) => {
  return (
    <div className={twMerge(clsx("my-5 border border-[#2a3548] rounded-md overflow-hidden", className))}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[0.83rem]">
          <thead>
            <tr className="bg-[#1c2333] border-b border-[#374860]">
              {headers.map((header, index) => (
                <th 
                  key={index} 
                  scope="col"
                  className="px-4 py-2.5 text-left font-mono font-bold text-[#94a3b8] uppercase tracking-wider text-[0.65rem]"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a3548]">
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-[#161b27] transition-colors">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-2.5 text-[#94a3b8] leading-relaxed align-top">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
