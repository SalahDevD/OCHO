// Vérifier l'authentification
if (!isAuthenticated()) {
    window.location.href = '../index.html';
}

const user = getUser();
document.getElementById('userRole').textContent = user.role;
document.getElementById('userName').textContent = `Bienvenue, ${user.nom}`;

// Load navigation based on role
loadNavigation(user.role);

let allProducts = [];
let categories = [];
let cart = [];
let currentDetailProduct = null;
let allClients = [];
let selectedClientId = null;

// Charger les produits
async function loadProducts() {
    try {
        showLoading(true);
        
        const result = await apiRequest('/products');
        
        if (result.success) {
            allProducts = result.products;
            
            // Ajouter l'URL complète pour les images si nécessaire
            allProducts = allProducts.map(product => {
                if (product.image_url && !product.image_url.startsWith('http') && !product.image_url.startsWith('data:')) {
                    // Si l'URL est relative, la convertir en absolue
                    product.image_url = product.image_url.startsWith('/') 
                        ? `http://localhost:5000${product.image_url}`
                        : `http://localhost:5000/${product.image_url}`;
                }
                return product;
            });
            
            displayProducts(allProducts);
        } else {
            showError('Erreur lors du chargement des produits');
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
            
            const categorieFilter = document.getElementById('categorieFilter');
            if (categorieFilter) {
                categorieFilter.innerHTML = '<option value="">Toutes les catégories</option>';
                categories.forEach(cat => {
                    categorieFilter.innerHTML += `<option value="${cat.id}">${cat.nom}</option>`;
                });
            }
        }
    } catch (error) {
        console.error('Erreur chargement catégories:', error);
    }
}

