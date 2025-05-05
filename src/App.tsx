import { useState } from "react";
import { GoogleGenAI, Type } from "@google/genai";

const API_KEY: string = import.meta.env.VITE_GEMINI_API_KEY;

interface TableProps {
  tableData: {
    header: string[];
    rows: string[][];
  };
}

function TableDisplay({ tableData }: TableProps) {
  const columns = tableData.header;
  const rows = tableData.rows;

  return (
    <table className="table-auto border-collapse border-2 border-stone-900">
      <thead className="p-2">
        <tr>
          {columns.map((column, index) => (
            <th key={index}>{column}</th>
          ))}
        </tr>
      </thead>

      <tbody>
        {rows.map((row, rowIndex) => (
          <tr className="bg-stone-600 rounded-md border-1" key={rowIndex}>
            {row.map((cell, cellIndex) => (
              <td className="px-2 py-4" key={cellIndex}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}


function App() {
  const [tableTitle, setTableTitle] = useState("");
  const [tableDesc, setTableDesc] = useState("");
  const [tableRows, setTableRows] = useState(5);

  const [isBusy, setIsBusy] = useState(false);

  const [currentTable, setCurrentTable] = useState<
    TableProps["tableData"] | null
  >(null);

  const canGenerate = tableTitle != "" && tableDesc != "" && !isBusy;

  async function generateTable(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setIsBusy(true);
    //const form = ev.target;
    const formData = new FormData(ev.currentTarget);

    const formJson = Object.fromEntries(formData.entries());

    console.log(formJson);

    const AI = new GoogleGenAI({ apiKey: API_KEY });

    console.log("Generating table with:", { tableTitle, tableDesc, tableRows });

    const prompt = `Generate a D&D/TTRPG style table with the name "${tableTitle}" and the description "${tableDesc}". 
The table should have ${tableRows} rows, including a header row.
The first column of the table should be numbered starting with 1. 
The second column should be generated names of items. 
The third column should be descriptions of short to medium length. 
Make the descriptions varied and not all starting with the same word, "A"/"The"/"This", etc.
Only include additional columns if requested in the description.
Do not include the table name or description in the table itself.`;

    const response = await AI.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: prompt,
      config: {
        temperature: 0.75,
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
      },
    });

    //const result = await model.generateContent(prompt);
    //const response = result.response;
    console.log(response);
    const text: string = response.text ? response.text : "";
    console.log("raw", text);

    try {
      const tableArray = JSON.parse(text);
      console.log("Parsed table array:", tableArray);
      setCurrentTable(tableArray);
      setIsBusy(false);
      return tableArray;
    } catch (e) {
      console.error("Error parsing JSON:", e);
      return [["Error generating table! Check console for details"]];
    }
  }

  const exportTableToCSV = (ev: React.MouseEvent<HTMLButtonElement>) => {
    console.log("Exporting table to CSV");
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
  }

  return (
    <div className="flex flex-col items-center text-center bg-stone-800">
      <header>
        <h1 className="text-4xl font-bold font-sans text-slate-200">
          TableGenAI
        </h1>
      </header>
      <form
        method="post"
        onSubmit={generateTable}
        className="gap-4 flex flex-col text-lg items-center my-4"
      >
        <label className="text-2xl text-slate-300">
          Title
          <input
            name="tableTitle"
            className="block text-center my-2 border-2 
            text-slate-700
            bg-slate-400 border-slate-700 rounded-md"
            placeholder="Legendary Loot"
            value={tableTitle}
            required={true}
            onChange={(e) => setTableTitle(e.target.value)}
          />
        </label>
        <label className="text-2xl text-slate-300">
          Description
          <input
            name="tableDesc"
            className="w-auto block text-center my-2 border-2 
            text-slate-700
            bg-slate-400 border-slate-700 rounded-md"
            placeholder="Items that are legendary, rare, or unique."
            value={tableDesc}
            required={true}
            spellCheck={true}
            onChange={(e) => setTableDesc(e.target.value)}
          />
        </label>
        <label className="text-2xl text-slate-300">
          Rows
          <input
            name="tableRows"
            className="block w-24 text-slate-700 text-center my-2 border-2 bg-slate-400 border-slate-700 rounded-md"
            placeholder="20"
            value={tableRows}
            type="number"
            required={true}
            onChange={(e) => setTableRows(Number(e.target.value))}
          />
        </label>
        <button
          type="reset"
          onClick={() => {
            setTableTitle("");
            setTableDesc("");
            setTableRows(20);
            //setCurrentTable(null);
          }}
          className="rounded-md bg-slate-400 py-2 px-4 text-sm 
          font-semibold text-red-700
              hover:bg-red-600 hover:text-black "
        >
          Reset form
        </button>
        <button
          type="submit"
          disabled={!canGenerate}
          className="bg-slate-700 rounded-md text-white py-2 px-4
              disabled:bg-slate-100 disabled:text-slate-200"
        >
          Generate
        </button>
      </form>
      <hr />
      <div className="bg-stone-700 size-auto m-8 p-4 shadow-lg rounded-sm">
        {!currentTable && (
          <div className="px-4 py-2">No current table, try generating one.</div>
        )}
        {isBusy && <div className="px-4 py-2">Generating table...</div>}
        {currentTable && <TableDisplay tableData={currentTable} />}
      </div>
      <hr />
      <div>
        <button
         type="button"
          className="bg-slate-700 rounded-md text-white py-2 px-4
              disabled:bg-slate-100 disabled:text-slate-200"
          onClick={exportTableToCSV}
          disabled={!currentTable}
        >
          Export to CSV
        </button>
      </div>
    </div>
  );
}

export default App;
