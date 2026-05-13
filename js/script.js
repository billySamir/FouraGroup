const products = [
    {
        id: 1,
        name: "Inversor de Frecuencia G120",
        sku: "FG-POW-440V",
        category: "electricidad",
        featured: true,
        image: "../img/invesor.webp",
        desc: "Control vectorial de alta precisión para motores."
    },
    {
        id: 2,
        name: "Válvula Solenoide Proceso V2",
        sku: "FG-MEC-V22",
        category: "mecanica",
        featured: true,
        image: "../img/valvula.png",
        desc: "Acero inoxidable para fluidos industriales."
    },
    {
        id: 3,
        name: "Sensor Inductivo IP67",
        sku: "FG-SEN-O9",
        category: "electricidad",
        featured: true,
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400",
        desc: "Detección metálica fiable en entornos hostiles."
    },
    {
        id: 4,
        name: "Taladro Industrial 20V Max",
        sku: "FG-TOOL-P8",
        category: "herramientas",
        featured: true,
        image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=400",
        desc: "Motor sin escobillas de alto torque."
    },
    {
        id: 5,
        name: "Manómetro de Glicerina",
        sku: "FG-MEC-MN-01",
        category: "mecanica",
        featured: false,
        image: "../img/manometro.png",
        desc: "Resistente a vibraciones extremas."
    },
    {
        id: 6,
        name: "Multímetro True RMS",
        sku: "FG-TOOL-MT-05",
        category: "herramientas",
        featured: false,
        image: "../img/multimetro.png",
        desc: "Medición profesional de parámetros eléctricos."
    },
    {
        id: 7,
        name: "Motor Trifásico 5HP",
        sku: "FG-POW-MOT-05",
        category: "electricidad",
        featured: true,
        image: "../img/motor.png",
        desc: "Eficiencia energética IE3 para planta."
    }
];

let cart = [];
let currentSlide = 0;
let activeCatalogCat = 'all';

function navigateTo(view) {

    const home = document.getElementById('view-home');
    const catalog = document.getElementById('view-catalog');

    if (view === 'catalog') {

        home.classList.add('hidden-view');

        setTimeout(() => {

            home.style.display = 'none';
            catalog.style.display = 'block';

            setTimeout(() => {
                catalog.classList.remove('hidden-view');
            }, 50);

            renderFullCatalog();

        }, 300);

    } else {

        catalog.classList.add('hidden-view');

        setTimeout(() => {

            catalog.style.display = 'none';
            home.style.display = 'block';

            setTimeout(() => {
                home.classList.remove('hidden-view');
            }, 50);

            loadDestacados();

        }, 300);
    }
}

function updateCatalogFilter(cat, btn) {

    activeCatalogCat = cat;

    document.querySelectorAll('.catalog-cat-btn')
        .forEach(b => b.classList.remove('active-filter'));

    btn.classList.add('active-filter');

    renderFullCatalog(
        document.getElementById('catalog-search').value
    );
}

function renderCard(product, isSlider = false) {

    return `
        <div class="${isSlider ? 'slider-item w-full md:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] shrink-0' : ''}">
            <div class="product-card p-6">

                <div class="h-44 bg-black rounded-xl mb-6 overflow-hidden flex items-center justify-center p-4">
                    <img src="${product.image}"
                        class="max-h-full object-contain"
                        onerror="this.src='https://placehold.co/400x300/111/fff?text=Foura+Group'">
                </div>

                <div class="flex justify-between items-start mb-2">
                    <span class="text-[10px] text-blue-500 font-bold uppercase tracking-widest">
                        ${product.category}
                    </span>

                    <span class="text-[10px] text-gray-600 font-mono">
                        ${product.sku}
                    </span>
                </div>

                <h3 class="text-lg font-black text-white leading-tight mb-2">
                    ${product.name}
                </h3>

                <p class="text-xs text-gray-500 mb-6 flex-grow">
                    ${product.desc}
                </p>

                <button
                    onclick="addToCart(${product.id})"
                    class="w-full bg-white/5 hover:bg-blue-600 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10 hover:border-blue-600"
                >
                    Añadir a Cotización
                </button>

            </div>
        </div>
    `;
}

function loadDestacados() {

    const slider = document.getElementById('destacados-slider');

    const destacados = products.filter(p => p.featured);

    slider.innerHTML = destacados
        .map(p => renderCard(p, true))
        .join('');
}

