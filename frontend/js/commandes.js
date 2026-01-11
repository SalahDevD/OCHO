// Vérifier l'authentification
if (!isAuthenticated()) {
    window.location.href = '../index.html';
}

const user = getUser();
document.getElementById('userRole').textContent = user.role;

// Load navigation based on role
loadNavigation(user.role);

let allCommandes = [];
let userProducts = [];

// Charger les commandes
async function loadCommandes() {
    try {
        showLoading(true);
        
        // Charger les produits de l'utilisateur si c'est un vendeur
        if (user.role === 'Employé') {
            await loadUserProducts();
        }
        
        // Utiliser l'endpoint approprié selon le rôle
        let endpoint = '/commandes';
        if (user.role === 'Employé') {
            // Si la route vendeur n'existe pas, charger toutes les commandes et filtrer côté client
            try {
                // Essayer d'abord la route spécifique au vendeur
                const result = await apiRequest(`/commandes/vendeur/${user.id}`);
                if (result.success) {
                    allCommandes = result.commandes;
                }
            } catch (vendorError) {
                console.warn('Route vendeur non disponible, chargement de toutes les commandes:', vendorError.message);
                // Fallback: charger toutes les commandes
                const allResult = await apiRequest('/commandes');
                if (allResult.success) {
                    allCommandes = allResult.commandes;
                    // Filtrer côté client
                    allCommandes = await filterOrdersForVendor(allCommandes);
                }
            }
        } else {
            // Pour admin et autres rôles
            const result = await apiRequest(endpoint);
            if (result.success) {
                allCommandes = result.commandes;
            }
        }
        
        displayCommandes(allCommandes);
    } catch (error) {
        console.error('Erreur chargement commandes:', error);
        showError('Erreur lors du chargement des commandes: ' + error.message);
        
        // Afficher un état vide avec message d'erreur
        const tbody = document.getElementById('commandesBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 40px; color: #999;">
                        <div style="margin-bottom: 10px;">
                            <span style="font-size: 48px;">😕</span>
                        </div>
                        <p>Impossible de charger les commandes</p>
                        <p style="font-size: 12px; margin-top: 10px;">${error.message}</p>
                        <button onclick="loadCommandes()" style="margin-top: 20px; padding: 8px 16px; background: #2196f3; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            Réessayer
                        </button>
                    </td>
                </tr>
            `;
        }
    } finally {
        showLoading(false);
    }
}

// Charger les produits de l'utilisateur (pour les vendeurs)
async function loadUserProducts() {
    try {
        const result = await apiRequest('/products');
        if (result.success) {
            userProducts = result.products.filter(p => p.vendeur_id === user.id);
            console.log(`Produits du vendeur chargés: ${userProducts.length}`);
        }
    } catch (error) {
        console.error('Erreur chargement produits utilisateur:', error);
    }
}

// Filtrer les commandes pour un vendeur (côté client)
async function filterOrdersForVendor(commandes) {
    if (userProducts.length === 0) {
        console.log('Aucun produit trouvé pour ce vendeur');
        return [];
    }
    
    const filteredCommandes = [];
    const productIds = userProducts.map(p => p.id);
    
    for (const commande of commandes) {
        try {
            // Vérifier si cette commande contient des produits du vendeur
            const orderDetails = await apiRequest(`/commandes/${commande.id}`);
            
            if (orderDetails.success && orderDetails.commande && orderDetails.commande.lignes) {
                const hasVendorProduct = orderDetails.commande.lignes.some(ligne => 
                    productIds.includes(ligne.produit_id)
                );
                
                if (hasVendorProduct) {
                    // Ajouter des informations supplémentaires pour le vendeur
                    const vendorLines = orderDetails.commande.lignes.filter(ligne => 
                        productIds.includes(ligne.produit_id)
                    );
                    
                    const vendorTotal = vendorLines.reduce((sum, ligne) => 
                        sum + (ligne.prix_unitaire * ligne.quantite), 0
                    );
                    
                    // Créer une copie de la commande avec les infos du vendeur
                    const vendorCommande = {
                        ...commande,
                        vendor_total: vendorTotal,
                        vendor_items: vendorLines.length,
                        items_count: vendorLines.length  // Pour l'affichage
                    };
                    
                    filteredCommandes.push(vendorCommande);
                }
            }
        } catch (error) {
            console.error('Erreur vérification commande:', error);
        }
    }
    
    return filteredCommandes;
}

// Afficher les commandes
function displayCommandes(commandes) {
    const tbody = document.getElementById('commandesBody');
    
    if (!commandes || commandes.length === 0) {
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 40px; color: #999;">
                        <div style="margin-bottom: 10px;">
                            <span style="font-size: 48px;">📭</span>
                        </div>
                        <p>Aucune commande trouvée</p>
                        ${user.role === 'Employé' ? '<p style="font-size: 12px;">Vos produits n\'ont pas encore été commandés</p>' : ''}
                    </td>
                </tr>
            `;
        }
        return;
    }
    
    if (tbody) {
        tbody.innerHTML = commandes.map(cmd => {
            // Pour les vendeurs, utiliser le total spécifique au vendeur
            const displayTotal = user.role === 'Employé' && cmd.vendor_total ? cmd.vendor_total : cmd.total;
            const itemCount = user.role === 'Employé' && cmd.items_count ? cmd.items_count : cmd.nombre_articles || 0;
            
            return `
                <tr>
                    <td><strong>${cmd.reference || `CMD${cmd.id}`}</strong></td>
                    <td>${cmd.client_nom || cmd.client_prenom || 'Client'}</td>
                    <td>${formatDate(cmd.date_commande)}</td>
                    <td>${itemCount}</td>
                    <td><strong>${formatPrice(displayTotal)}</strong></td>
                    <td>${getStatutBadge(cmd.statut)}</td>
                    <td>
                        <div style="display: flex; gap: 5px;">
                            <button class="btn btn-info btn-sm" onclick="viewCommande(${cmd.id})" style="padding: 4px 8px; background: #2196f3; color: white; border: none; border-radius: 4px; cursor: pointer;">👁️</button>
                            ${cmd.statut === 'Créée' && canValidate() ? `
                                <button class="btn btn-success btn-sm" onclick="validerCommande(${cmd.id})" style="padding: 4px 8px; background: #4caf50; color: white; border: none; border-radius: 4px; cursor: pointer;">✓</button>
                            ` : ''}
                            ${canChangeStatus(cmd.statut) ? `
                                <select onchange="updateCommandeStatus(${cmd.id}, this.value)" style="padding: 4px 8px; border: 1px solid #ddd; border-radius: 4px;">
                                    <option value="">Changer statut</option>
                                    <option value="Validée" ${cmd.statut === 'Validée' ? 'selected' : ''}>Validée</option>
                                    <option value="En cours" ${cmd.statut === 'En cours' ? 'selected' : ''}>En cours</option>
                                    <option value="Livrée" ${cmd.statut === 'Livrée' ? 'selected' : ''}>Livrée</option>
                                    <option value="Annulée" ${cmd.statut === 'Annulée' ? 'selected' : ''}>Annulée</option>
                                </select>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }
}

// Filtrer les commandes
function filterCommandes() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statutFilter = document.getElementById('statutFilter').value;
    
    const filtered = allCommandes.filter(cmd => {
        const matchSearch = 
            (cmd.reference && cmd.reference.toLowerCase().includes(searchTerm)) ||
            (cmd.client_nom && cmd.client_nom.toLowerCase().includes(searchTerm)) ||
            (cmd.client_prenom && cmd.client_prenom.toLowerCase().includes(searchTerm));
        const matchStatut = !statutFilter || cmd.statut === statutFilter;
        
        return matchSearch && matchStatut;
    });
    
    displayCommandes(filtered);
}

// Voir détails commande
async function viewCommande(id) {
    try {
        showLoading(true);
        
        const result = await apiRequest(`/commandes/${id}`);
        
        if (result.success) {
            const cmd = result.commande;
            
            // Pour les vendeurs, filtrer les lignes pour ne montrer que leurs produits
            let displayLignes = cmd.lignes || cmd.articles || [];
            if (user.role === 'Employé' && userProducts.length > 0) {
                const productIds = userProducts.map(p => p.id);
                displayLignes = displayLignes.filter(ligne => 
                    productIds.includes(ligne.produit_id)
                );
            }
            
            const detailsHtml = `
                <div style="padding: 25px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                        <div>
                            <h4>Informations Commande</h4>
                            <p><strong>Référence:</strong> ${cmd.reference || 'N/A'}</p>
                            <p><strong>Date:</strong> ${formatDate(cmd.date_commande)}</p>
                            <p><strong>Statut:</strong> ${getStatutBadge(cmd.statut)}</p>
                            <p><strong>Total commande:</strong> <strong>${formatPrice(cmd.total)}</strong></p>
                            ${user.role === 'Employé' ? `<p><strong>Votre part:</strong> <strong>${formatPrice(cmd.vendor_total || 0)}</strong></p>` : ''}
                        </div>
                        <div>
                            <h4>Client</h4>
                            <p><strong>Nom:</strong> ${cmd.client_nom || cmd.client_prenom || 'N/A'}</p>
                            <p><strong>Email:</strong> ${cmd.client_email || cmd.email || '-'}</p>
                            <p><strong>Téléphone:</strong> ${cmd.client_telephone || cmd.telephone || '-'}</p>
                        </div>
                    </div>
                    
                    <h4>Articles ${user.role === 'Employé' ? '(Vos produits)' : ''}</h4>
                    ${displayLignes.length > 0 ? `
                        <div style="overflow-x: auto;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <thead>
                                    <tr style="background: #f5f5f5;">
                                        <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Produit</th>
                                        <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Référence</th>
                                        <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Taille</th>
                                        <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Couleur</th>
                                        <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Quantité</th>
                                        <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Prix Unit.</th>
                                        <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Sous-total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${displayLignes.map(ligne => `
                                        <tr>
                                            <td style="padding: 10px; border-bottom: 1px solid #eee;">${ligne.produit_nom || 'Produit'}</td>
                                            <td style="padding: 10px; border-bottom: 1px solid #eee;">${ligne.produit_reference || ligne.reference || 'N/A'}</td>
                                            <td style="padding: 10px; border-bottom: 1px solid #eee;">${ligne.taille || '-'}</td>
                                            <td style="padding: 10px; border-bottom: 1px solid #eee;">${ligne.couleur || '-'}</td>
                                            <td style="padding: 10px; border-bottom: 1px solid #eee;">${ligne.quantite || 0}</td>
                                            <td style="padding: 10px; border-bottom: 1px solid #eee;">${formatPrice(ligne.prix_unitaire)}</td>
                                            <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>${formatPrice(ligne.sous_total || (ligne.prix_unitaire * ligne.quantite))}</strong></td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colspan="6" style="padding: 10px; text-align: right; font-weight: bold;">
                                            ${user.role === 'Employé' ? 'Total (votre part):' : 'Total:'}
                                        </td>
                                        <td style="padding: 10px; font-weight: bold;">
                                            ${formatPrice(user.role === 'Employé' ? (cmd.vendor_total || 0) : cmd.total)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    ` : '<p style="text-align: center; padding: 20px; color: #999;">Aucun article dans cette commande</p>'}
                    
                    ${cmd.notes ? `
                        <div style="margin-top: 20px; padding: 15px; background: #f9f9f9; border-radius: 4px;">
                            <h5>Notes:</h5>
                            <p>${cmd.notes}</p>
                        </div>
                    ` : ''}
                </div>
            `;
            
            document.getElementById('commandeDetails').innerHTML = detailsHtml;
            document.getElementById('detailsModal').style.display = 'block';
        }
    } catch (error) {
        console.error('Erreur:', error);
        showError('Erreur lors du chargement des détails: ' + error.message);
    } finally {
        showLoading(false);
    }
}

// Valider commande
async function validerCommande(id) {
    if (!confirm('Êtes-vous sûr de vouloir valider cette commande ?')) {
        return;
    }
    
    try {
        showLoading(true);
        
        const result = await apiRequest(`/commandes/${id}/valider`, 'PUT');
        
        if (result.success) {
            showSuccess('Commande validée avec succès');
            loadCommandes();
        } else {
            showError(result.message || 'Erreur lors de la validation');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showError('Erreur: ' + error.message);
    } finally {
        showLoading(false);
    }
}

// Mettre à jour le statut d'une commande
async function updateCommandeStatus(id, statut) {
    if (!statut || !confirm(`Changer le statut de la commande à "${statut}" ?`)) {
        return;
    }
    
    try {
        showLoading(true);
        
        const result = await apiRequest(`/commandes/${id}/statut`, 'PUT', { statut });
        
        if (result.success) {
            showSuccess(`Statut changé à "${statut}" avec succès`);
            loadCommandes();
        } else {
            showError(result.message || 'Erreur lors du changement de statut');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showError('Erreur: ' + error.message);
    } finally {
        showLoading(false);
    }
}

// Fermer modal
function closeDetailsModal() {
    document.getElementById('detailsModal').style.display = 'none';
}

// Permissions
function canValidate() {
    return ['Administrateur', 'Magasinier'].includes(user.role);
}

function canChangeStatus(currentStatus) {
    return ['Administrateur', 'Magasinier'].includes(user.role) && 
           currentStatus !== 'Annulée' && currentStatus !== 'Livrée';
}

// Badge de statut
function getStatutBadge(statut) {
    const badges = {
        'Créée': { class: 'badge-info', color: '#ff9800' },
        'Validée': { class: 'badge-success', color: '#4caf50' },
        'En cours': { class: 'badge-warning', color: '#2196f3' },
        'Livrée': { class: 'badge-success', color: '#9c27b0' },
        'Annulée': { class: 'badge-danger', color: '#f44336' }
    };
    
    const badge = badges[statut] || { class: 'badge-info', color: '#999' };
    
    return `
        <span style="
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            background: ${badge.color};
            color: white;
        ">
            ${statut || 'Créée'}
        </span>
    `;
}

// Formater le prix
function formatPrice(price) {
    return new Intl.NumberFormat('fr-MA', {
        style: 'currency',
        currency: 'MAD'
    }).format(price || 0);
}

// Formater la date
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Fonctions utilitaires pour les messages
function showLoading(show) {
    const loading = document.getElementById('loadingIndicator');
    if (loading) {
        loading.style.display = show ? 'block' : 'none';
    }
}

function showSuccess(message) {
    alert(message); // À remplacer par un système de notification
}

function showError(message) {
    alert('Erreur: ' + message); // À remplacer par un système de notification
}

// Charger au démarrage
document.addEventListener('DOMContentLoaded', () => {
    loadCommandes();
});