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

let allCommandes = [];

// Charger les commandes
async function loadCommandes() {
    try {
        const result = await apiRequest('/commandes');
        
        if (result.success) {
            allCommandes = result.commandes;
            displayCommandes(allCommandes);
        }
    } catch (error) {
        console.error('Erreur chargement commandes:', error);
        alert('Erreur lors du chargement des commandes');
    }
}

// Afficher les commandes
function displayCommandes(commandes) {
    const tbody = document.getElementById('commandesBody');
    
    if (!commandes || commandes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">Aucune commande trouvée</td></tr>';
        return;
    }
    
    tbody.innerHTML = commandes.map(cmd => `
        <tr>
            <td><strong>${cmd.reference}</strong></td>
            <td>${cmd.client_nom}</td>
            <td>${formatDate(cmd.date_commande)}</td>
            <td>${cmd.nombre_articles || 0}</td>
            <td><strong>${formatPrice(cmd.total)}</strong></td>
            <td>${getStatutBadge(cmd.statut)}</td>
            <td>
                <button class="btn btn-info btn-sm" onclick="viewCommande(${cmd.id})">👁️</button>
                ${cmd.statut === 'Créée' && canValidate() ? `<button class="btn btn-success btn-sm" onclick="validerCommande(${cmd.id})">✓</button>` : ''}
            </td>
        </tr>
    `).join('');
}

// Filtrer les commandes
function filterCommandes() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statutFilter = document.getElementById('statutFilter').value;
    
    const filtered = allCommandes.filter(cmd => {
        const matchSearch = cmd.reference.toLowerCase().includes(searchTerm) ||
                          cmd.client_nom.toLowerCase().includes(searchTerm);
        const matchStatut = !statutFilter || cmd.statut === statutFilter;
        
        return matchSearch && matchStatut;
    });
    
    displayCommandes(filtered);
}

// Voir détails commande
async function viewCommande(id) {
    try {
        const result = await apiRequest(`/commandes/${id}`);
        
        if (result.success) {
            const cmd = result.commande;
            
            // Vérifier si les lignes existent
            const lignes = cmd.lignes || [];
            
            const detailsHtml = `
                <div style="padding: 25px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                        <div>
                            <h4>Informations Commande</h4>
                            <p><strong>Référence:</strong> ${cmd.reference}</p>
                            <p><strong>Date:</strong> ${formatDate(cmd.date_commande)}</p>
                            <p><strong>Statut:</strong> ${getStatutBadge(cmd.statut)}</p>
                            <p><strong>Total:</strong> <strong>${formatPrice(cmd.total)}</strong></p>
                        </div>
                        <div>
                            <h4>Client</h4>
                            <p><strong>Nom:</strong> ${cmd.client_nom}</p>
                            <p><strong>Email:</strong> ${cmd.email || '-'}</p>
                            <p><strong>Téléphone:</strong> ${cmd.telephone || '-'}</p>
                            <p><strong>Adresse:</strong> ${cmd.adresse || '-'}</p>
                        </div>
                    </div>
                    
                    <h4>Articles</h4>
                    ${lignes.length > 0 ? `
                        <table style="width: 100%;">
                            <thead>
                                <tr>
                                    <th>Produit</th>
                                    <th>Taille</th>
                                    <th>Couleur</th>
                                    <th>Quantité</th>
                                    <th>Prix Unit.</th>
                                    <th>Sous-total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${lignes.map(ligne => `
                                    <tr>
                                        <td>${ligne.produit_nom} (${ligne.reference})</td>
                                        <td>${ligne.taille}</td>
                                        <td>${ligne.couleur}</td>
                                        <td>${ligne.quantite}</td>
                                        <td>${formatPrice(ligne.prix_unitaire)}</td>
                                        <td><strong>${formatPrice(ligne.sous_total)}</strong></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    ` : '<p>Aucun article dans cette commande</p>'}
                </div>
            `;
            
            document.getElementById('commandeDetails').innerHTML = detailsHtml;
            document.getElementById('detailsModal').style.display = 'block';
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors du chargement des détails: ' + error.message);
    }
}

// Valider commande
async function validerCommande(id) {
    if (!confirm('Êtes-vous sûr de vouloir valider cette commande ? Le stock sera décrémenté.')) {
        return;
    }
    
    try {
        const result = await apiRequest(`/commandes/${id}/valider`, 'PUT');
        
        if (result.success) {
            alert('Commande validée avec succès');
            loadCommandes();
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur: ' + error.message);
    }
}

// Ouvrir modal ajout (simplifié)
function openAddModal() {
    alert('Fonctionnalité de création de commande à implémenter avec sélection de produits');
}

// Fermer modal
function closeDetailsModal() {
    document.getElementById('detailsModal').style.display = 'none';
}

// Permissions
function canValidate() {
    return ['Administrateur', 'Magasinier'].includes(user.role);
}

// Badge de statut
function getStatutBadge(statut) {
    const badges = {
        'Créée': 'badge-info',
        'Validée': 'badge-success',
        'En cours': 'badge-warning',
        'Livrée': 'badge-success',
        'Annulée': 'badge-danger'
    };
    
    const badgeClass = badges[statut] || 'badge-info';
    return `<span class="badge ${badgeClass}">${statut}</span>`;
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
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Charger au démarrage
loadCommandes();
