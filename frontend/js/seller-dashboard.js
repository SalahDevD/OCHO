// Vérifier l'authentification et le rôle
if (!isAuthenticated()) {
    window.location.href = '../index.html';
}

const user = getUser();
document.getElementById('sellerName').textContent = user.nom;
document.getElementById('userRole').textContent = user.role;

// Load navigation based on role
loadNavigation(user.role);

// Vérifier que l'utilisateur est vendeur
if (user.role !== 'Employé') {
    alert('Accès refusé. Seuls les vendeurs peuvent accéder à cette page.');
    window.location.href = 'dashboard.html';
}

let sellerProducts = [];
let sellerOrders = [];
let vendorStats = null;

// Format price helper
function formatPrice(price) {
    return new Intl.NumberFormat('fr-MA', {
        style: 'currency',
        currency: 'MAD'
    }).format(price || 0);
}

// Charger les statistiques du vendeur
async function loadSellerStats() {
    try {
        showLoading(true);
        
        // Récupérer les statistiques spécifiques au vendeur
        const statsResult = await apiRequest(`/dashboard/vendeur/${user.id}`);
        
        if (statsResult.success) {
            vendorStats = statsResult.stats;
            displaySellerStats();
        } else {
            // Fallback: calculer les stats manuellement
            await calculateManualStats();
        }
        
        // Charger les produits récents
        await loadRecentProducts();
        
        // Charger les commandes récentes
        await loadRecentOrders();
        
    } catch (error) {
        console.error('Erreur chargement stats:', error);
        await calculateManualStats();
    } finally {
        showLoading(false);
    }
}

// Afficher les statistiques du vendeur
function displaySellerStats() {
    if (!vendorStats) return;
    
    // Produits
    const totalProducts = vendorStats.total_produits || 0;
    document.getElementById('totalProducts').textContent = totalProducts;
    
    // Commandes
    const totalOrders = vendorStats.total_commandes || 0;
    document.getElementById('totalOrders').textContent = totalOrders;
    
    // Revenus
    const totalRevenue = vendorStats.revenu_total || 0;
    document.getElementById('totalRevenue').textContent = formatPrice(totalRevenue);
    
    // Taux de conversion (exemple)
    const conversionRate = vendorStats.taux_conversion || 'N/A';
    document.getElementById('conversionRate').textContent = conversionRate;
}

// Calculer les statistiques manuellement (fallback)
async function calculateManualStats() {
    try {
        // Récupérer les produits du vendeur
        const productsResult = await apiRequest('/products');
        if (productsResult.success) {
            sellerProducts = productsResult.products.filter(p => p.vendeur_id === user.id);
            document.getElementById('totalProducts').textContent = sellerProducts.length;
        }

        // Récupérer les commandes
        const ordersResult = await apiRequest('/commandes');
        if (ordersResult.success) {
            // Pour vendeur, filtrer les commandes qui contiennent ses produits
            const vendorOrders = [];
            let totalRevenue = 0;
            
            for (const order of ordersResult.commandes) {
                // Récupérer les détails de la commande
                try {
                    const orderDetails = await apiRequest(`/commandes/${order.id}`);
                    if (orderDetails.success && orderDetails.commande && orderDetails.commande.lignes) {
                        // Vérifier si cette commande contient des produits du vendeur
                        const hasVendorProducts = orderDetails.commande.lignes.some(ligne => 
                            sellerProducts.some(p => p.id === ligne.produit_id)
                        );
                        
                        if (hasVendorProducts) {
                            vendorOrders.push(order);
                            
                            // Calculer le revenu pour cette commande
                            const vendorLines = orderDetails.commande.lignes.filter(ligne => 
                                sellerProducts.some(p => p.id === ligne.produit_id)
                            );
                            
                            const vendorOrderTotal = vendorLines.reduce((sum, ligne) => 
                                sum + (ligne.prix_unitaire * ligne.quantite), 0
                            );
                            
                            totalRevenue += vendorOrderTotal;
                        }
                    }
                } catch (err) {
                    console.error('Erreur détails commande:', err);
                }
            }
            
            sellerOrders = vendorOrders;
            document.getElementById('totalOrders').textContent = vendorOrders.length;
            document.getElementById('totalRevenue').textContent = formatPrice(totalRevenue);
        }
    } catch (error) {
        console.error('Erreur calcul stats:', error);
    }
}

// Charger les produits récents
async function loadRecentProducts() {
    try {
        if (sellerProducts.length === 0) {
            const productsResult = await apiRequest('/products');
            if (productsResult.success) {
                sellerProducts = productsResult.products.filter(p => p.vendeur_id === user.id);
            }
        }
        
        displayRecentProducts(sellerProducts.slice(0, 5));
    } catch (error) {
        console.error('Erreur chargement produits récents:', error);
    }
}

