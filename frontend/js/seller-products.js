// Vérifier l'authentification
if (!isAuthenticated()) {
    window.location.href = '../index.html';
}

const user = getUser();
document.getElementById('userRole').textContent = user.role;

// Load navigation based on role
loadNavigation(user.role);

// Vérifier que l'utilisateur est vendeur
if (user.role !== 'Employé') {
    alert('Accès refusé. Seuls les vendeurs peuvent accéder à cette page.');
    window.location.href = 'dashboard.html';
}

let allProducts = [];
let categories = [];
let currentEditId = null;

// Format price helper
function formatPrice(price) {
    return new Intl.NumberFormat('fr-MA', {
        style: 'currency',
        currency: 'MAD'
    }).format(price || 0);
}

// Charger les produits du vendeur
async function loadProducts() {
    try {
        showLoading(true);
        
        // Utiliser l'endpoint spécifique pour les produits du vendeur
        const result = await apiRequest(`/products/vendeur/${user.id}`);
        
        if (result.success) {
            allProducts = result.products;
            displayProducts(allProducts);
            updateStats();
        } else {
            // Fallback: filtrer les produits
            const allResult = await apiRequest('/products');
            if (allResult.success) {
                allProducts = allResult.products.filter(p => p.vendeur_id === user.id);
                displayProducts(allProducts);
                updateStats();
            }
        }
    } catch (error) {
        console.error('Erreur chargement produits:', error);
        showError('Erreur lors du chargement des produits');
    } finally {
        showLoading(false);
    }
}

// Charger les catégories
async function loadCategories() {
    try {
        const result = await apiRequest('/products/categories/all');
        
        if (result.success) {
            categories = result.categories;
            populateCategorySelects();
        }
    } catch (error) {
        console.error('Erreur chargement catégories:', error);
    }
}

// Remplir les sélecteurs de catégories
function populateCategorySelects() {
    const select = document.getElementById('categorie_id');
    const editSelect = document.getElementById('edit_categorie_id');
    
    if (select) {
        select.innerHTML = '<option value="">Sélectionnez...</option>';
        categories.forEach(cat => {
            select.innerHTML += `<option value="${cat.id}">${cat.nom}</option>`;
        });
    }
    
    if (editSelect) {
        editSelect.innerHTML = '<option value="">Sélectionnez...</option>';
        categories.forEach(cat => {
            editSelect.innerHTML += `<option value="${cat.id}">${cat.nom}</option>`;
        });
    }
}

// Afficher les produits
function displayProducts(products) {
    const tbody = document.getElementById('productsBody');
    const emptyState = document.getElementById('emptyState');
    
    if (!products || products.length === 0) {
        if (tbody) tbody.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    
    if (tbody) {
        tbody.innerHTML = products.map(product => `
            <tr>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 40px; height: 40px; background: #f5f5f5; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
                            ${product.image_url ? `<img src="${product.image_url}" alt="${product.nom}" style="max-width: 100%; max-height: 100%; object-fit: cover;">` : '📦'}
                        </div>
                        <div>
                            <strong>${product.reference}</strong>
                            <div style="font-size: 12px; color: #666;">${product.categorie_nom || ''}</div>
                        </div>
                    </div>
                </td>
                <td>${product.nom}</td>
                <td>${formatPrice(product.prix_vente)}</td>
                <td>
                    <span style="
                        padding: 4px 8px;
                        border-radius: 4px;
                        font-size: 12px;
                        background: ${(product.stock_total || 0) > 0 ? '#4caf50' : '#f44336'};
                        color: white;
                    ">
                        ${product.stock_total || 0}
                    </span>
                </td>
                <td>
                    <span style="
                        padding: 4px 8px;
                        border-radius: 4px;
                        background: ${product.actif ? '#4caf50' : '#f44336'};
                        color: white;
                        font-size: 12px;
                    ">
                        ${product.actif ? 'Actif' : 'Inactif'}
                    </span>
                </td>
                <td>
                    <button class="btn-small btn-edit" onclick="openEditModal(${product.id})" style="padding: 4px 8px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 5px;">✏️</button>
                    <button class="btn-small btn-delete" onclick="deleteProduct(${product.id})" style="padding: 4px 8px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;">🗑️</button>
                </td>
            </tr>
        `).join('');
    }
}

// Mettre à jour les statistiques
function updateStats() {
    const totalProducts = document.getElementById('totalProducts');
    const activeProducts = document.getElementById('activeProducts');
    const lowStockProducts = document.getElementById('lowStockProducts');
    
    if (totalProducts) {
        totalProducts.textContent = allProducts.length;
    }
    
    if (activeProducts) {
        const activeCount = allProducts.filter(p => p.actif).length;
        activeProducts.textContent = activeCount;
    }
    
    if (lowStockProducts) {
        const lowStockCount = allProducts.filter(p => (p.stock_total || 0) <= 5).length;
        lowStockProducts.textContent = lowStockCount;
    }
}

// Filtrer les produits
function filterProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const categoryFilter = document.getElementById('categoryFilter').value;
    
    const filtered = allProducts.filter(product => {
        const matchSearch = product.nom.toLowerCase().includes(searchTerm) || 
                          product.reference.toLowerCase().includes(searchTerm);
        const matchStatus = !statusFilter || product.actif.toString() === statusFilter;
        const matchCategory = !categoryFilter || product.categorie_id == categoryFilter;
        
        return matchSearch && matchStatus && matchCategory;
    });
    
    displayProducts(filtered);
}

