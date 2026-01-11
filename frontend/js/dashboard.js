// Vérifier l'authentification
if (!isAuthenticated()) {
    window.location.href = '../index.html';
}

// Afficher les infos utilisateur
const user = getUser();
document.getElementById('userName').textContent = user.nom;
document.getElementById('userRole').textContent = user.role;

// Load navigation based on role
loadNavigation(user.role);

// Charger les statistiques
async function loadDashboard() {
    try {
        const result = await apiRequest('/dashboard/stats');
        
        if (result.success) {
            const stats = result.stats;
            
            // Mettre à jour les cartes de stats
            document.getElementById('totalProduits').textContent = stats.total_produits;
            document.getElementById('totalClients').textContent = stats.total_clients;
            document.getElementById('stockTotal').textContent = stats.stock_total;
            document.getElementById('valeurStock').textContent = formatPrice(stats.valeur_stock);
            
            // Afficher les alertes si présentes
            if (stats.alertes_actives > 0) {
                await loadAlertes();
            }
            
            // Afficher les commandes récentes
            displayCommandesRecentes(stats.commandes_recentes);
        }
    } catch (error) {
        console.error('Erreur chargement dashboard:', error);
        alert('Erreur lors du chargement du dashboard');
    }
}

// Charger les alertes
async function loadAlertes() {
    try {
        const result = await apiRequest('/dashboard/alertes');
        
        if (result.success && result.alertes.length > 0) {
            const alertesSection = document.getElementById('alertesSection');
            const alertesList = document.getElementById('alertesList');
            
            alertesSection.style.display = 'block';
            alertesList.innerHTML = result.alertes.map(alerte => `
                <div class="alerte-item">
                    <strong>${alerte.produit_nom}</strong> (${alerte.reference}) - 
                    ${alerte.taille} / ${alerte.couleur} - 
                    Stock: ${alerte.quantite_actuelle} (Seuil: ${alerte.seuil_min})
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Erreur chargement alertes:', error);
    }
}

// Afficher les commandes récentes
function displayCommandesRecentes(commandes) {
    const tbody = document.getElementById('commandesBody');
    
    if (!commandes || commandes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">Aucune commande</td></tr>';
        return;
    }
    
    tbody.innerHTML = commandes.map(cmd => `
        <tr>
            <td>${cmd.reference}</td>
            <td>${cmd.client_nom}</td>
            <td>${formatDate(cmd.date_commande)}</td>
            <td>${getStatutBadge(cmd.statut)}</td>
            <td><strong>${formatPrice(cmd.total)}</strong></td>
        </tr>
    `).join('');
}

// Formater le prix
function formatPrice(price) {
    return new Intl.NumberFormat('fr-MA', {
        style: 'currency',
        currency: 'MAD'
    }).format(price);
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

// Charger au démarrage
loadDashboard();
