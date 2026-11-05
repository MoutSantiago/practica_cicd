"use client";

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";
import { connectDataConnectEmulator, getDataConnect, type DataConnect } from "firebase/data-connect";
import { firebaseConfig, sqlConnectConfig } from "./firebase-config";

/**
 * La app usa los emuladores locales solo cuando NEXT_PUBLIC_USE_EMULATORS=true
 * (definido en el script `dev`). En producción (`npm run build`) no se define,
 * así que se conecta a los servicios reales de Firebase.
 */
export const USA_EMULADORES = process.env.NEXT_PUBLIC_USE_EMULATORS === "true";

let cache: { app: FirebaseApp; auth: Auth; dc: DataConnect } | null = null;

/** Inicialización perezosa: solo en el navegador, nunca durante el build estático. */
export function firebase() {
  if (cache) return cache;
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const dc = getDataConnect(app, sqlConnectConfig);
  if (USA_EMULADORES) {
    connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    connectDataConnectEmulator(dc, "127.0.0.1", 9399);
  }
  cache = { app, auth, dc };
  return cache;
}