// Afficher les produits
function displayProducts(products) {
    const grid = document.getElementById('productsGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (!products || products.length === 0) {
        if (grid) {
            grid.innerHTML = '';
        }
        if (emptyState) {
            emptyState.style.display = 'block';
        }
        return;
    }
    
    if (emptyState) {
        emptyState.style.display = 'none';
    }
    
    if (grid) {
        grid.innerHTML = products.map(product => {
            const stock = product.stock_total || 0;
            const isOutOfStock = stock === 0;
            const stockClass = stock <= 5 && stock > 0 ? 'low' : '';
            const stockText = isOutOfStock ? 'Rupture de stock' : `${stock} en stock`;
            const stockIcon = isOutOfStock ? '❌' : '📦';
            
            // Gérer l'affichage de l'image
            let imageHtml = '<div style="font-size: 80px;">👕</div>'; // Fallback par défaut
            
            if (product.image_url) {
                // Vérifier si c'est un emoji (1-2 caractères)
                if (product.image_url.length <= 2) {
                    // C'est un emoji
                    imageHtml = `<div style="font-size: 80px; text-align: center;">${product.image_url}</div>`;
                } else if (product.image_url.startsWith('http') || product.image_url.startsWith('data:')) {
                    // C'est une URL valide
                    imageHtml = `<img src="${product.image_url}" alt="${product.nom}" 
                                  style="width: 100%; height: 100%; object-fit: cover;" 
                                  onerror="this.parentElement.innerHTML='<div style=\\'font-size: 80px; text-align: center;\\'}>👕</div>';">`;
                } else {
                    // Si c'est un chemin relatif, essayer de construire l'URL
                    const fullUrl = product.image_url.startsWith('/') 
                        ? `http://localhost:5000${product.image_url}`
                        : `http://localhost:5000/${product.image_url}`;
                    
                    imageHtml = `<img src="${fullUrl}" alt="${product.nom}" 
                                  style="width: 100%; height: 100%; object-fit: cover;" 
                                  onerror="this.parentElement.innerHTML='<div style=\\'font-size: 80px; text-align: center;\\'}>👕</div>';">`;
                }
            }
            
            return `
                <div class="product-card" style="border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; background: white;">
                    <div class="product-image">
                        ${imageHtml}
                    </div>
                    <div class="product-info" style="padding: 15px;">
                        <div class="product-name" style="font-weight: bold; font-size: 16px; margin-bottom: 5px;">${product.nom}</div>
                        <div class="product-reference" style="color: #666; font-size: 12px; margin-bottom: 5px;">${product.reference}</div>
                        <div class="product-price" style="color: #667eea; font-weight: bold; font-size: 18px; margin-bottom: 10px;">${formatPrice(product.prix_vente)}</div>
                        <div class="product-stock ${stockClass}" style="color: ${isOutOfStock ? '#f44336' : (stock <= 5 ? '#ff9800' : '#4caf50')}; margin-bottom: 15px;">
                            ${stockIcon} ${stockText}
                        </div>
                        <div class="product-actions" style="display: flex; gap: 10px;">
                            <input type="number" class="quantity-input" id="qty_${product.id}" value="1" min="1" max="${stock}" 
                                   style="width: 60px; padding: 5px; border: 1px solid #ddd; border-radius: 4px; text-align: center;"
                                   ${isOutOfStock ? 'disabled' : ''}>
                            <button class="btn-add-cart" onclick="addToCart(${product.id})" 
                                    style="flex: 1; padding: 8px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer;"
                                    ${isOutOfStock ? 'disabled' : ''}>
                                🛒 Ajouter
                            </button>
                            <button class="btn-details" onclick="showProductDetail(${product.id})"
                                    style="padding: 8px; background: #2196f3; color: white; border: none; border-radius: 4px; cursor: pointer;">
                                ℹ️
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
}

// Filtrer les produits
function filterProducts() {
    const searchInput = document.getElementById('searchInput');
    const categorieFilterEl = document.getElementById('categorieFilter');
    const genreFilterEl = document.getElementById('genreFilter');
    const priceFilterEl = document.getElementById('priceFilter');

    // Gestion des éléments nulls
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const categorieFilter = categorieFilterEl ? categorieFilterEl.value : '';
    const genreFilter = genreFilterEl ? genreFilterEl.value : '';
    const priceFilter = priceFilterEl ? priceFilterEl.value : '';

    const filtered = allProducts.filter(product => {
        const matchSearch = product.nom.toLowerCase().includes(searchTerm) ||
            product.reference.toLowerCase().includes(searchTerm);
        const matchCategorie = !categorieFilter || product.categorie_id == categorieFilter;
        const matchGenre = !genreFilter || product.genre === genreFilter;
        const matchPrice = !priceFilter || (
            priceFilter === 'low' ? product.prix_vente < 100 :
            priceFilter === 'medium' ? product.prix_vente >= 100 && product.prix_vente < 500 :
            priceFilter === 'high' ? product.prix_vente >= 500 : true
        );

        return matchSearch && matchCategorie && matchGenre && matchPrice;
    });

    displayProducts(filtered);
}

// Ajouter un produit au panier
function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    const qtyInput = document.getElementById(`qty_${productId}`);
    const quantity = parseInt(qtyInput.value) || 1;

    if (quantity <= 0) {
        showError('Veuillez entrer une quantité valide');
        return;
    }

    if ((product.stock_total || 0) < quantity) {
        showError('Stock insuffisant pour cette quantité');
        return;
    }

    // Get the default variante for this product
    let variante_id = null;
    if (product.variantes && product.variantes.length > 0) {
        // Find default variante (Standard/Défaut)
        const defaultVariante = product.variantes.find(v => 
            v.taille === 'Standard' && v.couleur === 'Défaut'
        );
        variante_id = defaultVariante ? defaultVariante.id : product.variantes[0].id;
    }

    // Vérifier si le produit est déjà dans le panier
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: productId,
            reference: product.reference,
            nom: product.nom,
            prix_vente: product.prix_vente,
            quantity: quantity,
            variante_id: variante_id,
            categorie_nom: product.categorie_nom,
            image_url: product.image_url
        });
    }

    qtyInput.value = 1;
    updateCart();
    showNotification(`${product.nom} ajouté au panier`, 'success');
}

// Mettre à jour l'affichage du panier
function updateCart() {
    const cartItems = document.getElementById('cartItems');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const cartTotal = document.getElementById('cartTotal');
    const cartSubtotal = document.getElementById('cartSubtotal');
    const cartCount = document.getElementById('cartCount');

    if (cart.length === 0) {
        if (cartItems) {
            cartItems.innerHTML = '<div style="text-align: center; padding: 20px; color: #999;">Panier vide</div>';
        }
        if (checkoutBtn) checkoutBtn.disabled = true;
        if (cartSubtotal) cartSubtotal.textContent = '0 DH';
        if (cartTotal) cartTotal.textContent = '0 DH';
        if (cartCount) cartCount.textContent = '0';
        return;
    }

    let total = 0;
    let totalItems = 0;

    const itemsHTML = cart.map((item, index) => {
        const itemTotal = item.prix_vente * item.quantity;
        total += itemTotal;
        totalItems += item.quantity;

        return `
            <div style="display: flex; align-items: center; padding: 10px; border-bottom: 1px solid #eee;">
                <div style="width: 50px; height: 50px; background: #f5f5f5; border-radius: 4px; margin-right: 10px; display: flex; align-items: center; justify-content: center;">
                    ${item.image_url ? `<img src="${item.image_url}" alt="${item.nom}" style="max-width: 100%; max-height: 100%; object-fit: cover;">` : '📦'}
                </div>
                <div style="flex: 1;">
                    <div style="font-weight: bold;">${item.nom}</div>
                    <div style="color: #666; font-size: 12px;">${item.reference}</div>
                    <div style="color: #667eea; font-weight: bold;">${formatPrice(item.prix_vente)} × ${item.quantity}</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: bold; margin-bottom: 5px;">${formatPrice(itemTotal)}</div>
                    <button onclick="removeFromCart(${index})" style="padding: 2px 6px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                        Supprimer
                    </button>
                </div>
            </div>
        `;
    }).join('');

    if (cartItems) cartItems.innerHTML = itemsHTML;
    if (checkoutBtn) checkoutBtn.disabled = false;
    if (cartSubtotal) cartSubtotal.textContent = formatPrice(total);
    if (cartTotal) cartTotal.textContent = formatPrice(total);
    if (cartCount) cartCount.textContent = totalItems.toString();
}

// Supprimer un article du panier
function removeFromCart(index) {
    if (index >= 0 && index < cart.length) {
        const itemName = cart[index].nom;
        cart.splice(index, 1);
        updateCart();
        showNotification(`${itemName} supprimé du panier`, 'info');
    }
}

// Afficher les détails d'un produit
async function showProductDetail(productId) {
    try {
        showLoading(true);
        
        const result = await apiRequest(`/products/${productId}`);
        
        if (result.success) {
            currentDetailProduct = result.product;
            
            // Gérer l'URL de l'image
            let imageUrl = currentDetailProduct.image_url;
            if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
                imageUrl = imageUrl.startsWith('/') 
                    ? `http://localhost:5000${imageUrl}`
                    : `http://localhost:5000/${imageUrl}`;
            }
            
            const detailHtml = `
                <div style="display: flex; gap: 20px;">
                    <div style="flex: 1;">
                        <div style="background: #f5f5f5; border-radius: 8px; padding: 20px; display: flex; align-items: center; justify-content: center; min-height: 300px;">
                            ${imageUrl ? `
                                <img src="${imageUrl}" alt="${currentDetailProduct.nom}" 
                                     style="max-width: 100%; max-height: 300px; object-fit: contain;"
                                     onerror="this.onerror=null; this.style.display='none'; this.parentElement.innerHTML='👕';">
                            ` : '👕'}
                        </div>
                    </div>
                    <div style="flex: 2;">
                        <h2 style="margin-top: 0;">${currentDetailProduct.nom}</h2>
                        <div style="color: #666; margin-bottom: 10px;">Référence: ${currentDetailProduct.reference}</div>
                        <div style="font-size: 24px; font-weight: bold; color: #667eea; margin-bottom: 20px;">
                            ${formatPrice(currentDetailProduct.prix_vente)}
                        </div>
                        
                        <div style="margin-bottom: 20px;">
                            <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                                <div style="flex: 1;">
                                    <strong>Catégorie:</strong>
                                    <div>${currentDetailProduct.categorie_nom || 'N/A'}</div>
                                </div>
                                <div style="flex: 1;">
                                    <strong>Genre:</strong>
                                    <div>${currentDetailProduct.genre || 'Unisexe'}</div>
                                </div>
                            </div>
                            <div style="display: flex; gap: 10px;">
                                <div style="flex: 1;">
                                    <strong>Marque:</strong>
                                    <div>${currentDetailProduct.marque || 'N/A'}</div>
                                </div>
                                <div style="flex: 1;">
                                    <strong>Saison:</strong>
                                    <div>${currentDetailProduct.saison || 'Toute saison'}</div>
                                </div>
                            </div>
                        </div>
                        
                        <div style="margin-bottom: 20px;">
                            <strong>Description:</strong>
                            <div style="color: #666; margin-top: 5px;">
                                ${currentDetailProduct.description || 'Aucune description disponible.'}
                            </div>
                        </div>
                        
                        <div style="margin-bottom: 20px;">
                            <strong>Stock:</strong>
                            <div style="color: ${(currentDetailProduct.stock_total || 0) > 0 ? '#4caf50' : '#f44336'}; font-weight: bold;">
                                ${(currentDetailProduct.stock_total || 0) > 0 ? `📦 ${currentDetailProduct.stock_total} en stock` : '❌ Rupture de stock'}
                            </div>
                        </div>
                        
                        ${(currentDetailProduct.stock_total || 0) > 0 ? `
                            <div style="display: flex; gap: 10px; align-items: center;">
                                <input type="number" id="detailQty" value="1" min="1" max="${currentDetailProduct.stock_total}" 
                                       style="width: 80px; padding: 10px; border: 1px solid #ddd; border-radius: 4px; text-align: center;">
                                <button onclick="addFromDetail()" 
                                        style="flex: 1; padding: 12px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
                                    🛒 Ajouter au panier
                                </button>
                            </div>
                        ` : '<div style="color: #f44336; font-weight: bold;">Produit en rupture de stock</div>'}
                    </div>
                </div>
            `;
            
            document.getElementById('detailContent').innerHTML = detailHtml;
            document.getElementById('productModal').style.display = 'block';
        }
    } catch (error) {
        console.error('Erreur chargement détails:', error);
        showError('Erreur lors du chargement des détails');
    } finally {
        showLoading(false);
    }
}

