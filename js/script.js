import { db } from './db.js';
import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Variables Globales
let products = [];
let cart = [];
let currentSlide = 0;
let activeCatalogCat = 'all';

// 1. Integración con Firebase (Tiempo Real)
function initRealtimeUpdates() {
    onSnapshot(collection(db, "productos"), (snapshot) => {
        products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        loadDestacados();
        if (document.getElementById('full-catalog-grid')) {
            renderFullCatalog();
        }
    });
}

// 2. Funciones de Navegación y UI
function navigateTo(view) {
    const home = document.getElementById('view-home');
    const catalog = document.getElementById('view-catalog');
    if (view === 'catalog') {
        home.classList.add('view-hidden');
        setTimeout(() => { home.style.display = 'none'; catalog.style.display = 'block'; setTimeout(() => catalog.classList.remove('view-hidden'), 50); renderFullCatalog(); }, 300);
    } else {
        catalog.classList.add('hidden'); // Ajuste: usando clase hidden para consistencia
        home.classList.remove('view-hidden');
        home.style.display = 'block';
        loadDestacados();
        currentSlide = 0;
        updateSlider();
    }
}

function updateCatalogFilter(cat, btn) {
    activeCatalogCat = cat;
    document.querySelectorAll('.catalog-cat-btn').forEach(b => b.classList.remove('active-filter'));
    btn.classList.add('active-filter');
    renderFullCatalog(document.getElementById('catalog-search')?.value || '');
}

// 3. Renderizado
function renderCard(product, isSlider = false) {
    return `
        <div class="${isSlider ? 'slider-item w-full md:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] shrink-0' : ''}">
            <div class="product-card p-6 flex flex-col h-full relative group bg-[#111111] border border-white/5 hover:border-blue-500/30 transition-all duration-500 rounded-[32px] shadow-lg">
                <div class="cursor-pointer flex flex-col flex-grow" onclick="showProductDetails('${product.id}')">
                    <div class="w-32 h-32 mx-auto bg-[#0a0a0a] rounded-full mb-6 overflow-hidden flex items-center justify-center border border-white/5 group-hover:border-blue-500/30 transition-colors shadow-inner">
                        <img src="${product.image}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" onerror="this.src='https://placehold.co/200x200/111/fff?text=Foura'">
                    </div>
                    <div class="text-center mb-2">
                        <span class="text-[9px] text-blue-400 font-black uppercase tracking-[0.2em]">${product.category}</span>
                        <h3 class="text-lg font-bold text-white mt-1 group-hover:text-blue-400 transition-colors">${product.name}</h3>
                    </div>
                    <p class="text-[11px] text-gray-500 text-center mb-8 leading-relaxed px-2 line-clamp-2">${product.desc}</p>
                </div>
                <button onclick="addToCart('${product.id}')" class="w-full bg-white/5 hover:bg-blue-600 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 border border-white/5 hover:border-blue-600 mt-auto">Añadir a Cotización</button>
            </div>
        </div>
    `;
}

function loadDestacados() {
    const slider = document.getElementById('destacados-slider');
    if (!slider) return;
    slider.innerHTML = products.filter(p => p.featured).map(p => renderCard(p, true)).join('');
}

function renderFullCatalog(search = '') {
    const grid = document.getElementById('full-catalog-grid');
    if (!grid) return;
    const filtered = products.filter(p => 
        (p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())) && 
        (activeCatalogCat === 'all' || p.category === activeCatalogCat)
    );
    grid.innerHTML = filtered.length ? filtered.map(p => renderCard(p)).join('') : `<div class="col-span-full py-20 text-center text-gray-600 uppercase text-xs tracking-[0.2em]">No se encontraron productos</div>`;
}

// 4. Slider y Carrito
function updateSlider() {
    const container = document.getElementById('destacados-slider');
    if (!container || container.children.length === 0) return;
    const itemWidth = container.children[0].getBoundingClientRect().width;
    container.style.transform = `translateX(-${currentSlide * (itemWidth + 24)}px)`;
}

function slideNext() {
    const container = document.getElementById('destacados-slider');
    if (!container) return;
    const perView = window.innerWidth >= 1024 ? 3 : (window.innerWidth >= 768 ? 2 : 1);
    currentSlide = (currentSlide < (container.children.length - perView)) ? currentSlide + 1 : 0;
    updateSlider();
}

function slidePrev() {
    const container = document.getElementById('destacados-slider');
    if (!container) return;
    const perView = window.innerWidth >= 1024 ? 3 : (window.innerWidth >= 768 ? 2 : 1);
    currentSlide = (currentSlide > 0) ? currentSlide - 1 : container.children.length - perView;
    updateSlider();
}

function addToCart(id) {
    const p = products.find(prod => prod.id === id);
    if (!p) return;
    if (!cart.find(item => item.id === id)) { cart.push(p); showToast(`Añadido: ${p.name}`); updateCartUI(); } else showToast("Ya está en tu lista");
}

function removeFromCart(id) { cart = cart.filter(p => p.id !== id); updateCartUI(); showToast("Producto eliminado"); }

