import { useState } from 'react'
import { GoogleGenAI, Type } from "@google/genai";

const API_KEY: string = import.meta.env.VITE_GEMINI_API_KEY;

interface TableProps {
  tableData: {
    header : string[]
    rows : string[][]
  }
}

function TableDisplay({
  tableData
}:
  TableProps
) {
  const columns = tableData.header;
  const rows = tableData.rows;

  return (
    <table>
      <thead>
        <tr>
          {columns.map((column, index) => <th key={index}>{column}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function App() {
  const [tableTitle, setTableTitle] = useState('');
  const [tableDesc, setTableDesc] = useState('');
  const [tableRows, setTableRows] = useState(20);
  const [currentTable, setCurrentTable] = useState<TableProps['tableData'] | null>(null);

  async function generateTable(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();

    //const form = ev.target;
    const formData = new FormData(ev.currentTarget);

    const formJson = Object.fromEntries(formData.entries());

    console.log(formJson);

    const AI = new GoogleGenAI({ apiKey: API_KEY });

    console.log('Generating table with:', { tableTitle, tableDesc, tableRows });

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
      }
    });

    //const result = await model.generateContent(prompt);
    //const response = result.response;
    console.log(response)
    const text: string = response.text ? response.text : '';
    console.log('raw', text)

    try {
      const tableArray = JSON.parse(text);
      console.log('Parsed table array:', tableArray);
      setCurrentTable(tableArray);
      return tableArray
    } catch (e) {
      console.error('Error parsing JSON:', e);
      return [['Error generating table! Check console for details']];
    }

  }

  return (
    <>
      <div className='flex flex-col'>
        <h1 className='text-xl'>TableGenAI</h1>
        <form
          method="post"
          onSubmit={generateTable}
          className='gap-4 flex flex-col items-center my-4'>
          <label>
            Title
            <input
              name="tableTitle"
              className='block text-center my-2 border-2 border-slate-700 rounded-md'
              placeholder='Cool Items'
              value={tableTitle}
              onChange={e => setTableTitle(e.target.value)}
            />
          </label>
          <label>
            Description
            <input
              name="tableDesc"
              className='w-lg block text-center my-2 border-2 border-slate-700 rounded-md'
              placeholder='A table of cool items'
              value={tableDesc}
              onChange={e => setTableDesc(e.target.value)}
            />
          </label>
          <label>
            Rows
            <input
              name="tableRows"
              className='block text-center my-2 border-2 border-slate-700 rounded-md'
              placeholder='20'
              value={tableRows}
              type='number'
              onChange={e => setTableRows(Number(e.target.value))}
            />
          </label>
          <button type="submit" className='bg-slate-700 rounded-md text-white p-2'>Generate</button>
        </form>
      </div>
      <hr />
      {currentTable && <TableDisplay tableData={currentTable} />}
    </>
  )
}

export default App