function renderFullCatalog(search = '') {

    const grid = document.getElementById('full-catalog-grid');

    const filtered = products.filter(product => {

        const matchesSearch =
            product.name.toLowerCase().includes(search.toLowerCase()) ||
            product.sku.toLowerCase().includes(search.toLowerCase());

        const matchesCategory =
            activeCatalogCat === 'all' ||
            product.category === activeCatalogCat;

        return matchesSearch && matchesCategory;
    });

    if (!filtered.length) {

        grid.innerHTML = `
            <div class="col-span-full py-20 text-center text-gray-600 uppercase text-xs tracking-[0.2em]">
                No se encontraron productos
            </div>
        `;

        return;
    }

    grid.innerHTML = filtered
        .map(product => renderCard(product))
        .join('');
}

document.getElementById('catalog-search')?.addEventListener('input', (e) => {
    renderFullCatalog(e.target.value);
});

function slideNext() {

    const container = document.getElementById('destacados-slider');

    const items = container.children.length;

    const perView =
        window.innerWidth >= 1024
            ? 3
            : window.innerWidth >= 768
                ? 2
                : 1;

    if (currentSlide < (items - perView)) {
        currentSlide++;
    } else {
        currentSlide = 0;
    }

    updateSlider();
}

function slidePrev() {

    if (currentSlide > 0) {
        currentSlide--;
    }

    updateSlider();
}

function updateSlider() {

    const container = document.getElementById('destacados-slider');

    const item = container.querySelector('.slider-item');

    if (!item) return;

    container.style.transform =
        `translateX(-${currentSlide * (item.offsetWidth + 24)}px)`;
}

function addToCart(id) {

    const product = products.find(p => p.id === id);

    const exists = cart.find(p => p.id === id);

    if (!exists) {

        cart.push({
            ...product,
            qty: 1
        });

        showToast(`Añadido: ${product.name}`);

    } else {

        showToast("Ya está en tu lista");
    }

    updateCartUI();
}

function removeFromCart(id) {

    cart = cart.filter(p => p.id !== id);

    updateCartUI();

    showToast("Producto eliminado");
}

function updateCartUI() {

    const list = document.getElementById('cart-items');

    document.getElementById('cart-count').innerText = cart.length;

    if (!cart.length) {

        list.innerHTML = `
            <div class="flex flex-col items-center justify-center py-20 text-gray-600 opacity-50">
                <i class="fa-solid fa-cart-flatbed text-4xl mb-4"></i>
                <p class="uppercase text-xs tracking-widest font-bold">
                    Tu lista está vacía
                </p>
            </div>
        `;

        return;
    }

    list.innerHTML = cart.map(item => `
        <div class="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-blue-600/30 transition-all">

            <img src="${item.image}"
                class="w-14 h-14 object-cover rounded-lg bg-black"
                onerror="this.src='https://placehold.co/100x100/111/fff?text=FG'">

            <div class="flex-grow">
                <h4 class="text-sm font-bold text-white line-clamp-1">
                    ${item.name}
                </h4>

                <p class="text-[10px] text-gray-500 font-mono">
                    ${item.sku}
                </p>
            </div>

            <button
                onclick="removeFromCart(${item.id})"
                class="p-3 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
            >
                <i class="fa-solid fa-trash-can"></i>
            </button>

        </div>
    `).join('');
}

function toggleCart() {

    document
        .getElementById('cart-drawer')
        .classList.toggle('hidden');
}

function showToast(text) {

    const toast = document.getElementById('toast');

    toast.innerText = text;

    toast.className = "show";

    setTimeout(() => {
        toast.className = "";
    }, 3000);
}

function sendToWhatsApp() {

    if (!cart.length) {

        showToast("Añade productos primero");
        return;
    }

    let message = "*SOLICITUD DE COTIZACIÓN - FOURA GROUP*%0A";
    message += "--------------------------------------------%0A";

    cart.forEach(item => {
        message += `• *${item.name}* [${item.sku}]%0A`;
    });

    message += "--------------------------------------------%0A";
    message += "Favor de enviar disponibilidad y precios.";

    window.open(
        `https://wa.me/51947121064?text=${message}`,
        '_blank'
    );
}

document.addEventListener('DOMContentLoaded', () => {
    // Carga inicial de datos
    loadDestacados();
    
    // Si estamos en la vista de catálogo, renderizarlo también
    if (document.getElementById('full-catalog-grid')) {
        renderFullCatalog();
    }

    // Slider automático
    setInterval(slideNext, 5000);
});

window.onresize = () => {
    updateSlider();
};