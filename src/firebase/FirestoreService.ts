import { firestore } from './BaseConfig';
import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import {
  StoredTable,
  TableGenerationParams,
  AppTableData, // This is what App.tsx uses (string[][])
  FirestoreCompatibleTableData, // This is what Firestore needs (Array<{cells: string[]}>)
  FirestoreRowData
} from '../interfaces/interfaces';

const USER_TABLES_COLLECTION = 'userTables';
const TABLES_SUBCOLLECTION = 'tables';

// Helper to convert AppTableData to FirestoreCompatibleTableData
const convertToFirestoreFormat = (appData: AppTableData): FirestoreCompatibleTableData => {
  return {
    header: appData.header,
    rows: appData.rows.map(rowCells => ({ cells: rowCells })),
  };
};

// Helper to convert FirestoreCompatibleTableData back to AppTableData
const convertFromFirestoreFormat = (firestoreData: FirestoreCompatibleTableData): AppTableData => {
  return {
    header: firestoreData.header,
    rows: firestoreData.rows.map(rowObject => rowObject.cells),
  };
};

// Save a generated table to Firestore for the logged-in user
export const saveTableToFirestore = async (
  userId: string,
  params: TableGenerationParams,
  tableData: AppTableData // App.tsx sends data in this format
): Promise<string> => {
  if (!userId) throw new Error('User ID is required to save a table.');

  try {
    const userTableCollectionRef = collection(firestore, USER_TABLES_COLLECTION, userId, TABLES_SUBCOLLECTION);
    
    // Convert to Firestore-compatible format before saving
    const firestoreReadyTableData = convertToFirestoreFormat(tableData);

    const newTableDoc = {
      userId,
      ...params,
      tableData: firestoreReadyTableData, // Save the converted data
      createdAt: serverTimestamp(),
    };
    // The type for newTableDoc for addDoc doesn't need StoredTable['id'] or precise createdAt type here
    const docRef = await addDoc(userTableCollectionRef, newTableDoc as Omit<StoredTable, 'id' | 'createdAt'> & { createdAt: any });
    return docRef.id;
  } catch (error) {
    console.error('Error saving table to Firestore:', error);
    throw error;
  }
};

// Fetch the last five tables for a given user
export const getLastFiveUserTables = async (userId: string): Promise<StoredTable[]> => {
  if (!userId) throw new Error('User ID is required to fetch tables.');

  try {
    const userTableCollectionRef = collection(firestore, USER_TABLES_COLLECTION, userId, TABLES_SUBCOLLECTION);
    const q = query(
      userTableCollectionRef,
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    const querySnapshot = await getDocs(q);
    const tables: StoredTable[] = [];
    querySnapshot.forEach((doc) => {
      // The data from Firestore needs to be cast to the StoredTable structure,
      // but its tableData is still FirestoreCompatibleTableData
      const firestoreDocData = { id: doc.id, ...doc.data() } as StoredTable;
      
      // Convert tableData back to AppTableData format for use in the app
      // This step means the StoredTable type in the app will effectively hold AppTableData
      // We will adjust the loadSavedTable in App.tsx to expect AppTableData again.
      tables.push({
        ...firestoreDocData,
        tableData: convertFromFirestoreFormat(firestoreDocData.tableData) 
      } as unknown as StoredTable); // We cast here, knowing we adjusted the shape
    });
    return tables;
  } catch (error) {
    console.error('Error fetching user tables from Firestore:', error);
    throw error;
  }
};
