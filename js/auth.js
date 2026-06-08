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

        await setDoc(doc(db, "usuarios", email), {
            name,
            email,
            pass,
            role
        });

        showToast("Registro exitoso en la nube");
        toggleForm('login'); 
    } catch (error) {
        console.error("Error al registrar:", error);
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
            const userData = docSnap.data();
            localStorage.setItem('currentUser', JSON.stringify(userData));
            showToast(`¡Bienvenido, ${userData.name}!`);
            // Ruta absoluta para evitar errores 404
            setTimeout(() => { window.location.href = '/inicio.html'; }, 1500);
        } else {
            showToast("Correo o contraseña incorrectos");
        }
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
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

function togglePassword(inputId, button) {
    const input = document.getElementById(inputId);
    const icon = button.querySelector('i');
    input.type = input.type === 'password' ? 'text' : 'password';
    icon.classList.toggle('fa-eye');
    icon.classList.toggle('fa-eye-slash');
}

function showToast(text) {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.innerText = text;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }
}

// EXPOSICIÓN GLOBAL (Aquí expones las funciones que definiste arriba)
window.toggleForm = toggleForm;
window.handleRegister = handleRegister;
window.handleLogin = handleLogin;
window.togglePassword = togglePassword;
window.showToast = showToast;