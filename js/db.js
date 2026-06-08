
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCCPv6hUC-XpswQTOYLGBBs_PG-f_Opw6w",
    authDomain: "foura-group.firebaseapp.com",
    projectId: "foura-group",
    storageBucket: "foura-group.firebasestorage.app",
    messagingSenderId: "319377571994",
    appId: "1:319377571994:web:f0040916569e0c39d0df23",
    measurementId: "G-MK44RP7N8C"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);