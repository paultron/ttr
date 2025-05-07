import React, { useState, useEffect, useContext } from "react";
import { GoogleGenAI, Type } from "@google/genai";
import TableForm from "./components/TableForm";
import TableDisplay, { TableProps } from "./components/TableDisplay";
import LoginButton from "./components/LoginButton";
import LoginModal from "./components/LoginModal";
import { firebaseAuth as auth } from "./firebase/BaseConfig"; // Auth instance
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { AuthContext } from "./store/AuthContext";
import {
  saveTableToFirestore,
  getLastFiveUserTables,
} from "./firebase/FirestoreService";
import {
  StoredTable,
  TableGenerationParams,
  AppTableData,
} from "./interfaces/interfaces";

const API_KEY: string = import.meta.env.VITE_GEMINI_API_KEY;

const examplePrompts = [
  {
    title: "Mystic Forest Encounters",
    description: "A list of strange and wondrous encounters one might have in an ancient, whispering wood. Focus on a mix of benign, curious, and subtly unnerving events.",
  },
  {
    title: "Cyberpunk Alleyway Finds",
    description: "Generate a table of items or data chips a street samurai might find stashed in a grimy back alley of Neo-Kyoto. Descriptions should be gritty and tech-focused. Include an extra column for the item's condition (e.g., pristine, used, damaged).",
  },
  {
    title: "Ingredients for a Potion of Shifting Hues",
    description: "List peculiar and magical ingredients required to brew a potion that causes a drinker's skin and hair to change colors with their mood. Include an extra column for where each ingredient might be found (e.g., Sunken Grotto, Dragon's Peak).",
  },
  {
    title: "Rumors in a Spaceport Cantina",
    description: "A collection of overheard rumors and plot hooks a group of adventurers might hear in a bustling, multi-species spaceport bar. Make them varied in scope and potential danger. Include an extra column for the source of the rumor (e.g., Drunken Pilot, Shady Infochant).",
  },
  {
    title: "Haunted Mansion's Secret Rooms",
    description: "Describe five secret rooms discovered in a sprawling, dilapidated Victorian mansion, including what unique item or clue is found in each.",
  },
  {
    title: "Desert Nomad's Prized Trinkets",
    description: "Generate a list of small, meaningful trinkets carried by a wise old desert nomad. Each item should hint at a past adventure or a piece of desert wisdom.",
  },
  {
    title: "Steampunk Inventor's Failed Gadgets",
    description: "A table of amusingly flawed or comically dangerous gadgets found in a scatter-brained steampunk inventor's workshop. Include an extra column for the primary material used (e.g., brass, copper, clockwork).",
  },
  {
    title: "Urban Fantasy Creature Sightings",
    description: "List recent, credible (or not-so-credible) sightings of magical creatures in a modern city setting. Descriptions should blend the mundane with the magical.",
  },
  {
    title: "Lost Pirate Treasure Clues",
    description: "Generate cryptic clues that, when pieced together, lead to Captain Blackheart's legendary buried treasure. Each clue should be a short riddle or a mysterious map fragment description.",
  },
  {
    title: "Post-Apocalyptic Barter Items",
    description: "A list of valuable or surprisingly useful items for barter in a post-apocalyptic wasteland settlement. Consider both practical needs and small luxuries. Include an extra column for the item's perceived barter value (e.g., 3 water rations, 10 bullets).",
  },
  {
    title: "Alien Flora of Planet Xylar",
    description: "Describe various species of bizarre and fascinating plants found on the newly discovered Planet Xylar. Include details about their appearance, properties, and potential uses or dangers. Include an extra column for the plant's edibility (e.g., edible, toxic, unknown).",
  },
  {
    title: "Notable NPCs in the City of Veridia",
    description: "Create a list of interesting non-player characters (NPCs) a party might encounter in the fantasy city of Veridia. Provide a brief personality sketch and a potential quest hook for each. Include an extra column for their primary motivation (e.g., wealth, knowledge, revenge).",
  },
  {
    title: "Philosophical Concepts from Ancient Zorgon",
    description: "Generate a table of intriguing and mind-bending philosophical concepts or paradoxes originating from the lost civilization of Zorgon. Provide a brief explanation of each concept.",
  },
  {
    title: "Legendary Lost Libraries",
    description: "A list of fabled libraries from myth and history, rumored to hold immense knowledge or dangerous secrets. Describe their supposed contents and the challenges in finding them. Include an extra column for the library's last known location or status.",
  },
  {
    title: "Guilds & Factions of the Underdark",
    description: "Detail various guilds, factions, or societies operating in the dangerous subterranean realm of the Underdark. Describe their goals, typical members, and relations with others. Include an extra column for their alignment (e.g., Lawful Evil, Chaotic Neutral).",
  }
];