function updateCartUI() {
    const list = document.getElementById('cart-items');
    const counter = document.getElementById('cart-count');
    if (!list || !counter) return;
    counter.innerText = cart.length;
    list.innerHTML = cart.length ? cart.map(item => `
        <div class="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
            <img src="${item.image}" class="w-14 h-14 object-cover rounded-lg bg-black">
            <div class="flex-grow"><h4 class="text-sm font-bold text-white line-clamp-1">${item.name}</h4><p class="text-[10px] text-gray-500 font-mono">${item.sku}</p></div>
            <button onclick="removeFromCart('${item.id}')" class="p-3 text-gray-500 hover:text-red-500"><i class="fa-solid fa-trash-can"></i></button>
        </div>
    `).join('') : `<div class="text-center py-20 text-gray-600 uppercase text-xs tracking-widest font-bold">Tu lista está vacía</div>`;
}

// 5. Utilidades y Auth
function showToast(text) { 
    const toast = document.getElementById('toast'); 
    if (toast) { toast.innerText = text; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 3000); } 
}

function toggleCart() { document.getElementById('cart-drawer').classList.toggle('hidden'); }
function toggleMobileMenu() { document.getElementById('mobile-menu').classList.toggle('hidden'); }

function sendToWhatsApp() {
    if (!cart.length) { showToast("Añade productos primero"); return; }
    let message = "*SOLICITUD DE COTIZACIÓN - FOURA GROUP*\n-----------------------------------------\n";
    cart.forEach(item => { message += `• *${item.name}* [${item.sku}]\n`; });
    window.open(`https://wa.me/51947121064?text=${encodeURIComponent(message)}`, '_blank');
}

function toggleUserMenu() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const dropdown = document.getElementById('user-dropdown');
    if (currentUser) {
        // ... (tu código actual)
        dropdown.classList.toggle('hidden');
    } else { 
        // CAMBIA ESTA LÍNEA (Asegúrate de poner la barra / al principio)
        window.location.href = '/html/registro.html';
    }
}

function logoutUser() { localStorage.removeItem('currentUser'); window.location.reload(); }

function checkAuthNavbar() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const btnIcon = document.getElementById('user-icon-btn');
    if (currentUser && btnIcon && currentUser.avatar) {
        btnIcon.innerHTML = `<img src="${currentUser.avatar}" class="h-8 w-8 rounded-full object-cover border border-blue-500">`;
    }
}

// 6. Detalles de Producto
function showProductDetails(id) {
    const p = products.find(prod => prod.id === id);
    if (!p) return;
    const modal = document.getElementById('product-modal');
    const content = document.getElementById('modal-content');
    const variantesHTML = p.variantes && p.variantes.length > 0 ? p.variantes.map(v => `
        <div class="flex justify-between py-2 border-b border-white/5 text-xs">
            <span class="text-gray-400">${v.medida}</span>
            <span class="text-blue-400 font-mono">${v.ref}</span>
        </div>
    `).join('') : '<p class="text-xs text-gray-500">Sin variantes específicas.</p>';

    content.innerHTML = `
        <div class="flex justify-between items-start mb-6">
            <h3 class="text-2xl font-black text-white uppercase tracking-tighter">${p.name}</h3>
            <button onclick="closeProductModal()" class="text-gray-500 hover:text-white p-2"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="bg-black rounded-2xl p-4 flex items-center justify-center border border-white/5">
                <img src="${p.image}" class="max-h-60 object-contain" onerror="this.src='https://placehold.co/400x300/111/fff'">
            </div>
            <div>
                <h4 class="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-2">Descripción Técnica</h4>
                <p class="text-gray-400 text-sm mb-6 leading-relaxed">${p.detalles || p.desc}</p>
                <h4 class="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-3">Modelos Disponibles</h4>
                <div class="bg-white/5 rounded-xl p-4 border border-white/5 mb-6">${variantesHTML}</div>
                <button onclick="addToCart('${p.id}'); closeProductModal()" class="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">Añadir a Cotización</button>
            </div>
        </div>
    `;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeProductModal() {
    document.getElementById('product-modal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function initApp() {
    initRealtimeUpdates(); // Carga de datos real desde Firebase
    checkAuthNavbar();
    setInterval(slideNext, 5000);
    window.addEventListener('resize', updateSlider);
}

document.addEventListener('DOMContentLoaded', initApp);

// 7. EXPOSICIÓN GLOBAL (CRUCIAL PARA QUE FUNCIONE EL HTML)
window.navigateTo = navigateTo;
window.toggleUserMenu = toggleUserMenu;
window.toggleCart = toggleCart;
window.toggleMobileMenu = toggleMobileMenu;
window.logoutUser = logoutUser;
window.slidePrev = slidePrev;
window.slideNext = slideNext;
window.updateCatalogFilter = updateCatalogFilter;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.sendToWhatsApp = sendToWhatsApp;
window.showProductDetails = showProductDetails;
window.closeProductModal = closeProductModal;
window.showToast = showToast;