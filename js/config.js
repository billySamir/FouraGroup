import { db } from './db.js';
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

let generatedCode = null;

// --- FUNCIONES QUE FALTABAN ---

function switchTab(tabName) {
    const tabs = ['datos', 'seguridad'];
    const activeClass = "w-full text-left px-5 py-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all bg-blue-600 text-white shadow-lg shadow-blue-600/20 border border-blue-500";
    const inactiveClass = "w-full text-left px-5 py-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5";

    tabs.forEach(t => {
        const panel = document.getElementById(`panel-${t}`);
        const btn = document.getElementById(`tab-${t}`);
        if (panel && btn) {
            if (t === tabName) {
                panel.classList.remove('hidden');
                btn.className = activeClass;
            } else {
                panel.classList.add('hidden');
                btn.className = inactiveClass;
            }
        }
    });
}

function openEmailModal() {
    document.getElementById('email-modal').classList.remove('hidden');
    document.getElementById('step-1-email').classList.remove('hidden');
    document.getElementById('step-2-code').classList.add('hidden');
}

function closeEmailModal() {
    document.getElementById('email-modal').classList.add('hidden');
}

function sendVerificationCode() {
    const newEmail = document.getElementById('new-email-input').value;
    if (!newEmail || !newEmail.includes('@')) { showToast("Ingresa un correo válido"); return; }
    generatedCode = Math.floor(1000 + Math.random() * 9000).toString();
    document.getElementById('step-1-email').classList.add('hidden');
    document.getElementById('step-2-code').classList.remove('hidden');
    showToast(`SIMULACIÓN: Tu código es ${generatedCode}`);
}

function resendVerificationCode() {
    generatedCode = Math.floor(1000 + Math.random() * 9000).toString();
    showToast(`Nuevo código: ${generatedCode}`);
}

function verifyAndChangeEmail() {
    const inputCode = document.getElementById('verify-code-input').value;
    const newEmail = document.getElementById('new-email-input').value;
    if (inputCode === generatedCode) {
        updateUserData({ email: newEmail });
        document.getElementById('conf-email').value = newEmail;
        closeEmailModal();
        showToast("¡Correo actualizado!");
    } else {
        showToast("Código incorrecto");
    }
}

function showToast(text) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.innerText = text;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// --- LÓGICA DE FIREBASE (Lo que ya tenías) ---

document.addEventListener('DOMContentLoaded', async () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || !currentUser.email) { window.location.href = 'registro.html'; return; }

    // Mostrar al menos los datos guardados en localStorage mientras se carga Firestore
    document.getElementById('conf-name').value = currentUser.name || '';
    document.getElementById('conf-lastname').value = currentUser.lastname || '';
    document.getElementById('conf-email').value = currentUser.email || '';
    const profileImg = document.getElementById('profile-img');
    if (currentUser.avatar) {
        profileImg.src = currentUser.avatar;
    } else if (currentUser.name) {
        profileImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=2563eb&color=fff&size=150`;
    }

    try {
        const userRef = doc(db, "usuarios", currentUser.email);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            document.getElementById('conf-name').value = data.name || currentUser.name || '';
            document.getElementById('conf-lastname').value = data.lastname || currentUser.lastname || '';
            document.getElementById('conf-email').value = data.email || currentUser.email || '';
            if (data.avatar) {
                profileImg.src = data.avatar;
            } else if (data.name) {
                profileImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=2563eb&color=fff&size=150`;
            }
        }
    } catch (error) {
        console.error("Error al cargar:", error);
    }
});

async function updateUserData(newData) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    try {
        const userRef = doc(db, "usuarios", currentUser.email);
        await updateDoc(userRef, newData);
        const updatedUser = { ...currentUser, ...newData };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        showToast("Datos actualizados");
    } catch (error) { showToast("Error al guardar"); }
}

function uploadProfilePic(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('profile-img').src = e.target.result;
            updateUserData({ avatar: e.target.result });
        };
        reader.readAsDataURL(file);
    }
}

function updateProfile(e) {
    e.preventDefault();
    updateUserData({ 
        name: document.getElementById('conf-name').value, 
        lastname: document.getElementById('conf-lastname').value 
    });
}

function updatePassword(e) {
    e.preventDefault();
    const newPass = document.getElementById('new-pass').value;
    if (newPass !== document.getElementById('confirm-pass').value) { showToast("No coinciden"); return; }
    updateUserData({ pass: newPass });
}

// EXPOSICIÓN GLOBAL
window.switchTab = switchTab;
window.uploadProfilePic = uploadProfilePic;
window.updateProfile = updateProfile;
window.openEmailModal = openEmailModal;
window.closeEmailModal = closeEmailModal;
window.sendVerificationCode = sendVerificationCode;
window.resendVerificationCode = resendVerificationCode;
window.verifyAndChangeEmail = verifyAndChangeEmail;
window.updatePassword = updatePassword;
window.showToast = showToast;