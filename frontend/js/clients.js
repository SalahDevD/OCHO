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

let allClients = [];

// Charger les clients
async function loadClients() {
    try {
        const result = await apiRequest('/clients');
        
        if (result.success) {
            allClients = result.clients;
            displayClients(allClients);
        }
    } catch (error) {
        console.error('Erreur chargement clients:', error);
        alert('Erreur lors du chargement des clients');
    }
}

// Afficher les clients
function displayClients(clients) {
    const tbody = document.getElementById('clientsBody');
    
    if (!clients || clients.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8">Aucun client trouvé</td></tr>';
        return;
    }
    
    tbody.innerHTML = clients.map(client => `
        <tr>
            <td><strong>${client.nom}</strong></td>
            <td>${client.prenom || '-'}</td>
            <td>${client.email || '-'}</td>
            <td>${client.telephone || '-'}</td>
            <td>${client.ville || '-'}</td>
            <td>${client.nombre_commandes || 0}</td>
            <td><strong>${formatPrice(client.total_achats || 0)}</strong></td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="editClient(${client.id})">✏️</button>
                ${canDelete() ? `<button class="btn btn-danger btn-sm" onclick="deleteClient(${client.id})">🗑️</button>` : ''}
            </td>
        </tr>
    `).join('');
}

// Filtrer les clients
function filterClients() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    const filtered = allClients.filter(client => {
        return client.nom.toLowerCase().includes(searchTerm) ||
               (client.prenom && client.prenom.toLowerCase().includes(searchTerm)) ||
               (client.email && client.email.toLowerCase().includes(searchTerm)) ||
               (client.telephone && client.telephone.includes(searchTerm));
    });
    
    displayClients(filtered);
}

// Ouvrir modal d'ajout
function openAddModal() {
    document.getElementById('modalTitle').textContent = 'Nouveau Client';
    document.getElementById('clientForm').reset();
    document.getElementById('clientId').value = '';
    document.getElementById('clientModal').style.display = 'block';
}

// Éditer client
async function editClient(id) {
    try {
        const result = await apiRequest(`/clients/${id}`);
        
        if (result.success) {
            const client = result.client;
            
            document.getElementById('modalTitle').textContent = 'Modifier Client';
            document.getElementById('clientId').value = client.id;
            document.getElementById('nom').value = client.nom;
            document.getElementById('prenom').value = client.prenom || '';
            document.getElementById('email').value = client.email || '';
            document.getElementById('telephone').value = client.telephone || '';
            document.getElementById('ville').value = client.ville || '';
            document.getElementById('code_postal').value = client.code_postal || '';
            document.getElementById('adresse').value = client.adresse || '';
            
            document.getElementById('clientModal').style.display = 'block';
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors du chargement du client');
    }
}

// Supprimer client
async function deleteClient(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
        return;
    }
    
    try {
        const result = await apiRequest(`/clients/${id}`, 'DELETE');
        
        if (result.success) {
            alert('Client supprimé avec succès');
            loadClients();
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la suppression');
    }
}

// Soumettre le formulaire
document.getElementById('clientForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const clientId = document.getElementById('clientId').value;
    const data = {
        nom: document.getElementById('nom').value,
        prenom: document.getElementById('prenom').value,
        email: document.getElementById('email').value,
        telephone: document.getElementById('telephone').value,
        ville: document.getElementById('ville').value,
        code_postal: document.getElementById('code_postal').value,
        adresse: document.getElementById('adresse').value
    };
    
    try {
        let result;
        if (clientId) {
            result = await apiRequest(`/clients/${clientId}`, 'PUT', data);
        } else {
            result = await apiRequest('/clients', 'POST', data);
        }
        
        if (result.success) {
            alert(clientId ? 'Client modifié avec succès' : 'Client créé avec succès');
            closeModal();
            loadClients();
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur: ' + error.message);
    }
});

// Fermer modal
function closeModal() {
    document.getElementById('clientModal').style.display = 'none';
}

// Permissions
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
loadClients();
