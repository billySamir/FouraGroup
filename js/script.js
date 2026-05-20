// --- TU CATÁLOGO Y LÓGICA ORIGINAL ---
const defaultProducts = [
    { id: 1, name: "Inversor de Frecuencia G120", sku: "FG-POW-440V", category: "electricidad", featured: true, image: "../img/invesor.webp", desc: "Control vectorial de alta precisión para motores." },
    { id: 2, name: "Válvula Solenoide Proceso V2", sku: "FG-MEC-V22", category: "mecanica", featured: true, image: "../img/valvula.png", desc: "Acero inoxidable para fluidos industriales." },
    { id: 3, name: "Sensor Inductivo IP67", sku: "FG-SEN-O9", category: "electricidad", featured: true, image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400", desc: "Detección metálica fiable en entornos hostiles." },
    { id: 4, name: "Taladro Industrial 20V Max", sku: "FG-TOOL-P8", category: "herramientas", featured: true, image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=400", desc: "Motor sin escobillas de alto torque." },
    { id: 5, name: "Manómetro de Glicerina", sku: "FG-MEC-MN-01", category: "mecanica", featured: false, image: "../img/manometro.png", desc: "Resistente a vibraciones extremas." },
    { id: 6, name: "Multímetro True RMS", sku: "FG-TOOL-MT-05", category: "herramientas", featured: false, image: "../img/multimetro.png", desc: "Medición profesional de parámetros eléctricos." },
    { id: 7, name: "Motor Trifásico 5HP", sku: "FG-POW-MOT-05", category: "electricidad", featured: true, image: "../img/motor.png", desc: "Eficiencia energética IE3 para planta." }
];

// Integración de almacenamiento para Administrador
let products = JSON.parse(localStorage.getItem('foura_catalog'));

// Si no hay productos guardados, o si el arreglo quedó vacío por error, 
// restauramos los productos por defecto inmediatamente.
if (!products || products.length === 0) {
    products = defaultProducts;
    localStorage.setItem('foura_catalog', JSON.stringify(products));
}
let cart = [];
let currentSlide = 0;
let activeCatalogCat = 'all';

// --- TUS FUNCIONES ORIGINALES ---
function navigateTo(view) {
    const home = document.getElementById('view-home');
    const catalog = document.getElementById('view-catalog');
    if (view === 'catalog') {
        home.classList.add('view-hidden');
        setTimeout(() => { home.style.display = 'none'; catalog.style.display = 'block'; setTimeout(() => catalog.classList.remove('view-hidden'), 50); renderFullCatalog(); }, 300);
    } else {
        catalog.classList.add('view-hidden');
        setTimeout(() => { catalog.style.display = 'none'; home.style.display = 'block'; setTimeout(() => home.classList.remove('view-hidden'), 50); loadDestacados(); currentSlide = 0; updateSlider(); }, 300);
    }
}

function updateCatalogFilter(cat, btn) {
    activeCatalogCat = cat;
    document.querySelectorAll('.catalog-cat-btn').forEach(b => b.classList.remove('active-filter'));
    btn.classList.add('active-filter');
    renderFullCatalog(document.getElementById('catalog-search').value);
}

function renderCard(product, isSlider = false) {
    return `
        <div class="${isSlider ? 'slider-item w-full md:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] shrink-0' : ''}">
            <div class="product-card p-6">
                <div class="h-44 bg-black rounded-xl mb-6 overflow-hidden flex items-center justify-center p-4">
                    <img src="${product.image}" class="max-h-full object-contain" onerror="this.src='https://placehold.co/400x300/111/fff?text=Foura+Group'">
                </div>
                <div class="flex justify-between items-start mb-2">
                    <span class="text-[10px] text-blue-500 font-bold uppercase tracking-widest">${product.category}</span>
                    <span class="text-[10px] text-gray-600 font-mono">${product.sku}</span>
                </div>
                <h3 class="text-lg font-black text-white leading-tight mb-2">${product.name}</h3>
                <p class="text-xs text-gray-500 mb-6 flex-grow">${product.desc}</p>
                <button onclick="addToCart(${product.id})" class="w-full bg-white/5 hover:bg-blue-600 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10 hover:border-blue-600">
                    Añadir a Cotización
                </button>
            </div>
        </div>
    `;
}

function loadDestacados() {
    const slider = document.getElementById('destacados-slider');
    if (!slider) return;
    const destacados = products.filter(p => p.featured);
    slider.innerHTML = destacados.map(p => renderCard(p, true)).join('');
}

function renderFullCatalog(search = '') {
    const grid = document.getElementById('full-catalog-grid');
    if (!grid) return;
    const filtered = products.filter(p => (p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())) && (activeCatalogCat === 'all' || p.category === activeCatalogCat));
    grid.innerHTML = filtered.length ? filtered.map(p => renderCard(p)).join('') : `<div class="col-span-full py-20 text-center text-gray-600 uppercase text-xs tracking-[0.2em]">No se encontraron productos</div>`;
}

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
    if (currentSlide < (container.children.length - perView)) currentSlide++; else currentSlide = 0;
    updateSlider();
}

