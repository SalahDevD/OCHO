// Vérifier l'authentification
if (!isAuthenticated()) {
    window.location.href = '../index.html';
}

const user = getUser();
document.getElementById('userRole').textContent = user.role;

// Afficher le lien Utilisateurs seulement pour les admins
if (user.role === 'Administrateur') {
    const usersLink = document.getElementById('usersLink');
    if (usersLink) usersLink.style.display = 'flex';
}

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

// Afficher les produits
function displayProducts(products) {
    const tbody = document.getElementById('productsBody');
    
    if (!products || products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8">Aucun produit trouvé</td></tr>';
        return;
    }
    
    tbody.innerHTML = products.map(product => `
        <tr>
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
    `).join('');
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
            const detailsHtml = `
                <div style="padding: 25px;">
                    <h4>${product.nom}</h4>
                    <p><strong>Référence:</strong> ${product.reference}</p>
                    <p><strong>Catégorie:</strong> ${product.categorie_nom}</p>
                    <p><strong>Genre:</strong> ${product.genre}</p>
                    <p><strong>Saison:</strong> ${product.saison}</p>
                    <p><strong>Prix Achat:</strong> ${formatPrice(product.prix_achat)}</p>
                    <p><strong>Prix Vente:</strong> ${formatPrice(product.prix_vente)}</p>
                    <p><strong>Seuil Minimum:</strong> ${product.seuil_min}</p>
                    
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
        description: document.getElementById('description').value
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

// Charger au démarrage
loadCategories();
loadProducts();
