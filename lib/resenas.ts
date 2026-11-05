// lib/resenas.ts - Práctica 4 (Firestore). Capa de acceso a datos de reseñas.
import { getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  average,
  collection,
  connectFirestoreEmulator,
  count,
  deleteDoc,
  doc,
  getAggregateFromServer,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
  type Firestore,
  type Timestamp,
  type Unsubscribe,
} from "firebase/firestore";

export interface Resena {
  uid: string; // id del documento
  puntaje: number; // 1..5
  texto: string;
  autor: string;
  creadaEn: Timestamp | null; // null mientras el serverTimestamp está pendiente (escritura local)
}

let db: Firestore | null = null;

export function firestore(): Firestore {
  if (db) return db;
  db = getFirestore(getApp());
  if (process.env.NODE_ENV === "development") {
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
  }
  return db;
}

const resenasDe = (cursoId: string) => collection(firestore(), "cursos", cursoId, "resenas");
