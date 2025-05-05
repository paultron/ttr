import { useState } from "react";
import { GoogleGenAI, Type } from "@google/genai";

const API_KEY: string = import.meta.env.VITE_GEMINI_API_KEY;

interface TableProps {
  header: string[];
  rows: string[][];
}

/**
 * Displays a table component.
 * @param tableData The table to display
 * @returns A React Component table
 */
function TableDisplay({ table }: { table: TableProps }) {
  const columns = table.header;
  const rows = table.rows;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y border-collapse border-2 border-neutral-700">
        <thead className="bg-amber-900">
          <tr>
            {columns.map((column, index) => (
              <th
                className="px-6 py-3 text-center text-sm uppercase tracking-widest text-amber-100"
                key={index}
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-neutral-800 text-neutral-200 cursor-pointer">
          {rows.map((row, rowIndex) => (
            <tr
              className="hover:bg-amber-800 transition-colors duration-200"
              key={rowIndex}
            >
              {row.map((cell, cellIndex) => (
                <td
                  className={
                    "px-6 py-4 border border-neutral-700" +
                    (cellIndex === 0 ? " text-2xl" : "")
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
  //const [tableTopP, setTableTopP] = useState(0.95)

  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentTable, setCurrentTable] = useState<TableProps | null>(null);

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
    //const form = ev.target;
    const formData = new FormData(ev.currentTarget);

    const formJson = Object.fromEntries(formData.entries());

    console.log(formJson);

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

    console.log("Generating table with:", { tableTitle, tableDesc, tableRows });

    const prompt = `Generate a table with the name "${tableTitle}" and the description "${tableDesc}". 
The table should have ${tableRows} rows, including a header row.
The first column of the table should be numbered starting with 1. 
The second column should be generated names of items. 
The third column should be descriptions of ${tableItemLength} length. 
Make the descriptions varied and not all starting with the same word, "A"/"The"/"This"/etc.
Only include additional columns if requested in the description.
Do not include the table name or description in the table itself.`;

    try {
      const response = await AI.models.generateContent({
        model: "gemini-2.0-flash-lite",
        contents: prompt,
        config: modelConfig,
      });

      //const result = await model.generateContent(prompt);
      //const response = result.response;
      //console.log(response);
      const text: string = response.text ? response.text : "";
      //console.log("raw", text);

      const tableArray = JSON.parse(text);
      //console.log("Parsed table array:", tableArray);
      setCurrentTable(tableArray);
      setIsBusy(false);
      //return tableArray;
    } catch (err) {
      //console.error("Error parsing JSON:", e);
      setError(
        err instanceof Error
          ? err.message
          : "Error generating table! Check console for details"
      );
      //return [["Error generating table! Check console for details"]];
    } finally {
      setIsBusy(false);
    }
  }

  const exportTableToCSV = (_ev: React.MouseEvent<HTMLButtonElement>) => {
    //console.log("Exporting table to CSV");
    if (!currentTable) {
      console.error("No table to export");
      return;
    }
    const rows = currentTable.rows;
    const header = currentTable.header;
    //const rows = table.rows;
    const csvData = [];

    //const cells = row.querySelectorAll('td, th');
    const headerData = [];
    for (const cell of header) {
      headerData.push(cell);
    }
    csvData.push(headerData.join("\t"));

    for (const row of rows) {
      //const cells = row.querySelectorAll('td, th');
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
    a.download = "table.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col w-full min-h-screen items-center text-center bg-neutral-900 text-neutral-200">
      <header className="w-full bg-neutral-800 shadow-md py-4">
        <h1 className="text-4xl font-bold font-sans text-amber-300">
          TableGenAI
        </h1>
      </header>
      <main className="flex flex-col items-center w-full max-w-4xl px-4 py-8">
        <form
          method="post"
          onSubmit={generateTable}
          className="gap-6 w-full flex flex-col text-lg items-center my-4 p-6 bg-neutral-800 rounded-lg shadow-lg"
        >
          {/* Table Title Input */}
          <label className="w-full flex flex-col items-start">
            <span className="mb-1 font-semibold text-amber-200">
              Table Title:
            </span>
            <input
              name="tableTitle"
              className="block w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="Legendary Loot"
              value={tableTitle}
              required={true}
              autoComplete="off"
              type="text"
              aria-required="true"
              onChange={(e) => setTableTitle(e.target.value)}
            />
          </label>
          {/* Table Description Input */}
          <label className="w-full flex flex-col items-start">
            <span className="mb-1 font-semibold text-amber-200">
              Description:
            </span>
            <textarea
              name="tableDesc"
              className="block w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="Common melee and ranged weapons found in a cyberpunk setting"
              value={tableDesc}
              required={true}
              rows={2}
              aria-required="true"
              spellCheck={true}
              onChange={(e) => setTableDesc(e.target.value)}
            />
          </label>
          {/* Row Count and Temperature Inputs */}
          <div className="flex flex-wrap justify-center gap-6 w-full">
            <label className="flex flex-col items-center">
              <span className="mb-1 font-semibold text-amber-200">Rows:</span>
              <input
                name="tableRows"
                className="block w-24 h-12 text-center px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
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
              <span className="mb-1 font-semibold text-amber-200">
                Item Desc. Length:
              </span>
              <select
                className="block w-48 h-12 text-center px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
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
              <span className="mb-1 font-semibold text-amber-200">Temp:</span>
              <input
                name="tableTemp"
                className="block w-24 h-12 text-center px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
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
          {/* Form Buttons */}
          <div className="flex justify-center gap-4 mt-4 w-full">
            <button
              type="reset"
              onClick={() => {
                setTableTitle("");
                setTableDesc("");
                setTableRows(20);
                setTableTemp(1.0);
                setError(null);
                //setCurrentTable(null);
              }}
              className="rounded-md bg-neutral-600 py-2 px-4 text-sm font-semibold text-orange-400 hover:bg-orange-700 hover:text-neutral-100 transition-colors duration-200"
            >
              Reset form
            </button>
            <button
              type="submit"
              disabled={!canGenerate}
              className="rounded-md bg-amber-600 py-2 px-4 text-sm font-semibold text-neutral-900 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isBusy ? "Generating..." : "Generate Table"}
            </button>
          </div>
        </form>
      </main>
      {!currentTable && (
        <div className="px-4 py-2">No current table, try generating one.</div>
      )}

      {/* Loading Indicator */}
      {isBusy && (
        <p className="my-4 text-lg text-red-500">Generating table...</p>
      )}

      {/* Error Display */}
      {error && <p className="my-4 text-lg text-red-500">Error: {error}</p>}

      {/* Generated Table Display */}
      {currentTable && (
        <div className="my-8 w-full">
          <h2 className="text-2xl font-semibold mb-4 text-amber-300">
            {tableTitle}
          </h2>
          <TableDisplay table={currentTable} />
          <button
            type="button"
            className="mt-4 rounded-md bg-amber-600 py-2 px-4 text-sm font-semibold text-neutral-900 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            onClick={exportTableToCSV}
            disabled={!currentTable}
          >
            Download CSV
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