function slidePrev() {
    if (currentSlide > 0) currentSlide--; else { const container = document.getElementById('destacados-slider'); const perView = window.innerWidth >= 1024 ? 3 : (window.innerWidth >= 768 ? 2 : 1); if (container) currentSlide = container.children.length - perView; }
    updateSlider();
}

function addToCart(id) {
    const p = products.find(prod => prod.id === id);
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
            <button onclick="removeFromCart(${item.id})" class="p-3 text-gray-500 hover:text-red-500"><i class="fa-solid fa-trash-can"></i></button>
        </div>
    `).join('') : `<div class="text-center py-20 text-gray-600 uppercase text-xs tracking-widest font-bold">Tu lista está vacía</div>`;
}

function toggleCart() { document.getElementById('cart-drawer').classList.toggle('hidden'); }
function toggleMobileMenu() { document.getElementById('mobile-menu').classList.toggle('hidden'); }
function showToast(text) { const toast = document.getElementById('toast'); if (!toast) return; toast.innerText = text; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 3000); }
function sendToWhatsApp() {
    if (!cart.length) { showToast("Añade productos primero"); return; }
    let message = "*SOLICITUD DE COTIZACIÓN - FOURA GROUP*\n-----------------------------------------\n";
    cart.forEach(item => { message += `• *${item.name}* [${item.sku}]\n`; });
    window.open(`https://wa.me/51947121064?text=${encodeURIComponent(message)}`, '_blank');
}

// --- LOGICA DE ROLES Y FOTO DE PERFIL ---
function toggleUserMenu() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const dropdown = document.getElementById('user-dropdown');
    if (currentUser) {
        document.getElementById('dropdown-user-name').innerText = `${currentUser.name} ${currentUser.lastname || ''}`;
        // Muestra panel admin solo si tiene el rol
        const adminBtn = document.getElementById('btn-admin-panel');
        if (adminBtn) adminBtn.className = (currentUser.role === 'administrador' || currentUser.role === 'vendedor') ? "flex w-full text-left px-4 py-3 text-xs font-bold text-green-400 hover:bg-green-500/10 border-b border-white/5 items-center" : "hidden";
        dropdown.classList.toggle('hidden');
    } else { window.location.href = 'registro.html'; }
}

function logoutUser() { localStorage.removeItem('currentUser'); window.location.reload(); }

function checkAuthNavbar() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const btnIcon = document.getElementById('user-icon-btn');
    if (currentUser && btnIcon && currentUser.avatar) {
        btnIcon.innerHTML = `<img src="${currentUser.avatar}" class="h-8 w-8 rounded-full object-cover border border-blue-500">`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadDestacados();
    checkAuthNavbar();
    if (document.getElementById('full-catalog-grid')) renderFullCatalog();
    setInterval(slideNext, 5000);
    window.addEventListener('resize', updateSlider);
});