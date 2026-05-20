let tempImage = ""; 

document.addEventListener('DOMContentLoaded', () => {
    // Seguridad
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || (currentUser.role !== 'administrador' && currentUser.role !== 'vendedor')) {
        window.location.href = 'inicio.html';
        return;
    }
    renderAdminTable(); 
});

function previewImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            tempImage = e.target.result;
            const preview = document.getElementById('prod-img-preview');
            if(preview) {
                preview.src = tempImage;
                preview.classList.remove('hidden');
            }
        };
        reader.readAsDataURL(file);
    }
}

function addProduct(e) {
    e.preventDefault();
    
    const name = document.getElementById('prod-name').value;
    const sku = document.getElementById('prod-sku').value;
    const cat = document.getElementById('prod-cat').value;
    const desc = document.getElementById('prod-desc').value;

    if (!tempImage) { alert("Por favor sube una imagen"); return; }

    let products = JSON.parse(localStorage.getItem('foura_catalog')) || [];
    
    const newProduct = {
        id: Date.now(),
        name: name,
        sku: sku.toUpperCase(),
        category: cat,
        desc: desc,
        image: tempImage,
        featured: true // <--- ¡ESTA ERA LA LÍNEA QUE FALTABA!
    };

    products.push(newProduct);
    localStorage.setItem('foura_catalog', JSON.stringify(products));
    
    e.target.reset();
    tempImage = "";
    const preview = document.getElementById('prod-img-preview');
    if(preview) preview.classList.add('hidden');
    
    renderAdminTable();
}

function renderAdminTable() {
    const rawData = localStorage.getItem('foura_catalog');
    if (!rawData) return; // Si no hay nada, no hacemos nada
    
    const products = JSON.parse(rawData);
    const tbody = document.getElementById('admin-product-list');
    
    if (!tbody) return;

    // Usamos el .map de forma segura
    tbody.innerHTML = products.map((p, index) => `
        <tr class="hover:bg-white/5 border-b border-white/5">
            <td class="p-4"><img src="${p.image}" class="h-12 w-12 object-cover rounded shadow-lg"></td>
            <td class="p-4 text-white">
                <div class="text-sm font-bold">${p.name}</div>
                <div class="text-[10px] text-blue-500 font-mono">${p.sku}</div>
            </td>
            <td class="p-4 text-center">
                <button onclick="deleteProduct(${index})" class="text-red-500 hover:text-white transition-colors">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function deleteProduct(index) {
    let products = JSON.parse(localStorage.getItem('foura_catalog'));
    products.splice(index, 1);
    localStorage.setItem('foura_catalog', JSON.stringify(products));
    renderAdminTable();
}