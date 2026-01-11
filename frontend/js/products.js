// Vérifier l'authentification
if (!isAuthenticated()) {
    window.location.href = '../index.html';
}

const user = getUser();
document.getElementById('userRole').textContent = user.role;

// Bloquer l'accès pour les vendeurs (Employé)
if (user.role === 'Employé') {
    alert('Accès refusé. Les vendeurs doivent utiliser la page "Mes Produits".');
    window.location.href = 'seller-products.html';
}

// Load navigation based on role
loadNavigation(user.role);

let allProducts = [];
let categories = [];

// Charger les produits
async function loadProducts() {
    try {
        const result = await apiRequest('/products');
        
        if (result.success) {
            allProducts = result.products;
            displayProducts(allProducts);
        }
    } catch (error) {
        console.error('Erreur chargement produits:', error);
        alert('Erreur lors du chargement des produits');
    }
}

// Charger les catégories
async function loadCategories() {
    try {
        const result = await apiRequest('/products/categories/all');
        
        if (result.success) {
            categories = result.categories;
            
            const categorieFilter = document.getElementById('categorieFilter');
            const categorieSelect = document.getElementById('categorie_id');
            
            categories.forEach(cat => {
                categorieFilter.innerHTML += `<option value="${cat.id}">${cat.nom}</option>`;
                if (categorieSelect) {
                    categorieSelect.innerHTML += `<option value="${cat.id}">${cat.nom}</option>`;
                }
            });
        }
    } catch (error) {
        console.error('Erreur chargement catégories:', error);
    }
}

// Obtenir le HTML pour afficher une image
function getImageHtml(imageValue) {
    if (!imageValue) {
        return '<span style="font-size: 24px;">👕</span>';
    }
    
    // C'est un emoji (1-2 caractères)
    if (imageValue.length <= 2) {
        return `<span style="font-size: 24px;">${imageValue}</span>`;
    }
    
    // C'est une URL ou data URI - Utiliser une image sûre
    if (imageValue.startsWith('http') || imageValue.startsWith('data:')) {
        // Créer un conteneur avec gestion d'erreur
        return `<div style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
                    <img src="${imageValue.replace(/"/g, '&quot;')}" alt="Image" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px; onerror='this.innerHTML=\\\"👕\\\"'">
                </div>`;
    }
    
    return '<span style="font-size: 24px;">👕</span>';
}

// Afficher les produits
function displayProducts(products) {
    const tbody = document.getElementById('productsBody');
    
    if (!products || products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9">Aucun produit trouvé</td></tr>';
        return;
    }
    
    tbody.innerHTML = products.map(product => {
        const imageHtml = getImageHtml(product.image_url);
        return `
        <tr>
            <td>${imageHtml}</td>
            <td><strong>${product.reference}</strong></td>
            <td>${product.nom}</td>
            <td>${product.categorie_nom}</td>
            <td>${product.genre}</td>
            <td>${formatPrice(product.prix_vente)}</td>
            <td>${product.stock_total || 0}</td>
            <td>${product.nombre_variantes || 0}</td>
            <td>
                <button class="btn btn-info btn-sm" onclick="viewProduct(${product.id})">👁️</button>
                ${canEdit() ? `<button class="btn btn-warning btn-sm" onclick="editProduct(${product.id})">✏️</button>` : ''}
                ${canDelete() ? `<button class="btn btn-danger btn-sm" onclick="deleteProduct(${product.id})">🗑️</button>` : ''}
            </td>
        </tr>
    `}).join('');
}

// Filtrer les produits
function filterProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const categorieFilter = document.getElementById('categorieFilter').value;
    const genreFilter = document.getElementById('genreFilter').value;
    
    const filtered = allProducts.filter(product => {
        const matchSearch = product.nom.toLowerCase().includes(searchTerm) || 
                          product.reference.toLowerCase().includes(searchTerm);
        const matchCategorie = !categorieFilter || product.categorie_id == categorieFilter;
        const matchGenre = !genreFilter || product.genre === genreFilter;
        
        return matchSearch && matchCategorie && matchGenre;
    });
    
    displayProducts(filtered);
}

// Ouvrir modal d'ajout
function openAddModal() {
    document.getElementById('modalTitle').textContent = 'Nouveau Produit';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('productModal').style.display = 'block';
}