function App() {
  // Form state - initialized by useEffect later
  const [tableTitle, setTableTitle] = useState("");
  const [tableDesc, setTableDesc] = useState("");
  const [tableRows, setTableRows] = useState(5);
  const [tableItemLength, setTableItemLength] = useState("Short to medium");
  const [tableTemp, setTableTemp] = useState(1.0);

  // App status state
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Current generated table state
  const [currentTable, setCurrentTable] = useState<TableProps | null>(null);
  const [currentTableParams, setCurrentTableParams] = useState<TableGenerationParams | null>(null);

  // UI state
  const [showForm, setShowForm] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const { user: currentUser, isAuthLoading } = useContext(AuthContext);

  const [savedTables, setSavedTables] = useState<StoredTable[]>([]);
  const [isSavingTable, setIsSavingTable] = useState(false);
  const [saveTableError, setSaveTableError] = useState<string | null>(null);
  const [fetchTablesError, setFetchTablesError] = useState<string | null>(null);

  // Effect to set initial random prompt on page load
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * examplePrompts.length);
    const randomPrompt = examplePrompts[randomIndex];
    setTableTitle(randomPrompt.title);
    setTableDesc(randomPrompt.description);
  }, []); // Empty dependency array ensures this runs only once on mount

  useEffect(() => {
    if (currentUser && !isAuthLoading) {
      setFetchTablesError(null);
      getLastFiveUserTables(currentUser.uid)
        .then(setSavedTables)
        .catch((err) => {
          console.error("Error fetching saved tables:", err);
          setFetchTablesError(
            err.message || "Could not fetch your saved tables."
          );
        });
    } else {
      setSavedTables([]);
    }
  }, [currentUser, isAuthLoading]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentTable(null);
      setCurrentTableParams(null);
    } catch (err) {
      console.error("Error signing out: ", err);
    }
  };

  const canGenerate =
    tableTitle.trim() !== "" && tableDesc.trim() !== "" && !isBusy;

  async function generateTable(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setIsBusy(true);
    setError(null);
    setCurrentTable(null);
    setCurrentTableParams(null);

    const params: TableGenerationParams = {
      tableTitle,
      tableDesc,
      tableRows,
      tableItemLength,
      tableTemp,
    };

    const AI = new GoogleGenAI({ apiKey: API_KEY });
    const modelConfig = {
      temperature: params.tableTemp,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          header: { type: Type.ARRAY, items: { type: Type.STRING } },
          rows: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
        },
        required: ["header", "rows"],
      },
    };

    const prompt = `Generate a table with the name "${params.tableTitle}" and the description "${params.tableDesc}".
The table should have ${params.tableRows} rows, including a header row.
The first column of the table should be numbered starting with 1.
The second column should be generated names.
The third column should be descriptions of ${params.tableItemLength} length.
Make the descriptions varied and not all starting with the same word, "A"/"The"/"This"/etc.
Only include additional columns if requested in the description.`;

    try {
      const response = await AI.models.generateContent({
        model: "gemini-2.0-flash-lite",
        contents: prompt,
        config: modelConfig,
      });

      const text: string = response.text ? response.text : "";
      const tableArray = JSON.parse(text) as AppTableData;
      const newTable: TableProps = {
        tableTitle: params.tableTitle,
        tableDesc: params.tableDesc,
        tableData: tableArray,
      };
      if (newTable.tableData.header && newTable.tableData.header.length > 0) {
        newTable.tableData.header[0] = "#";
      }

      setCurrentTable(newTable);
      setCurrentTableParams(params);
      setShowForm(false);
    } catch (err) {
      console.error("Error generating table:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Error generating table! Check console for details"
      );
    } finally {
      setIsBusy(false);
    }
  }

  const handleSaveTable = async () => {
    if (!currentUser || !currentTable || !currentTableParams) {
      setSaveTableError("Cannot save table. Ensure you are logged in and a table is generated.");
      return;
    }
    setIsSavingTable(true);
    setSaveTableError(null);
    try {
      await saveTableToFirestore(currentUser.uid, currentTableParams, currentTable.tableData);
      const updatedTables = await getLastFiveUserTables(currentUser.uid);
      setSavedTables(updatedTables);
      alert("Table saved successfully!");
    } catch (err) {
      console.error("Error saving table:", err);
      setSaveTableError(err instanceof Error ? err.message : "Could not save table.");
    } finally {
      setIsSavingTable(false);
    }
  };

  const loadSavedTable = (savedTable: StoredTable) => {
    setTableTitle(savedTable.tableTitle);
    setTableDesc(savedTable.tableDesc);
    setTableRows(savedTable.tableRows);
    setTableItemLength(savedTable.tableItemLength);
    setTableTemp(savedTable.tableTemp);

    setCurrentTable({
      tableTitle: savedTable.tableTitle,
      tableDesc: savedTable.tableDesc,
      tableData: savedTable.tableData as unknown as AppTableData,
    });
    setCurrentTableParams({
      tableTitle: savedTable.tableTitle,
      tableDesc: savedTable.tableDesc,
      tableRows: savedTable.tableRows,
      tableItemLength: savedTable.tableItemLength,
      tableTemp: savedTable.tableTemp,
    });
    setShowForm(false);
    setError(null);
  };

  const exportTableToCSV = (_ev: React.MouseEvent<HTMLButtonElement>) => {
    if (!currentTable) return;
    const rows = currentTable.tableData.rows;
    const header = currentTable.tableData.header;
    const csvData = [];
    const headerData = [];
    for (const cell of header) {
      headerData.push(cell);
    }
    csvData.push(headerData.join("\n"));
    for (const row of rows) {
      const rowData = [];
      for (const cell of row) {
        rowData.push(cell);
      }
      csvData.push(rowData.join("\n"));
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
    const randomIndex = Math.floor(Math.random() * examplePrompts.length);
    const randomPrompt = examplePrompts[randomIndex];
    setTableTitle(randomPrompt.title);
    setTableDesc(randomPrompt.description);
    setTableRows(5);
    setTableItemLength("Short to medium");
    setTableTemp(1.0);
    setCurrentTable(null);
    setCurrentTableParams(null);
    setError(null);
    setShowForm(true);
  };

  if (isAuthLoading) {
    return <div className="flex justify-center items-center h-screen text-white">Loading App...</div>;
  }

  return (
    <div className="flex flex-col w-full min-h-screen items-center text-center bg-neutral-900 text-neutral-200">
      <header className="w-full bg-neutral-800 shadow-md py-4 flex justify-between items-center px-4 sticky top-0 z-50">
        <h1
          className="text-4xl font-bold font-sans text-amber-300"
          style={{ textShadow: "2px 2px 3px #4a3b0c" }}
        >
          TableGenAI
        </h1>
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
            onClick={() => {
              setShowForm(true);
            }}
            className="my-4 rounded-md bg-neutral-700 py-2 px-4 text-sm font-semibold text-amber-200 hover:bg-neutral-600 transition-colors duration-200"
          >
            {currentTable ? "Edit Table & Generate New" : "Show Form to Generate New Table"}
          </button>
        )}
      </main>

      {!currentTable && !isBusy && !showForm && (
        <div className="px-4 py-2">
          Click "{currentTable ? "Edit Table & Generate New" : "Show Form to Generate New Table"}" above to start.
        </div>
      )}

      {isBusy && (
        <p className="my-4 text-lg text-red-500">Generating table...</p>
      )}
      {error && <p className="my-4 text-lg text-red-500">Error: {error}</p>}

      {currentTable && (
        <div className="my-8 w-full max-w-4xl">
          <TableDisplay table={currentTable} />
          <div className="flex justify-center items-center mt-6 space-x-4">
            <button
              type="button"
              className="rounded-md bg-amber-600 py-2 px-4 text-sm font-semibold text-neutral-900 hover:bg-amber-500 disabled:opacity-50 transition-colors duration-200"
              onClick={exportTableToCSV}
              disabled={!currentTable}
            >
              Download CSV
            </button>
            {currentUser && (
              <button
                type="button"
                className="rounded-md bg-green-600 py-2 px-4 text-sm font-semibold text-white hover:bg-green-500 disabled:opacity-50 transition-colors duration-200"
                onClick={handleSaveTable}
                disabled={isSavingTable || !currentTable}
              >
                {isSavingTable ? "Saving..." : "Save Table"}
              </button>
            )}
          </div>
          {saveTableError && <p className="mt-2 text-sm text-red-400">{saveTableError}</p>}
        </div>
      )}

      {currentUser && savedTables.length > 0 && (
        <section className="my-8 w-full max-w-4xl">
          <h2 className="text-2xl font-semibold text-amber-200 mb-4">Your Last 5 Saved Tables</h2>
          {fetchTablesError && <p className="text-red-400 mb-2">{fetchTablesError}</p>}
          <ul className="space-y-3">
            {savedTables.map((table) => (
              <li key={table.id} className="p-4 bg-neutral-800 rounded-md shadow flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-amber-100">{table.tableTitle}</h3>
                  <p className="text-sm text-neutral-400 truncate max-w-md">{table.tableDesc}</p>
                  <p className="text-xs text-neutral-500 mt-1">
                    Saved on: {table.createdAt?.toDate ? new Date(table.createdAt.toDate()).toLocaleDateString() : 'N/A'} -
                    {table.tableRows} rows, Temp: {table.tableTemp}, Length: {table.tableItemLength}
                  </p>
                </div>
                <button
                  onClick={() => loadSavedTable(table)}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded text-sm"
                >
                  Load Table
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
      {currentUser && savedTables.length === 0 && !fetchTablesError && (
        <section className="my-8 w-full max-w-4xl">
          <p className="text-neutral-400">You have no saved tables yet. Generate and save a table to see it here!</p>
        </section>
      )}

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}

export default App;
