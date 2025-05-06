import { useState } from "react";
import { GoogleGenAI, Type } from "@google/genai"; // Use newer API instead of deprecated "@google/generativeai"

const API_KEY: string = import.meta.env.VITE_GEMINI_API_KEY;

interface TableProps {
  tableTitle: string;
  tableDesc: string;
  tableData: { header: string[]; rows: string[][] };
}

/**
 * Displays a table component.
 * @param tableData The table to display
 * @returns A React Component table
 */
function TableDisplay({ table }: { table: TableProps }) {
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
}

function App() {
  const [tableTitle, setTableTitle] = useState("");
  const [tableDesc, setTableDesc] = useState("");
  const [tableRows, setTableRows] = useState(5);
  const [tableItemLength, setTableItemLength] = useState("Short to medium");
  const [tableTemp, setTableTemp] = useState(1.0);

  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentTable, setCurrentTable] = useState<TableProps | null>(null);
  const [showForm, setShowForm] = useState(true);

  const canGenerate =
    tableTitle.trim() != "" && tableDesc.trim() != "" && !isBusy;

  /**
   * Generates a table based on user input using the Generative AI model.
   * @param ev The form event.
   * @returns A generated table
   */
  async function generateTable(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setIsBusy(true);
    setError(null);

    const AI = new GoogleGenAI({ apiKey: API_KEY });
    const modelConfig = {
      temperature: tableTemp,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          header: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
            },
          },
          rows: {
            type: Type.ARRAY,
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
            },
          },
        },
        required: ["header", "rows"],
      },
    };

    const prompt = `Generate a table with the name "${tableTitle}" and the description "${tableDesc}".
The table should have ${tableRows} rows, including a header row.
The first column of the table should be numbered starting with 1.
The second column should be names.
The third column should be descriptions of ${tableItemLength} length.
The descriptions should varied and not all starting with the same word, "A"/"The"/"This"/etc.
Only include additional columns if requested in the description.`;

    try {
      const response = await AI.models.generateContent({
        model: "gemini-2.0-flash-lite",
        contents: prompt,
        config: modelConfig,
      });

      const text: string = response.text ? response.text : "";

      const tableArray = JSON.parse(text);

      const newTable: TableProps = {
        tableTitle,
        tableDesc,
        tableData: tableArray,
      };
      newTable.tableData.header[0] = "Number";

      setCurrentTable(newTable);
      setShowForm(false); 
      setIsBusy(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error generating table! Check console for details"
      );
    } finally {
      setIsBusy(false);
    }
  }

  const exportTableToCSV = (_ev: React.MouseEvent<HTMLButtonElement>) => {
    if (!currentTable) {
      console.error("No table to export");
      return;
    }
    const rows = currentTable.tableData.rows;
    const header = currentTable.tableData.header;
    const csvData = [];
    const headerData = [];
    for (const cell of header) {
      headerData.push(cell);
    }
    csvData.push(headerData.join("\t"));
    for (const row of rows) {
      const rowData = [];
      for (const cell of row) {
        rowData.push(cell);
      }
      csvData.push(rowData.join("\t"));
    }
    const csvString = csvData.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = currentTable.tableTitle + ".csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetForm = () => {
    setTableTitle("");
    setTableDesc("");
    setTableRows(5);
    setTableItemLength("Short to medium");
    setTableTemp(1.0);
    setError(null);
  };

  return (
    <div className="flex flex-col w-full min-h-screen items-center text-center bg-neutral-900 text-neutral-200">
      <header className="w-full bg-neutral-800 shadow-md py-4">
        <h1 className="text-4xl font-bold font-sans text-amber-300" style={{ textShadow: '2px 2px 3px #4a3b0c' }}>
          TableGenAI
        </h1>
      </header>
      <main className="flex flex-col items-center w-full max-w-4xl px-4 py-8">
        {currentTable && showForm && (
          <button
            onClick={() => setShowForm(false)}
            className="mb-4 rounded-md bg-neutral-700 py-2 px-4 text-sm font-semibold text-amber-200 hover:bg-neutral-600 transition-colors duration-200"
          >
            Hide Form Options
          </button>
        )}

        {showForm ? (
          <form
            method="post"
            onSubmit={generateTable}
            className="gap-6 w-full flex flex-col text-lg items-center my-4 p-6 bg-neutral-800 rounded-lg shadow-lg"
          >
            <label className="w-full flex flex-col items-start">
              <span className="mb-2 font-semibold text-amber-200">
                Table Title:
              </span>
              <input
                name="tableTitle"
                className="block w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-200"
                placeholder="Legendary Loot"
                value={tableTitle}
                required={true}
                autoComplete="off"
                type="text"
                aria-required="true"
                onChange={(e) => setTableTitle(e.target.value)}
              />
            </label>
            <label className="w-full flex flex-col items-start">
              <span className="mb-2 font-semibold text-amber-200">
                Description:
              </span>
              <textarea
                name="tableDesc"
                className="block w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-200"
                placeholder="Common melee and ranged weapons found in a cyberpunk setting"
                value={tableDesc}
                required={true}
                rows={2}
                aria-required="true"
                spellCheck={true}
                onChange={(e) => setTableDesc(e.target.value)}
              />
            </label>
            <div className="flex flex-wrap justify-center gap-6 w-full">
              <label className="flex flex-col items-center">
                <span className="mb-2 font-semibold text-amber-200">Rows:</span>
                <input
                  name="tableRows"
                  className="block w-24 h-12 text-center px-3 py-2 bg-neutral-700 border border-neutral-600
                  rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-200"
                  placeholder="20"
                  value={tableRows}
                  type="number"
                  required={true}
                  aria-required="true"
                  min={1}
                  max={50}
                  step={1}
                  onChange={(e) => setTableRows(Number(e.target.value))}
                />
              </label>
              <label className="flex flex-col items-center">
                <span className="mb-2 font-semibold text-amber-200">
                  Item Desc. Length:
                </span>
                <select
                  className="block w-48 h-12 text-center px-3 py-2 bg-neutral-700 border border-neutral-600
                  rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-200"
                  name="tableItemLength"
                  value={tableItemLength}
                  onChange={(e) => setTableItemLength(e.target.value)}
                >
                  <option value="Short">Short</option>
                  <option value="Short to medium">Short to medium</option>
                  <option value="Medium">Medium</option>
                  <option value="Medium to long">Medium to long</option>
                  <option value="Long">Long</option>
                </select>
              </label>
              <label className="flex flex-col items-center">
                <span className="mb-2 font-semibold text-amber-200">Temp:</span>
                <input
                  name="tableTemp"
                  className="block w-24 h-12 text-center px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-200"
                  placeholder="1.0"
                  value={tableTemp}
                  type="number"
                  required={true}
                  min={0.0}
                  max={2.0}
                  step={0.05}
                  onChange={(e) => setTableTemp(Number(e.target.value))}
                  aria-required="true"
                />
              </label>
            </div>
            <div className="flex flex-col items-center gap-4 mt-4 w-full">
              <button
                type="submit"
                disabled={!canGenerate}
                className="rounded-md bg-amber-600 py-3 px-6 text-lg font-semibold text-white
                hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                style={{ textShadow: '1px 1px 2px #78350f' }}
              >
                {isBusy ? "Generating..." : "Generate Table"}
              </button>
              <button
                type="button"
                onClick={handleResetForm}
                className="text-sm text-neutral-500 hover:text-neutral-400 transition-colors duration-200 underline"
              >
                Reset form
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="my-4 rounded-md bg-neutral-700 py-2 px-4 text-sm font-semibold text-amber-200
            hover:bg-neutral-600 transition-colors duration-200"
          >
            {currentTable ? "Edit / Generate New Table" : "Show Form to Generate Table"}
          </button>
        )}
      </main>

      {!currentTable && !isBusy && !showForm && (
         <div className="px-4 py-2">Click "Show Form to Generate Table" above to start.</div>
      )}
      
      {/* Loading Indicator */}
      {isBusy && (
        <p className="my-4 text-lg text-red-500">Generating table...</p>
      )}

      {/* Error Display */}
      {error && <p className="my-4 text-lg text-red-500">Error: {error}</p>}

      {/* Generated Table Display */}
      {currentTable && (
        <div className="my-8 w-full max-w-4xl">
          <TableDisplay table={currentTable} />
          <div className="flex justify-center mt-6">
            <button
              type="button"
              className="rounded-md bg-amber-600 py-2 px-4 text-sm font-semibold text-neutral-900 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              onClick={exportTableToCSV}
              disabled={!currentTable}
            >
              Download CSV
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