// Ouvrir modal d'ajout
function openAddModal() {
    currentEditId = null;
    document.getElementById('modalTitle').textContent = 'Ajouter un Produit';
    
    // Get all form elements and reset them
    const form = document.getElementById('productForm');
    form.reset();
    
    // Explicitly reset stock field to 0
    const stockField = document.getElementById('stock');
    if (stockField) {
        stockField.value = 0;
        stockField.defaultValue = 0;
    }
    
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('previewImg').src = '';
    document.getElementById('productModal').style.display = 'block';
}

// Ouvrir modal d'édition
async function openEditModal(productId) {
    try {
        const result = await apiRequest(`/products/${productId}`);
        
        if (result.success) {
            const product = result.product;
            currentEditId = productId;
            
            // Vérifier si le formulaire d'édition existe
            const editForm = document.getElementById('editProductForm');
            if (!editForm) {
                console.warn('Formulaire d\'édition non disponible');
                showError('Édition non disponible');
                return;
            }
            
            // Remplir le formulaire
            const fieldsMap = {
                'edit_reference': 'reference',
                'edit_nom': 'nom',
                'edit_description': 'description',
                'edit_categorie_id': 'categorie_id',
                'edit_genre': 'genre',
                'edit_prix_achat': 'prix_achat',
                'edit_prix_vente': 'prix_vente',
                'edit_saison': 'saison',
                'edit_marque': 'marque',
                'edit_seuil_min': 'seuil_min'
            };
            
            for (const [elementId, productField] of Object.entries(fieldsMap)) {
                const element = document.getElementById(elementId);
                if (element) {
                    element.value = product[productField] || '';
                }
            }

            // Get stock from the default variant or calculate from all variants
            let totalStock = 0;
            if (product.variantes && product.variantes.length > 0) {
                // Sum all variant quantities
                totalStock = product.variantes.reduce((sum, v) => sum + (v.quantite || 0), 0);
            }
            
            const editStockField = document.getElementById('edit_stock');
            if (editStockField) {
                editStockField.value = totalStock;
            }
            
            // Afficher l'image existante
            const currentImageDisplay = document.getElementById('current_image_display');
            if (currentImageDisplay) {
                if (product.image_url) {
                    currentImageDisplay.innerHTML = `<img src="${product.image_url}" style="max-width: 150px; max-height: 150px; border-radius: 4px; border: 1px solid #ddd;">`;
                } else {
                    currentImageDisplay.innerHTML = '<div style="width: 150px; height: 150px; background: #eee; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #999;">Pas d\'image</div>';
                }
            }
            
            const modal = document.getElementById('editModal');
            if (modal) {
                modal.style.display = 'flex';
            }
        }
    } catch (error) {
        console.error('Erreur chargement produit:', error);
        showError('Erreur lors du chargement du produit');
    }
}

// Fermer modals
function closeModal() {
    document.getElementById('productModal').style.display = 'none';
}

