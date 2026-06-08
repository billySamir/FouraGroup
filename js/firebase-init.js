// Importa las funciones necesarias
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Pega aquí la configuración que copiaste en el paso 1
const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUÍ",
  authDomain: "foura-group.firebaseapp.com",
  projectId: "foura-group-id",
  storageBucket: "foura-group.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);