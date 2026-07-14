import { app, db } from './db.js';
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { getAuth, GoogleAuthProvider, OAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, browserLocalPersistence, setPersistence } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

const auth = getAuth(app);
const adminEmails = ['billybravo93@gmail.com', 'otro.admin@empresa.com'];
let socialPendingUser = null;

setPersistence(auth, browserLocalPersistence).catch(() => {});

async function persistUserProfile(userData) {
    await setDoc(doc(db, "usuarios", userData.email), {
        ...userData,
        provider: userData.provider || 'email'
    }, { merge: true });
}

function splitDisplayName(fullName) {
    if (!fullName) return { name: '', lastname: '' };
    const parts = fullName.trim().split(/\s+/);
    return parts.length === 1
        ? { name: parts[0], lastname: '' }
        : { name: parts[0], lastname: parts.slice(1).join(' ') };
}

async function finishSocialAuth(user, providerName) {
    const email = user.email;
    if (!email) {
        showToast('No se pudo obtener el correo desde el proveedor de acceso.');
        return;
    }

    const userRef = doc(db, "usuarios", email);
    const userSnap = await getDoc(userRef);
    const role = adminEmails.includes(email) ? 'administrador' : 'cliente';
    const display = splitDisplayName(user.displayName);

    if (userSnap.exists()) {
        const existingProfile = userSnap.data();
        localStorage.setItem('currentUser', JSON.stringify(existingProfile));
        showToast(`Bienvenido de nuevo, ${existingProfile.name || existingProfile.email}`);
        setTimeout(() => { window.location.href = '/index.html'; }, 1000);
        return;
    }

    socialPendingUser = {
        email,
        providerName,
        role,
        provider: providerName.toLowerCase(),
        photoURL: user.photoURL || '',
        name: display.name,
        lastname: display.lastname
    };
    openSocialSignupModal(socialPendingUser);
}

async function authenticateWithProvider(provider, providerName) {
    try {
        const result = await signInWithPopup(auth, provider);
        await finishSocialAuth(result.user, providerName);
    } catch (error) {
        console.error(error);
        if (error?.code === 'auth/popup-blocked' || error?.code === 'auth/popup-closed-by-user' || error?.code === 'auth/operation-not-allowed') {
            try {
                await signInWithRedirect(auth, provider);
            } catch (redirectError) {
                console.error(redirectError);
                showToast(getAuthErrorMessage(redirectError, providerName));
            }
            return;
        }

        showToast(getAuthErrorMessage(error, providerName));
    }
}

async function handleRedirectAuthResult() {
    try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
            await finishSocialAuth(result.user, result.providerId?.includes('google') ? 'Google' : 'Microsoft');
        }
    } catch (error) {
        console.error(error);
        showToast(getAuthErrorMessage(error, 'Google/Microsoft'));
    }
}

// --- FUNCIÓN CORREGIDA ---
function openSocialSignupModal(user) {
    const providerLabel = document.getElementById('social-signup-provider-label');
    const emailInput = document.getElementById('social-signup-email');
    const nameInput = document.getElementById('social-signup-name');
    const lastnameInput = document.getElementById('social-signup-lastname');
    const passInput = document.getElementById('social-signup-pass');
    const passConfirmInput = document.getElementById('social-signup-pass-confirm');
    const modal = document.getElementById('social-signup-modal');

    // Validación: Si no existe el HTML del modal, detenemos la ejecución para evitar el error 'Cannot set properties of null'
    if (!providerLabel || !modal) {
        console.error("Error: No se encontró el HTML del modal de registro ('social-signup-modal' o 'social-signup-provider-label').");
        showToast("Falta el diseño del modal de registro en tu HTML.");
        return; 
    }

    // Si los elementos existen, asignamos los valores de forma segura
    providerLabel.innerText = user.providerName;
    if (emailInput) emailInput.value = user.email;
    if (nameInput) nameInput.value = user.name || '';
    if (lastnameInput) lastnameInput.value = user.lastname || '';
    if (passInput) passInput.value = '';
    if (passConfirmInput) passConfirmInput.value = '';
    
    modal.classList.remove('hidden');
}

function closeSocialSignupModal() {
    const modal = document.getElementById('social-signup-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

async function completeSocialSignup(e) {
    e.preventDefault();
    if (!socialPendingUser) {
        showToast('No hay datos de registro social pendientes.');
        return;
    }

    const name = document.getElementById('social-signup-name').value.trim();
    const lastname = document.getElementById('social-signup-lastname').value.trim();
    const pass = document.getElementById('social-signup-pass').value;
    const confirm = document.getElementById('social-signup-pass-confirm').value;

    if (!name || !lastname) {
        showToast('Ingresa nombre y apellido.');
        return;
    }
    if (!pass || pass.length < 6) {
        showToast('La contraseña debe tener al menos 6 caracteres.');
        return;
    }
    if (pass !== confirm) {
        showToast('Las contraseñas no coinciden.');
        return;
    }

    const userData = {
        ...socialPendingUser,
        name,
        lastname,
        pass,
        createdAt: new Date().toISOString()
    };

    try {
        await setDoc(doc(db, "usuarios", userData.email), userData);
        localStorage.setItem('currentUser', JSON.stringify(userData));
        showToast('Cuenta creada correctamente. Redirigiendo...');
        closeSocialSignupModal();
        setTimeout(() => { window.location.href = '/index.html'; }, 1200);
    } catch (error) {
        console.error(error);
        showToast('Error al guardar datos. Intenta de nuevo.');
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
    const lastname = document.getElementById('reg-lastname').value;
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-pass').value;

    try {
        const role = adminEmails.includes(email) ? 'administrador' : 'cliente';

        const userData = {
            name,
            lastname,
            email,
            pass,
            role,
            provider: 'email'
        };

        await setDoc(doc(db, "usuarios", email), userData);

        localStorage.setItem('currentUser', JSON.stringify(userData));
        showToast("Registro exitoso");
        toggleForm('login');
    } catch (error) {
        console.error(error);
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
window.completeSocialSignup = completeSocialSignup;
window.openSocialSignupModal = openSocialSignupModal;
window.closeSocialSignupModal = closeSocialSignupModal;
window.showToast = showToast;

window.addEventListener('DOMContentLoaded', () => {
    handleRedirectAuthResult();
});