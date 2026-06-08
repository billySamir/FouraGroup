import { db } from './db.js'; // Asegúrate de tener tu archivo db.js creado
// En admin.js
import { collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

let tempImage = ""; 

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

async function addProduct(e) {
    e.preventDefault();
    
    const name = document.getElementById('prod-name').value;
    const sku = document.getElementById('prod-sku').value;
    const cat = document.getElementById('prod-cat').value;
    const desc = document.getElementById('prod-desc').value;
    const detalles = document.getElementById('prod-detalles').value;
    const rawVariantes = document.getElementById('prod-variantes').value;

    if (!tempImage) { alert("Por favor sube una imagen"); return; }


    const variantes = rawVariantes.split(',').map(item => {
        const [medida, ref] = item.split(':');
        return { medida: medida ? medida.trim() : "", ref: ref ? ref.trim() : "" };
    });

    try {
        await addDoc(collection(db, "productos"), {
            name: name,
            sku: sku.toUpperCase(),
            category: cat,
            desc: desc,
            detalles: detalles,
            variantes: variantes,
            image: tempImage,
            featured: true 
        });
        
        alert("¡Producto publicado con éxito en la nube!");
        e.target.reset();
        tempImage = "";
        document.getElementById('prod-img-preview').classList.add('hidden');
        renderAdminTable();
    } catch (error) {
        console.error("Error al publicar:", error);
    }
}


async function renderAdminTable() {
    const tbody = document.getElementById('admin-product-list');
    if (!tbody) return;

    try {
        const querySnapshot = await getDocs(collection(db, "productos"));
        tbody.innerHTML = ""; 
        
        querySnapshot.forEach((doc) => {
            const p = doc.data();
            const id = doc.id; 
            
            tbody.innerHTML += `
                <tr class="hover:bg-white/5 border-b border-white/5">
                    <td class="p-4"><img src="${p.image}" class="h-12 w-12 object-cover rounded shadow-lg"></td>
                    <td class="p-4 text-white">
                        <div class="text-sm font-bold">${p.name}</div>
                        <div class="text-[10px] text-blue-500 font-mono">${p.sku}</div>
                    </td>
                    <td class="p-4 text-center">
                        <button onclick="deleteProduct('${id}')" class="text-red-500 hover:text-white transition-colors">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Error al cargar productos:", error);
    }
}

// Función para borrar
async function deleteProduct(id) {
    if (confirm("¿Eliminar este producto de la nube?")) {
        try {
            await deleteDoc(doc(db, "productos", id));
            renderAdminTable();
        } catch (error) {
            console.error("Error al eliminar:", error);
        }
    }
}


function showToast(text) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.innerText = text;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}


window.showToast = showToast;

window.addProduct = addProduct;
window.deleteProduct = deleteProduct;
window.previewImage = previewImage;


document.addEventListener('DOMContentLoaded', renderAdminTable);

window.addProduct = addProduct;
window.deleteProduct = deleteProduct;
window.previewImage = previewImage;
window.showToast = showToast;