function closeEditModal() {
    const modal = document.getElementById('editModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Gestion des images
function previewImage(inputId, previewId, imgId) {
    const file = document.getElementById(inputId).files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const preview = document.getElementById(previewId);
            const previewImg = document.getElementById(imgId);
            previewImg.src = event.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

// Soumettre le formulaire d'ajout
document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const imageFile = document.getElementById('image').files[0];
    const data = getProductFormData('productForm');
    
    // Ajouter l'ID du vendeur
    data.vendeur_id = user.id;
    
    // Explicitly get stock value from the input field
    const stockInput = document.getElementById('stock');
    if (stockInput) {
        data.stock = parseInt(stockInput.value) || 0;
    } else {
        data.stock = 0;
    }
    
    if (imageFile) {
        const base64Image = await fileToBase64(imageFile);
        data.image_url = base64Image;
    }
    
    console.log('Product form data being submitted:', data);
    await submitProductForm(null, data, 'add');
});

// Soumettre le formulaire d'édition (si le formulaire existe)
const editProductForm = document.getElementById('editProductForm');
if (editProductForm) {
    editProductForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const data = getProductFormData('editProductForm');
        
        // Explicitly get stock value from the input field
        const editStockInput = document.getElementById('edit_stock');
        if (editStockInput) {
            data.stock = parseInt(editStockInput.value) || 0;
        } else {
            data.stock = 0;
        }
        
        console.log('Edit product form data being submitted:', data);
        await submitProductForm(currentEditId, data, 'edit');
    });
}

// Obtenir les données du formulaire
function getProductFormData(formId) {
    const form = document.getElementById(formId);
    const formData = new FormData(form);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        // Exclure productId et les fichiers vides
        if (key === 'productId' || key === 'image' || key === 'stock') {
            // stock is handled separately
            continue;
        }
        
        // Convertir les valeurs numériques
        if (key.includes('prix') || key.includes('seuil')) {
            data[key] = parseFloat(value) || 0;
        } else if (key === 'categorie_id') {
            data[key] = parseInt(value) || null;
        } else if (value) {
            data[key] = value;
        }
    }
    
    return data;
}

// Convertir un fichier en base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Soumettre le formulaire de produit
async function submitProductForm(productId, data, mode) {
    try {
        showLoading(true);
        
        // Debug: log the data being sent
        console.log(`Submitting ${mode} product:`, data);
        
        let result;
        
        if (mode === 'edit' && productId) {
            // Modification
            result = await apiRequest(`/products/${productId}`, 'PUT', data);
        } else {
            // Création
            result = await apiRequest('/products', 'POST', data);
        }

        if (result.success) {
            showSuccess('Produit sauvegardé avec succès');
            
            if (mode === 'add') {
                closeModal();
            } else {
                closeEditModal();
            }
            
            loadProducts();
        } else {
            showError(result.message || 'Erreur lors de la sauvegarde');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showError('Erreur lors de la sauvegarde: ' + error.message);
    } finally {
        showLoading(false);
    }
}

// Supprimer un produit
async function deleteProduct(productId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
        return;
    }

    try {
        showLoading(true);
        
        const result = await apiRequest(`/products/${productId}`, 'DELETE');
        
        if (result.success) {
            showSuccess('Produit supprimé avec succès');
            loadProducts();
        } else {
            showError(result.message || 'Erreur lors de la suppression');
        }
    } catch (error) {
        console.error('Erreur suppression:', error);
        showError('Erreur lors de la suppression');
    } finally {
        showLoading(false);
    }
}

// Fonctions utilitaires pour les messages
function showLoading(show) {
    const loading = document.getElementById('loadingIndicator');
    if (loading) {
        loading.style.display = show ? 'block' : 'none';
    }
}

function showSuccess(message) {
    alert(message); // À remplacer par un système de notification plus élégant
}

function showError(message) {
    alert('Erreur: ' + message); // À remplacer par un système de notification plus élégant
}

// Charger les données au démarrage
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    loadCategories();
    
    // Ajouter les event listeners pour les aperçus d'images
    const imageInput = document.getElementById('image');
    if (imageInput) {
        imageInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const preview = document.getElementById('imagePreview');
                    const previewImg = document.getElementById('previewImg');
                    previewImg.src = e.target.result;
                    preview.style.display = 'block';
                };
                reader.readAsDataURL(this.files[0]);
            }
        });
    }
    
    // Vérifier si c'est une édition directe via URL
    const params = new URLSearchParams(window.location.search);
    if (params.has('edit')) {
        const productId = params.get('edit');
        openEditModal(parseInt(productId));
    }
});