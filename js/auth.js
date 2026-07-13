import { app, db } from './db.js';
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { getAuth, GoogleAuthProvider, OAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

const auth = getAuth(app);
const adminEmails = ['billybravo93@gmail.com', 'otro.admin@empresa.com'];

async function persistUserProfile(userData) {
    await setDoc(doc(db, "usuarios", userData.email), {
        ...userData,
        provider: userData.provider || 'email'
    }, { merge: true });
}

async function authenticateWithProvider(provider, providerName) {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const email = user.email || `${user.uid}@${providerName.toLowerCase()}.local`;
        const name = user.displayName || email.split('@')[0] || providerName;
        const role = adminEmails.includes(email) ? 'administrador' : 'cliente';

        const profile = {
            name,
            email,
            role,
            provider: providerName,
            photoURL: user.photoURL || ''
        };

        await persistUserProfile(profile);
        localStorage.setItem('currentUser', JSON.stringify(profile));
        showToast(`Bienvenido, ${name}`);
        setTimeout(() => { window.location.href = '/index.html'; }, 1000);
    } catch (error) {
        console.error(error);
        const message = getAuthErrorMessage(error, providerName);
        showToast(message);
    }
}

function getAuthErrorMessage(error, providerName) {
    const code = error?.code || '';

    switch (code) {
        case 'auth/popup-closed-by-user':
            return 'Se cerró la ventana de inicio de sesión.';
        case 'auth/popup-blocked':
            return 'El navegador bloqueó la ventana emergente. Permite los pop-ups y vuelve a intentarlo.';
        case 'auth/unauthorized-domain':
            return 'Este dominio no está autorizado en Firebase Authentication.';
        case 'auth/account-exists-with-different-credential':
            return 'Ya existe una cuenta con otro método de acceso.';
        default:
            return `No se pudo conectar con ${providerName}. Revisa tu conexión o habilita el proveedor en Firebase.`;
    }
}

function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    authenticateWithProvider(provider, 'Google');
}

function signInWithMicrosoft() {
    const provider = new OAuthProvider('microsoft.com');
    authenticateWithProvider(provider, 'Microsoft');
}

// REGISTRO: Guardamos en Firestore
async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-pass').value;

    try {
        // Verifica si el email está en la lista de administradores
        const role = adminEmails.includes(email) ? 'administrador' : 'cliente';

        await setDoc(doc(db, "usuarios", email), { 
            name, 
            email, 
            pass, 
            role 
        });

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
window.togglePassword = togglePassword;
window.signInWithGoogle = signInWithGoogle;
window.signInWithMicrosoft = signInWithMicrosoft;
window.showToast = showToast;