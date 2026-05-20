function toggleForm(formType) {
    const loginBox = document.getElementById('box-login');
    const registerBox = document.getElementById('box-register');
    
    if (formType === 'register') {
        loginBox.classList.add('hidden');
        registerBox.classList.remove('hidden');
    } else {
        registerBox.classList.add('hidden');
        loginBox.classList.remove('hidden');
    }
}

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-pass').value;

    let users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Asignación de rol
    let role = (email === 'billybravo93@gmail.com') ? 'administrador' : 'cliente';

    users.push({ name, email, pass, role: role }); // <--- Aquí guardamos el role
    localStorage.setItem('users', JSON.stringify(users));
    
    showToast("Registro exitoso");
    // ... resto de tu código
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.pass === pass);

    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        showToast(`¡Bienvenido, ${user.name}!`);
        setTimeout(() => {
            window.location.href = 'inicio.html'; // RUTA CORREGIDA
        }, 1500);
    } else {
        showToast("Correo o contraseña incorrectos");
    }
}

// NUEVA FUNCIÓN: Mostrar y Ocultar Contraseña
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
    if (!toast) return;
    
    toast.innerText = text;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}