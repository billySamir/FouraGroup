import { db } from './db.js';
import { collection, addDoc, deleteDoc, doc, getDoc, updateDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

let tempImage = ""; 
let allProducts = []; // Variable global para el buscador instantáneo
let productToDeleteId = null; // Variable para recordar qué producto vamos a borrar

// 1. Previsualizar Imagen
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

// 2. Guardar Producto (Crear o Editar)
async function saveProduct(e) {
    e.preventDefault();
    
    const id = document.getElementById('edit-product-id').value;
    const name = document.getElementById('prod-name').value;
    const sku = document.getElementById('prod-sku').value;
    const cat = document.getElementById('prod-cat').value;
    const desc = document.getElementById('prod-desc').value;
    const detalles = document.getElementById('prod-detalles').value;
    const rawVariantes = document.getElementById('prod-variantes').value;

    if (!id && !tempImage) { 
        showToast("Por favor sube una imagen para el nuevo producto", "error"); 
        return; 
    }

    // Convertir string de variantes a array de objetos
    const variantes = rawVariantes ? rawVariantes.split(',').map(item => {
        const [medida, ref] = item.split(':');
        return { medida: medida ? medida.trim() : "", ref: ref ? ref.trim() : "" };
    }).filter(v => v.medida !== "") : [];

    const productData = {
        name: name,
        sku: sku.toUpperCase(),
        category: cat,
        desc: desc,
        detalles: detalles,
        variantes: variantes,
        featured: true // Por defecto
    };

    // Solo actualizar imagen si se subió una nueva
    if (tempImage) {
        productData.image = tempImage;
    }

    try {
        if (id) {
            // ACTUALIZAR EXISTENTE
            await updateDoc(doc(db, "productos", id), productData);
            showToast("¡Producto actualizado exitosamente!");
        } else {
            // CREAR NUEVO
            await addDoc(collection(db, "productos"), productData);
            showToast("¡Producto publicado con éxito!");
        }
        resetForm();
    } catch (error) {
        console.error("Error al guardar:", error);
        showToast("Error al procesar la solicitud", "error");
    }
}

// 3. Cargar datos para editar
async function editProduct(id) {
    try {
        const docSnap = await getDoc(doc(db, "productos", id));
        if (docSnap.exists()) {
            const data = docSnap.data();
            
            document.getElementById('form-title').innerText = "Editar Producto";
            document.getElementById('edit-product-id').value = id;
            document.getElementById('prod-name').value = data.name;
            document.getElementById('prod-sku').value = data.sku;
            document.getElementById('prod-cat').value = data.category || '';
            document.getElementById('prod-desc').value = data.desc;
            document.getElementById('prod-detalles').value = data.detalles || '';
            
            // Reconstruir string de variantes
            if (data.variantes && data.variantes.length > 0) {
                document.getElementById('prod-variantes').value = data.variantes.map(v => `${v.medida}:${v.ref}`).join(', ');
            } else {
                document.getElementById('prod-variantes').value = '';
            }

            // Mostrar imagen actual
            tempImage = ""; // Reseteamos la nueva imagen
            const preview = document.getElementById('prod-img-preview');
            preview.src = data.image;
            preview.classList.remove('hidden');

            document.getElementById('btn-cancel').classList.remove('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    } catch (error) {
        console.error("Error al cargar producto para editar:", error);
    }
}

// 4. Limpiar Formulario
function resetForm() {
    document.getElementById('product-form').reset();
    document.getElementById('edit-product-id').value = "";
    document.getElementById('form-title').innerText = "Nuevo Producto";
    document.getElementById('prod-img-preview').classList.add('hidden');
    document.getElementById('btn-cancel').classList.add('hidden');
    tempImage = "";
}

// --- NUEVA LÓGICA DE ELIMINACIÓN CON MODAL ---

// 5a. Abre el modal de confirmación
function deleteProduct(id) {
    productToDeleteId = id;
    const modal = document.getElementById('delete-modal');
    const content = document.getElementById('delete-modal-content');
    
    modal.classList.remove('hidden');
    
    setTimeout(() => {
        content.classList.remove('scale-95', 'opacity-0');
        content.classList.add('scale-100', 'opacity-100');
    }, 10);
}

// 5b. Cierra el modal si se arrepiente
function cancelDelete() {
    const content = document.getElementById('delete-modal-content');
    
    content.classList.remove('scale-100', 'opacity-100');
    content.classList.add('scale-95', 'opacity-0');
    
    setTimeout(() => {
        document.getElementById('delete-modal').classList.add('hidden');
        productToDeleteId = null;
    }, 300);
}

// 5c. Ejecuta el borrado en Firebase si confirma
async function confirmDelete() {
    if (!productToDeleteId) return;
    
    try {
        await deleteDoc(doc(db, "productos", productToDeleteId));
        showToast("Producto eliminado correctamente");
    } catch (error) {
        console.error("Error al eliminar:", error);
        showToast("Error al eliminar producto", "error");
    }
    
    cancelDelete();
}
// ---------------------------------------------

// 6. Escuchar base de datos y preparar buscador
function initAdminTable() {
    // Escuchamos a Firebase
    onSnapshot(collection(db, "productos"), (snapshot) => {
        allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderAdminTable(); // Dibuja la tabla inicial
    });

    // Añadimos los eventos al buscador y al selector de categoría
    const searchInput = document.getElementById('admin-search');
    const filterSelect = document.getElementById('admin-filter');
    
    if (searchInput) searchInput.addEventListener('input', renderAdminTable);
    if (filterSelect) filterSelect.addEventListener('change', renderAdminTable);
}

// 7. Renderizar tabla con diseño avanzado
function renderAdminTable() {
    const tbody = document.getElementById('admin-product-list');
    const countSpan = document.getElementById('item-count');
    if (!tbody) return;

    // Obtener los valores del buscador y filtro
    const searchTerm = document.getElementById('admin-search').value.toLowerCase();
    const filterCat = document.getElementById('admin-filter').value;

    // Filtrar la lista en memoria
    const filteredProducts = allProducts.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm) || (p.sku && p.sku.toLowerCase().includes(searchTerm));
        const matchesCat = filterCat === 'all' || p.category === filterCat;
        return matchesSearch && matchesCat;
    });

    // Actualizar contador
    if (countSpan) {
        countSpan.innerText = `${filteredProducts.length} Items`;
    }

    // Dibujar HTML
    tbody.innerHTML = filteredProducts.map(p => {
        
        // Estilos de la etiqueta (Pill) de Categoría
        let catStyles = "border-gray-500 text-gray-500";
        if (p.category === 'electricidad') catStyles = "border-yellow-500 text-yellow-500 bg-yellow-500/10";
        else if (p.category === 'mecanica') catStyles = "border-blue-500 text-blue-500 bg-blue-500/10";
        else if (p.category === 'herramientas') catStyles = "border-green-500 text-green-500 bg-green-500/10";

        return `
            <tr class="hover:bg-[#111] transition-colors">
                <td class="p-4">
                    <div class="w-10 h-10 rounded-lg bg-black border border-white/5 overflow-hidden flex items-center justify-center mx-auto">
                        <img src="${p.image}" class="w-full h-full object-cover">
                    </div>
                </td>
                <td class="p-4">
                    <div class="text-[13px] font-bold text-white tracking-wide">${p.name}</div>
                    <div class="text-[10px] text-blue-600 font-bold mt-1 tracking-wider">${p.sku || 'N/A'}</div>
                </td>
                <td class="p-4 text-center">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${catStyles}">
                        ${p.category || 'Sin Cat'}
                    </span>
                </td>
                <td class="p-4">
                    <div class="flex justify-center gap-2">
                        <button onclick="editProduct('${p.id}')" class="w-8 h-8 rounded-lg bg-[#1a1a1a] border border-white/5 text-blue-500 hover:bg-[#222] hover:border-blue-500/30 transition-all flex items-center justify-center shadow-lg" title="Editar">
                            <i class="fa-solid fa-pen-to-square text-xs"></i>
                        </button>
                        <button onclick="deleteProduct('${p.id}')" class="w-8 h-8 rounded-lg bg-[#1a1a1a] border border-white/5 text-red-500 hover:bg-[#222] hover:border-red-500/30 transition-all flex items-center justify-center shadow-lg" title="Eliminar">
                            <i class="fa-solid fa-trash text-xs"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// 8. Toast Moderno
function showToast(text, type = 'success') {
    const existingToast = document.getElementById('modern-toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.id = 'modern-toast';
    
    const isSuccess = type === 'success';
    const bgColor = isSuccess ? 'bg-[#1a2e1a] border-green-500' : 'bg-[#2e1a1a] border-red-500';
    const textColor = isSuccess ? 'text-green-400' : 'text-red-400';
    const icon = isSuccess ? 'fa-circle-check' : 'fa-circle-exclamation';

    toast.className = `fixed top-24 right-6 z-[9999] flex items-center gap-3 px-6 py-4 rounded-xl border shadow-2xl font-bold tracking-wide transform transition-all duration-500 translate-x-[150%] ${bgColor} ${textColor}`;
    
    toast.innerHTML = `
        <i class="fa-solid ${icon} text-2xl"></i>
        <span>${text}</span>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.remove('translate-x-[150%]');
        toast.classList.add('translate-x-0');
    }, 10);

    setTimeout(() => {
        toast.classList.remove('translate-x-0');
        toast.classList.add('translate-x-[150%]');
        setTimeout(() => toast.remove(), 500); 
    }, 3500);
}

// Inicialización
document.addEventListener('DOMContentLoaded', initAdminTable);

// Exposición Global
window.saveProduct = saveProduct;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.cancelDelete = cancelDelete;
window.confirmDelete = confirmDelete;
window.previewImage = previewImage;
window.resetForm = resetForm;
window.showToast = showToast;