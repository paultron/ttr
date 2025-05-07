import React, { useState, useEffect } from "react";
import { GoogleGenAI, Type } from "@google/genai";
import TableForm from "./TableForm";
import TableDisplay, { TableProps } from "./TableDisplay";
import LoginButton from "./components/LoginButton"; // Added
import LoginModal from "./components/LoginModal"; // Added
import { firebaseAuth as auth } from "./firebase/BaseConfig"; // Added for auth state
import { User, onAuthStateChanged, signOut } from "firebase/auth"; // Added for auth state and signOut

const API_KEY: string = import.meta.env.VITE_GEMINI_API_KEY;

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

  // Added for Login Modal and User State
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth); // Using signOut from firebase/auth directly
    } catch (err) {
      console.error("Error signing out: ", err);
      // Optionally, set an error message to display to the user
    }
  };

  const canGenerate =
    tableTitle.trim() != "" && tableDesc.trim() != "" && !isBusy;

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
The second column should be generated names.
The third column should be descriptions of ${tableItemLength} length.
Make the descriptions varied and not all starting with the same word, "A"/"The"/"This"/etc.
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
      <header className="w-full bg-neutral-800 shadow-md py-4 flex justify-between items-center px-4">
        <h1
          className="text-4xl font-bold font-sans text-amber-300"
          style={{ textShadow: "2px 2px 3px #4a3b0c" }}
        >
          TableGenAI
        </h1>
        {/* Login/Logout Button Area */}
        <div className="flex items-center">
          {currentUser ? (
            <div className="flex items-center">
              <span className="text-white mr-4">{currentUser.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Logout
              </button>
            </div>
          ) : (
            <LoginButton onClick={() => setIsLoginModalOpen(true)} />
          )}
        </div>
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
          <TableForm
            tableTitle={tableTitle}
            setTableTitle={setTableTitle}
            tableDesc={tableDesc}
            setTableDesc={setTableDesc}
            tableRows={tableRows}
            setTableRows={setTableRows}
            tableItemLength={tableItemLength}
            setTableItemLength={setTableItemLength}
            tableTemp={tableTemp}
            setTableTemp={setTableTemp}
            generateTable={generateTable}
            handleResetForm={handleResetForm}
            canGenerate={canGenerate}
            isBusy={isBusy}
          />
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="my-4 rounded-md bg-neutral-700 py-2 px-4 text-sm font-semibold text-amber-200
            hover:bg-neutral-600 transition-colors duration-200"
          >
            {currentTable
              ? "Edit & Generate New Table"
              : "Show Form to Generate Table"}
          </button>
        )}
      </main>

      {!currentTable && !isBusy && !showForm && (
        <div className="px-4 py-2">
          Click "Show Form to Generate Table" above to start.
        </div>
      )}

      {isBusy && (
        <p className="my-4 text-lg text-red-500">Generating table...</p>
      )}

      {error && <p className="my-4 text-lg text-red-500">Error: {error}</p>}

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

      {/* Login Modal Component */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}

export default App;
