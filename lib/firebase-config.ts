/**
 * Configuración web de tu proyecto Firebase.
 * Consola de Firebase → ⚙ Configuración del proyecto → General → Tus apps → App web → SDK setup and configuration
 *
 * Estos valores NO son secretos: viajan en el bundle de JavaScript y cualquiera puede verlos.
 * La seguridad no depende de esconderlos, sino de Auth + las reglas @auth de SQL Connect
 * (y, más adelante, App Check).
 *
 * Mientras desarrollás con `npm run dev`, la app usa los emuladores locales y no importa
 * si estos valores son reales. Para producción tenés que completarlos.
 */
export const firebaseConfig = {
  apiKey: "AIzaSyCtMxxcHGsRNEqElt8WYS_KIh-0mPDYbGs",
  authDomain: "prueba-6cd12.firebaseapp.com",
  projectId: "prueba-6cd12",
  storageBucket: "prueba-6cd12.firebasestorage.app",
  messagingSenderId: "1035222837386",
  appId: "1:1035222837386:web:1b6285e38515fe4157e573",
  measurementId: "G-JXWPE6PBLX",
};

/** Debe coincidir con dataconnect/dataconnect.yaml y dataconnect/cursos/connector.yaml */
export const sqlConnectConfig = {
  location: "us-east4",
  service: "catalogo",
  connector: "cursos",
};
