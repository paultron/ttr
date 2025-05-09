import { firestore } from './BaseConfig';
import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  Timestamp,
  doc, // Added for deleting a document
  deleteDoc // Added for deleting a document
} from 'firebase/firestore';
import {
  StoredTable,
  TableGenerationParams,
  AppTableData, 
  FirestoreCompatibleTableData,
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
  tableData: AppTableData 
): Promise<string> => {
  if (!userId) throw new Error('User ID is required to save a table.');

  try {
    const userTableCollectionRef = collection(firestore, USER_TABLES_COLLECTION, userId, TABLES_SUBCOLLECTION);
    
    const firestoreReadyTableData = convertToFirestoreFormat(tableData);

    const newTableDoc = {
      userId,
      ...params,
      tableData: firestoreReadyTableData,
      createdAt: serverTimestamp(),
    };
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
      const firestoreDocData = { id: doc.id, ...doc.data() } as StoredTable;
      tables.push({
        ...firestoreDocData,
        tableData: convertFromFirestoreFormat(firestoreDocData.tableData) 
      } as unknown as StoredTable);
    });
    return tables;
  } catch (error) {
    console.error('Error fetching user tables from Firestore:', error);
    throw error;
  }
};

// Delete a specific table for a given user
export const deleteTableFromFirestore = async (userId: string, tableId: string): Promise<void> => {
  if (!userId) throw new Error('User ID is required to delete a table.');
  if (!tableId) throw new Error('Table ID is required to delete a table.');

  try {
    const tableDocRef = doc(firestore, USER_TABLES_COLLECTION, userId, TABLES_SUBCOLLECTION, tableId);
    await deleteDoc(tableDocRef);
  } catch (error) {
    console.error('Error deleting table from Firestore:', error);
    throw error;
  }
};