// Afficher les produits récents
function displayRecentProducts(products) {
    const container = document.getElementById('recentProducts');
    
    if (!container) return;
    
    if (products.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 20px;">
                <div class="empty-icon">📭</div>
                <p>Aucun produit publié. <a href="seller-products.html">Ajouter votre premier produit</a></p>
            </div>
        `;
        return;
    }

    container.innerHTML = products.map(product => `
        <div class="product-item" style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; margin-bottom: 10px;">
            <div style="display: flex; align-items: center; gap: 15px;">
                <div style="width: 50px; height: 50px; background: #f5f5f5; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
                    ${product.image_url ? `<img src="${product.image_url}" alt="${product.nom}" style="max-width: 100%; max-height: 100%; object-fit: cover;">` : '📦'}
                </div>
                <div style="flex: 1;">
                    <div style="font-weight: bold; margin-bottom: 5px;">${product.nom}</div>
                    <div style="color: #666; font-size: 14px;">${product.reference}</div>
                    <div style="color: #667eea; font-weight: bold; margin-top: 5px;">${formatPrice(product.prix_vente)}</div>
                </div>
                <div>
                    <button class="btn-small btn-edit" onclick="editProduct(${product.id})" style="padding: 5px 10px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer;">✏️</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Charger les commandes récentes
async function loadRecentOrders() {
    try {
        if (sellerOrders.length === 0) {
            // Filtrer les commandes pour le vendeur
            await filterOrdersForVendor();
        }
        
        displayRecentOrders(sellerOrders.slice(0, 5));
    } catch (error) {
        console.error('Erreur chargement commandes récentes:', error);
    }
}

// Filtrer les commandes pour le vendeur
async function filterOrdersForVendor() {
    try {
        const ordersResult = await apiRequest('/commandes');
        if (!ordersResult.success) return;
        
        const filteredOrders = [];
        
        for (const order of ordersResult.commandes) {
            try {
                const orderDetails = await apiRequest(`/commandes/${order.id}`);
                if (orderDetails.success && orderDetails.commande && orderDetails.commande.lignes) {
                    const hasVendorProducts = orderDetails.commande.lignes.some(ligne => 
                        sellerProducts.some(p => p.id === ligne.produit_id)
                    );
                    
                    if (hasVendorProducts) {
                        filteredOrders.push(order);
                    }
                }
            } catch (err) {
                console.error('Erreur vérification commande:', err);
            }
        }
        
        sellerOrders = filteredOrders;
    } catch (error) {
        console.error('Erreur filtrage commandes:', error);
    }
}

// Afficher les commandes récentes
function displayRecentOrders(orders) {
    const tbody = document.getElementById('ordersBody');
    
    if (!tbody) return;
    
    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #999;">Aucune commande</td></tr>';
        return;
    }

    tbody.innerHTML = orders.map(order => `
        <tr>
            <td><strong>${order.reference || `CMD${order.id}`}</strong></td>
            <td>${order.client_nom || 'Client'}</td>
            <td>${formatPrice(order.total)}</td>
            <td>${formatDate(order.date_commande)}</td>
            <td>
                <span class="status-badge" style="
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    background: ${getStatusColor(order.statut)};
                    color: white;
                ">
                    ${order.statut || 'Créée'}
                </span>
            </td>
            <td>
                <button class="btn-small" style="padding: 4px 8px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer;" onclick="viewOrder(${order.id})">👁️</button>
            </td>
        </tr>
    `).join('');
}

// Obtenir la couleur du statut
function getStatusColor(status) {
    const colors = {
        'Créée': '#ff9800',
        'Validée': '#4caf50',
        'Expédiée': '#2196f3',
        'Livrée': '#9c27b0',
        'Annulée': '#f44336'
    };
    return colors[status] || '#999';
}

// Éditer un produit
function editProduct(productId) {
    window.location.href = `seller-products.html?edit=${productId}`;
}

// Supprimer un produit
async function deleteProduct(productId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit?')) {
        return;
    }

    try {
        const result = await apiRequest(`/products/${productId}`, 'DELETE');
        if (result.success) {
            alert('Produit supprimé avec succès');
            loadSellerStats();
        } else {
            alert('Erreur: ' + result.message);
        }
    } catch (error) {
        console.error('Erreur suppression:', error);
        alert('Erreur lors de la suppression');
    }
}

// Voir les détails d'une commande
function viewOrder(orderId) {
    window.location.href = `commandes.html?id=${orderId}`;
}

// Afficher/masquer le chargement
function showLoading(show) {
    const loadingElement = document.getElementById('loadingIndicator');
    if (loadingElement) {
        loadingElement.style.display = show ? 'block' : 'none';
    }
}

// Charger les données au démarrage
document.addEventListener('DOMContentLoaded', () => {
    loadSellerStats();
});