// Voir détails produit
async function viewProduct(id) {
    try {
        const result = await apiRequest(`/products/${id}`);
        
        if (result.success) {
            const product = result.product;
            
            // Préparer l'HTML de l'image
            let imageHtml = '';
            if (product.image_url) {
                if (product.image_url.length <= 2) {
                    // C'est un emoji
                    imageHtml = `<div style="font-size: 120px; text-align: center; margin-bottom: 20px;">${product.image_url}</div>`;
                } else if (product.image_url.startsWith('http') || product.image_url.startsWith('data:')) {
                    // C'est une URL - Échapper les guillemets pour la sécurité
                    const safeImageUrl = product.image_url.replace(/"/g, '&quot;');
                    imageHtml = `<div style="text-align: center; margin-bottom: 20px;"><img src="${safeImageUrl}" alt="Image produit" style="max-width: 200px; height: auto; border-radius: 8px; onerror='this.style.display=\\\"none\\\"'"></div>`;
                }
            } else {
                imageHtml = `<div style="font-size: 120px; text-align: center; margin-bottom: 20px;">👕</div>`;
            }
            
            const detailsHtml = `
                <div style="padding: 25px;">
                    ${imageHtml}
                    ${canEdit() ? `
                        <div style="text-align: center; margin-bottom: 20px;">
                            <button class="btn btn-warning" onclick="openImageEditorModal(${product.id}, '${(product.image_url || '').replace(/'/g, "\\'")}')">
                                🖼️ Modifier l'image
                            </button>
                        </div>
                    ` : ''}
                    <h4>${product.nom}</h4>
                    <p><strong>Référence:</strong> ${product.reference}</p>
                    <p><strong>Catégorie:</strong> ${product.categorie_nom}</p>
                    <p><strong>Genre:</strong> ${product.genre}</p>
                    <p><strong>Saison:</strong> ${product.saison}</p>
                    <p><strong>Prix Achat:</strong> ${formatPrice(product.prix_achat)}</p>
                    <p><strong>Prix Vente:</strong> ${formatPrice(product.prix_vente)}</p>
                    <p><strong>Seuil Minimum:</strong> ${product.seuil_min}</p>
                    <p><strong>Stock:</strong> ${product.stock || 0}</p>
                    
                    <h4 style="margin-top: 20px;">Variantes</h4>
                    <table style="width: 100%;">
                        <thead>
                            <tr>
                                <th>Taille</th>
                                <th>Couleur</th>
                                <th>Stock</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${product.variantes.map(v => `
                                <tr>
                                    <td>${v.taille}</td>
                                    <td>${v.couleur}</td>
                                    <td>${v.quantite}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            
            document.getElementById('productDetails').innerHTML = detailsHtml;
            document.getElementById('detailsModal').style.display = 'block';
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors du chargement des détails');
    }
}

// Ouvrir l'éditeur d'image depuis les détails
async function openImageEditorModal(productId, currentImage) {
    const newImage = prompt(
        'Choisissez un emoji pour l\'image:\n👕 👔 👗 👠 👜 🧣 🧤 👒 ⌚ 🎽 👖 👘 🥻 👙 🩱\n\nOu collez une URL d\'image',
        currentImage || ''
    );
    
    if (newImage !== null) {
        try {
            const result = await apiRequest(`/products/${productId}`, 'PUT', {
                image_url: newImage
            });
            
            if (result.success) {
                alert('Image modifiée avec succès');
                viewProduct(productId);
                loadProducts();
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la mise à jour de l\'image');
        }
    }
}

// Éditer produit
async function editProduct(id) {
    try {
        const result = await apiRequest(`/products/${id}`);
        
        if (result.success) {
            const product = result.product;
            
            document.getElementById('modalTitle').textContent = 'Modifier Produit';
            document.getElementById('productId').value = product.id;
            document.getElementById('reference').value = product.reference;
            document.getElementById('nom').value = product.nom;
            document.getElementById('categorie_id').value = product.categorie_id;
            document.getElementById('genre').value = product.genre;
            document.getElementById('saison').value = product.saison;
            document.getElementById('prix_achat').value = product.prix_achat;
            document.getElementById('prix_vente').value = product.prix_vente;
            document.getElementById('seuil_min').value = product.seuil_min;
            document.getElementById('description').value = product.description || '';
            document.getElementById('image_url').value = product.image_url || '';
            
            // Afficher l'image existante
            updateImagePreview(product.image_url || '👕');
            
            // Calculate total stock from variants
            let totalStock = 0;
            if (product.variantes && product.variantes.length > 0) {
                totalStock = product.variantes.reduce((sum, v) => sum + (v.quantite || 0), 0);
            }
            document.getElementById('stock').value = totalStock || 0;
            
            document.getElementById('productModal').style.display = 'block';
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors du chargement du produit');
    }
}
// Supprimer produit
async function deleteProduct(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
        return;
    }
    
    try {
        const result = await apiRequest(`/products/${id}`, 'DELETE');
        
        if (result.success) {
            alert('Produit supprimé avec succès');
            loadProducts();
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la suppression');
    }
}

// Soumettre le formulaire
document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const productId = document.getElementById('productId').value;
    const data = {
        reference: document.getElementById('reference').value,
        nom: document.getElementById('nom').value,
        categorie_id: parseInt(document.getElementById('categorie_id').value),
        genre: document.getElementById('genre').value,
        saison: document.getElementById('saison').value,
        prix_achat: parseFloat(document.getElementById('prix_achat').value),
        prix_vente: parseFloat(document.getElementById('prix_vente').value),
        seuil_min: parseInt(document.getElementById('seuil_min').value),
        stock: parseInt(document.getElementById('stock').value) || 0,
        description: document.getElementById('description').value,
        image_url: document.getElementById('image_url').value || ''
    };
    
    try {
        let result;
        if (productId) {
            result = await apiRequest(`/products/${productId}`, 'PUT', data);
        } else {
            result = await apiRequest('/products', 'POST', data);
        }
        
        if (result.success) {
            alert(productId ? 'Produit modifié avec succès' : 'Produit créé avec succès');
            closeModal();
            loadProducts();
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur: ' + error.message);
    }
});

// Fermer les modals
function closeModal() {
    document.getElementById('productModal').style.display = 'none';
}

function closeDetailsModal() {
    document.getElementById('detailsModal').style.display = 'none';
}

// Permissions
function canEdit() {
    return ['Administrateur', 'Magasinier'].includes(user.role);
}

function canDelete() {
    return user.role === 'Administrateur';
}

// Formater le prix
function formatPrice(price) {
    return new Intl.NumberFormat('fr-MA', {
        style: 'currency',
        currency: 'MAD'
    }).format(price);
}

// Mettre à jour l'aperçu de l'image
function updateImagePreview(imageValue) {
    const preview = document.getElementById('currentImagePreview');
    if (!preview) return;
    
    // Vider le contenu précédent
    preview.innerHTML = '';
    
    if (imageValue && imageValue.length <= 2) {
        // C'est un emoji
        preview.textContent = imageValue;
        preview.style.fontSize = '80px';
    } else if (imageValue && (imageValue.startsWith('http') || imageValue.startsWith('data:'))) {
        // C'est une URL ou data URI - Créer l'image de manière sûre
        try {
            const img = document.createElement('img');
            img.src = imageValue;
            img.alt = 'Aperçu du produit';
            img.style.maxWidth = '120px';
            img.style.maxHeight = '120px';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '8px';
            img.onerror = function() {
                // Si l'image ne charge pas, afficher l'emoji par défaut
                preview.innerHTML = '';
                preview.textContent = '👕';
                preview.style.fontSize = '80px';
            };
            preview.appendChild(img);
        } catch (e) {
            console.error('Erreur chargement image:', e);
            preview.textContent = '👕';
            preview.style.fontSize = '80px';
        }
    } else {
        // Par défaut
        preview.textContent = '👕';
        preview.style.fontSize = '80px';
    }
}

// Déclencher le choix d'emoji ou d'URL
function triggerImageInput() {
    const emojiList = ['👕', '👔', '👗', '👠', '👜', '🧣', '🧤', '👒', '⌚', '🎽', '👖', '👘', '🥻', '👙', '🩱'];
    
    const selected = prompt(
        'Choisissez un emoji pour l\'image:\n' + emojiList.join(' ') + 
        '\n\nOu collez une URL d\'image',
        document.getElementById('image_url').value || ''
    );
    
    if (selected !== null) {
        document.getElementById('image_url').value = selected;
        updateImagePreview(selected);
    }
}

// Mettre à jour l'aperçu à chaque changement du champ
document.addEventListener('DOMContentLoaded', function() {
    const imageInput = document.getElementById('image_url');
    if (imageInput) {
        imageInput.addEventListener('change', function() {
            updateImagePreview(this.value);
        });
        imageInput.addEventListener('keyup', function() {
            updateImagePreview(this.value);
        });
    }
});
// Charger au démarrage
loadCategories();
loadProducts();
