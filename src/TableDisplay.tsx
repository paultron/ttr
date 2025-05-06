import React from 'react';

export interface TableProps {
  tableTitle: string;
  tableDesc: string;
  tableData: { header: string[]; rows: string[][] };
}

/**
 * Displays a table component.
 * @param table The table to display
 * @returns A React Component table
 */
const TableDisplay = ({ table }: { table: TableProps }) => {
  return (
    <div className="overflow-x-auto">
      <h2 className="text-2xl font-semibold mb-4 text-amber-300" style={{ textShadow: '1px 1px 2px #4a3b0c' }}>
        {table.tableTitle}
      </h2>
      <p className="text-lg mb-4 text-neutral-200">{table.tableDesc}</p>
      <table className="min-w-full border-collapse">
        <thead className="bg-amber-900">
          <tr>
            {table.tableData.header.map((column, index) => (
              <th
                className="px-6 py-3 text-center text-sm uppercase tracking-widest text-amber-100 border-b-4 border-neutral-700"
                style={{ textShadow: '1px 1px 1px #000' }}
                key={index}
              >
                {index === 0 ? "Number" : column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-neutral-200 cursor-pointer">
          {table.tableData.rows.map((row, rowIndex) => (
            <tr
              className={`transition-colors duration-200 ${
                rowIndex % 2 === 0 ? "bg-neutral-800" : "bg-neutral-700"
              } hover:bg-amber-800`}
              key={rowIndex}
            >
              {row.map((cell, cellIndex) => (
                <td
                  className={
                    "px-6 py-4 border-t border-neutral-600" +
                    (cellIndex === 0 ? " text-3xl text-amber-400 font-semibold" : "")
                  }
                  key={cellIndex}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableDisplay;
