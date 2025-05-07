import { User } from "firebase/auth";
import { Timestamp } from "firebase/firestore";

// IAuth context
export interface IAuth {
  user: User | null;
  loading: boolean;
  isAuthLoading: boolean;
  signIn: (creds: LoginFormValues) => Promise<void>;
  signUp: (creds: UserFormValues) => Promise<void>;
  signOut: () => Promise<void>;
}

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface UserFormValues {
  email: string;
  password: string;
  // displayName?: string;
}

// Interface for the structure of table data as used by the app (Gemini response, TableDisplay)
export interface AppTableData {
  header: string[];
  rows: string[][]; // Array of arrays of strings
}

// Interface for the structure of table row data compatible with Firestore
export interface FirestoreRowData {
  cells: string[];
}

// Interface for the structure of table data compatible with Firestore
export interface FirestoreCompatibleTableData {
  header: string[];
  rows: FirestoreRowData[]; // Array of objects, each representing a row
}

// Interface for the table generation parameters
export interface TableGenerationParams {
  tableTitle: string;
  tableDesc: string;
  tableRows: number;
  tableItemLength: string;
  tableTemp: number;
}

// Interface for the table document stored in Firestore
export interface StoredTable extends TableGenerationParams {
  id?: string; // Firestore document ID
  userId: string;
  tableData: FirestoreCompatibleTableData; // Use Firestore-compatible structure
  createdAt: Timestamp; // Firestore timestamp for ordering
}
