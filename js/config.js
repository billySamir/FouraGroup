let generatedCode = null;

document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        window.location.href = 'registro.html';
        return;
    }

    document.getElementById('conf-name').value = currentUser.name || '';
    document.getElementById('conf-lastname').value = currentUser.lastname || '';
    document.getElementById('conf-email').value = currentUser.email || '';

    const profileImg = document.getElementById('profile-img');
    if (currentUser.avatar) {
        profileImg.src = currentUser.avatar;
    } else {
        const initials = (currentUser.name.charAt(0) + (currentUser.lastname ? currentUser.lastname.charAt(0) : '')).toUpperCase();
        profileImg.src = `https://ui-avatars.com/api/?name=${initials}&background=2563eb&color=fff&size=150`;
    }
});

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

function uploadProfilePic(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const base64Image = e.target.result;
            document.getElementById('profile-img').src = base64Image;
            
            updateUserStorage({ avatar: base64Image });
            showToast("Foto de perfil actualizada");
        };
        reader.readAsDataURL(file);
    }
}

function updateProfile(e) {
    e.preventDefault();
    const newName = document.getElementById('conf-name').value;
    const newLastname = document.getElementById('conf-lastname').value;
    
    updateUserStorage({ name: newName, lastname: newLastname });
    showToast("Datos actualizados correctamente");
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
    if (!newEmail || !newEmail.includes('@')) {
        showToast("Ingresa un correo electrónico válido");
        return;
    }

    let users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.find(u => u.email === newEmail)) {
        showToast("Este correo ya está registrado en otra cuenta");
        return;
    }

    generatedCode = Math.floor(1000 + Math.random() * 9000).toString();
    document.getElementById('step-1-email').classList.add('hidden');
    document.getElementById('step-2-code').classList.remove('hidden');
    document.getElementById('email-modal-desc').innerHTML = `Se envió un código de seguridad al correo:<br> <b class="text-white">${newEmail}</b>`;
    
    setTimeout(() => {
        showToast(`SIMULACIÓN DE CORREO:\nTu código es: ${generatedCode}`);
    }, 1000);
}

function resendVerificationCode() {
    generatedCode = Math.floor(1000 + Math.random() * 9000).toString();
    document.getElementById('verify-code-input').value = '';
    showToast(`NUEVO CÓDIGO GENERADO:\nTu código es: ${generatedCode}`);
}

function verifyAndChangeEmail() {
    const inputCode = document.getElementById('verify-code-input').value;
    const newEmail = document.getElementById('new-email-input').value;

    if (inputCode === generatedCode) {
        updateUserStorage({ email: newEmail });
        document.getElementById('conf-email').value = newEmail;
        closeEmailModal();
        showToast("¡Correo verificado y actualizado!");
    } else {
        showToast("El código es incorrecto. Intenta de nuevo.");
    }
}

function updatePassword(e) {
    e.preventDefault();
    const newPass = document.getElementById('new-pass').value;
    const confirmPass = document.getElementById('confirm-pass').value;

    if (newPass !== confirmPass) {
        showToast("Las contraseñas no coinciden");
        return;
    }
    
    updateUserStorage({ pass: newPass });
    document.getElementById('new-pass').value = ''; 
    document.getElementById('confirm-pass').value = ''; 
    showToast("¡Contraseña actualizada!");
}

function updateUserStorage(newDataObject) {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const oldEmail = currentUser.email; 

    currentUser = { ...currentUser, ...newDataObject };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    const userIndex = users.findIndex(u => u.email === oldEmail);
    if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...newDataObject };
        localStorage.setItem('users', JSON.stringify(users));
    }
}

function showToast(text) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.innerText = text;
    toast.className = "fixed bottom-[30px] left-1/2 -translate-x-1/2 bg-blue-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg z-[1000] text-center w-[calc(100%-40px)] max-w-[400px] text-xs uppercase tracking-wider transition-all duration-300 show whitespace-pre-line";
    setTimeout(() => { toast.classList.remove('show'); }, 4500);
}