// Ajouter depuis la modal de détails
function addFromDetail() {
    if (!currentDetailProduct) return;

    const quantity = parseInt(document.getElementById('detailQty').value) || 1;
    if (quantity <= 0) {
        showError('Veuillez entrer une quantité valide');
        return;
    }

    const product = currentDetailProduct;
    if ((product.stock_total || 0) < quantity) {
        showError('Stock insuffisant pour cette quantité');
        return;
    }

    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            reference: product.reference,
            nom: product.nom,
            prix_vente: product.prix_vente,
            quantity: quantity,
            categorie_nom: product.categorie_nom,
            image_url: product.image_url
        });
    }

    closeDetailModal();
    updateCart();
    showNotification(`${product.nom} ajouté au panier`, 'success');
}

// Fermer la modal de détails
function closeDetailModal() {
    document.getElementById('productModal').style.display = 'none';
    currentDetailProduct = null;
}

// Passer la commande
// Charger les clients
async function loadClients() {
    try {
        const result = await apiRequest('/clients');
        
        if (result.success) {
            allClients = result.clients || [];
            console.log(`📋 Loaded ${allClients.length} clients from database`);
            console.log('Clients:', allClients);
            populateClientSelect();
        }
    } catch (error) {
        console.error('Erreur chargement clients:', error);
    }
}

