import React from 'react';

interface TableFormProps {
  tableTitle: string;
  setTableTitle: (value: string) => void;
  tableDesc: string;
  setTableDesc: (value: string) => void;
  tableRows: number;
  setTableRows: (value: number) => void;
  tableItemLength: string;
  setTableItemLength: (value: string) => void;
  tableTemp: number;
  setTableTemp: (value: number) => void;
  generateTable: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  handleResetForm: () => void;
  canGenerate: boolean;
  isBusy: boolean;
}

const TableForm: React.FC<TableFormProps> = ({
  tableTitle,
  setTableTitle,
  tableDesc,
  setTableDesc,
  tableRows,
  setTableRows,
  tableItemLength,
  setTableItemLength,
  tableTemp,
  setTableTemp,
  generateTable,
  handleResetForm,
  canGenerate,
  isBusy,
}) => {
  return (
    <form
      method="post"
      onSubmit={generateTable}
      className="gap-6 w-full flex flex-col text-lg items-center my-4 p-6 bg-neutral-800 rounded-lg shadow-lg"
    >
      {/* Table Title Input */}
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
      {/* Table Description Input */}
      <label className="w-full flex flex-col items-start">
        <span className="mb-2 font-semibold text-amber-200">
          Description:
        </span>
        <textarea
          name="tableDesc"
          className="block w-full px-3 py-2 bg-neutral-700 border border-neutral-600 
          rounded-md placeholder-neutral-500 focus:outline-none focus:ring-2 
          focus:ring-amber-500 focus:border-amber-500 transition-colors duration-200"
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
          <span className="mb-2 font-semibold text-amber-200">Rows:</span>
          <input
            name="tableRows"
            className="block w-24 h-12 text-center px-3 py-2 bg-neutral-700 border border-neutral-600
            rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 
            focus:border-amber-500 transition-colors duration-200"
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
      {/* Form Buttons */}
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
  );
};

export default TableForm;
