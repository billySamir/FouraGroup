import { db } from './db.js';
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// REGISTRO: Guardamos en Firestore
async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-pass').value;

    try {
        const role = (email === 'billybravo93@gmail.com') ? 'administrador' : 'cliente';
        await setDoc(doc(db, "usuarios", email), { name, email, pass, role });
        showToast("Registro exitoso");
        toggleForm('login');
    } catch (error) {
        showToast("Error en el registro");
    }
}

// LOGIN: Buscamos en Firestore
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;

    try {
        const userRef = doc(db, "usuarios", email);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists() && docSnap.data().pass === pass) {
            localStorage.setItem('currentUser', JSON.stringify(docSnap.data()));
            showToast("Bienvenido");
            // Ruta absoluta desde la raíz
            setTimeout(() => { window.location.href = '/index.html'; }, 1000);
        } else {
            showToast("Credenciales incorrectas");
        }
    } catch (error) {
        showToast("Error de conexión");
    }
}

// FUNCIONES DE APOYO
function toggleForm(type) {
    const loginBox = document.getElementById('box-login');
    const registerBox = document.getElementById('box-register');
    if (type === 'register') { loginBox.classList.add('hidden'); registerBox.classList.remove('hidden'); }
    else { registerBox.classList.add('hidden'); loginBox.classList.remove('hidden'); }
}

// --- FUNCIÓN QUE TE FALTABA ---
function togglePassword(inputId, button) {
    const input = document.getElementById(inputId);
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

function showToast(text) {
    const toast = document.getElementById('toast');
    if (toast) { toast.innerText = text; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 3000); }
}

// EXPOSICIÓN GLOBAL
window.handleRegister = handleRegister;
window.handleLogin = handleLogin;
window.toggleForm = toggleForm;
window.togglePassword = togglePassword; // <--- Importante para que el HTML la detecte
window.showToast = showToast;