// Remplir le sélecteur de clients
function populateClientSelect() {
    const select = document.getElementById('clientSelect');
    if (!select) return;
    
    select.innerHTML = '<option value="">Sélectionnez un client</option>';
    allClients.forEach(client => {
        const option = document.createElement('option');
        option.value = client.id;
        option.textContent = `${client.nom} ${client.prenom || ''} - ${client.email || client.telephone}`;
        select.appendChild(option);
    });
}

// Ouvrir modal de sélection client
function openClientModal() {
    if (cart.length === 0) {
        showError('Votre panier est vide');
        return;
    }
    
    // Si l'utilisateur est un client, le laisser passer directement
    if (user.role === 'Client') {
        console.log('Client user detected, proceeding to checkout');
        selectedClientId = null; // Will use user's client record in checkout
        checkout();
        return;
    }
    
    // Sinon, afficher le modal de sélection client
    const modal = document.getElementById('clientModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

// Fermer modal de sélection client
function closeClientModal() {
    const modal = document.getElementById('clientModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Procéder au checkout après sélection du client
async function proceedCheckout() {
    const clientSelect = document.getElementById('clientSelect');
    const clientId = clientSelect.value;
    
    if (!clientId) {
        showError('Veuillez sélectionner un client');
        return;
    }
    
    selectedClientId = clientId;
    closeClientModal();
    
    // Procéder à la création de la commande
    await checkout();
}

async function checkout() {
    if (cart.length === 0) {
        showError('Votre panier est vide');
        return;
    }

    // Créer la commande
    try {
        showLoading(true);
        
        // Charger les clients si nécessaire
        if (allClients.length === 0) {
            await loadClients();
        }
        
        // Si l'utilisateur est un client, trouver son ID dans la table Client
        let clientId = selectedClientId;
        
        if (!clientId && user.role === 'Client') {
            console.log('🔍 Looking for client for user:', user.email, user.nom);
            console.log('📋 Available clients:', allClients.length);
            
            // 1. Chercher le client par email (exact match)
            let clientToUse = allClients.find(c => 
                c.email && c.email.toLowerCase() === (user.email || '').toLowerCase()
            );
            
            if (clientToUse) {
                console.log('✓ Client matched by email:', clientToUse);
            } else {
                console.log('✗ No email match found');
            }
            
            // 2. Si pas trouvé par email, chercher par nom et prénom
            if (!clientToUse && user.nom) {
                clientToUse = allClients.find(c => 
                    c.nom && c.nom.toLowerCase() === user.nom.toLowerCase()
                );
                
                if (clientToUse) {
                    console.log('✓ Client matched by name:', clientToUse);
                } else {
                    console.log('✗ No name match found');
                }
            }
            
            // 3. Si toujours pas trouvé, prendre le premier client si disponible
            if (!clientToUse && allClients.length > 0) {
                console.warn('⚠ No exact match found, using first available client');
                clientToUse = allClients[0];
                console.log('Using first client:', clientToUse);
            }
            
            if (clientToUse) {
                clientId = clientToUse.id;
                console.log('✓ Final client ID:', clientId);
            } else {
                console.error('✗ No clients available in system!');
                showError('Aucun profil client trouvé. Veuillez contacter l\'administrateur.');
                showLoading(false);
                return;
            }
        }
        
        if (!clientId) {
            showError('Aucun client sélectionné');
            showLoading(false);
            return;
        }
        
        const commandeData = {
            client_id: clientId,
            articles: cart.map(item => ({
                produit_id: item.id,
                variante_id: item.variante_id || null,
                quantite: item.quantity,
                prix_unitaire: item.prix_vente
            }))
        };
        
        console.log('Checkout data:', commandeData);
        
        const result = await apiRequest('/commandes', 'POST', commandeData);

        if (result.success) {
            // Vider le panier
            cart = [];
            selectedClientId = null;
            updateCart();
            
            // Rediriger vers la page de paiement
            window.location.href = `./payment.html?orderId=${result.commandeId || result.id}`;
        } else {
            showError(result.message || 'Erreur lors de la création de la commande: ' + (result.message || result.error));
        }
    } catch (error) {
        console.error('Erreur checkout:', error);
        showError('Erreur lors du passage de commande: ' + error.message);
    } finally {
        showLoading(false);
    }
}

// Afficher une notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#667eea'};
        color: white;
        border-radius: 4px;
        z-index: 2000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Fonctions utilitaires
function showLoading(show) {
    const loading = document.getElementById('loadingIndicator');
    if (loading) {
        loading.style.display = show ? 'block' : 'none';
    }
}

function showError(message) {
    showNotification(message, 'error');
}

function formatPrice(price) {
    return new Intl.NumberFormat('fr-MA', {
        style: 'currency',
        currency: 'MAD'
    }).format(price || 0);
}

// Ajouter les animations CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Charger les données au démarrage
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    loadCategories();
    loadClients();
    updateCart();
});