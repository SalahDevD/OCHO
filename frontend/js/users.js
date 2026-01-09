// Vérifier l'authentification et les permissions
if (!isAuthenticated()) {
    window.location.href = '../index.html';
}

const user = getUser();
document.getElementById('userRole').textContent = user.role;

// Vérifier que l'utilisateur est admin
if (user.role !== 'Administrateur') {
    alert('Accès refusé. Seuls les administrateurs peuvent accéder à cette page.');
    window.location.href = 'dashboard.html';
}

let allUsers = [];

// Charger les utilisateurs
async function loadUsers() {
    try {
        const result = await apiRequest('/users');
        
        if (result.success) {
            allUsers = result.users;
            displayUsers(allUsers);
        }
    } catch (error) {
        console.error('Erreur chargement utilisateurs:', error);
        alert('Erreur lors du chargement des utilisateurs');
    }
}

// Afficher les utilisateurs
function displayUsers(users) {
    const tbody = document.getElementById('usersBody');
    
    if (!users || users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">Aucun utilisateur trouvé</td></tr>';
        return;
    }
    
    tbody.innerHTML = users.map(u => `
        <tr>
            <td><strong>${u.nom}</strong></td>
            <td>${u.email}</td>
            <td>${getRoleBadge(u.role_nom)}</td>
            <td>${getStatutBadge(u.actif)}</td>
            <td>${formatDate(u.created_at)}</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="editUser(${u.id})">✏️</button>
                <button class="btn ${u.actif ? 'btn-danger' : 'btn-success'} btn-sm" onclick="toggleUserStatus(${u.id}, ${u.actif})">
                    ${u.actif ? '🔒' : '🔓'}
                </button>
            </td>
        </tr>
    `).join('');
}

// Filtrer les utilisateurs
function filterUsers() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const roleFilter = document.getElementById('roleFilter').value;
    
    const filtered = allUsers.filter(u => {
        const matchSearch = u.nom.toLowerCase().includes(searchTerm) ||
                          u.email.toLowerCase().includes(searchTerm);
        const matchRole = !roleFilter || u.role_nom === roleFilter;
        
        return matchSearch && matchRole;
    });
    
    displayUsers(filtered);
}

// Ouvrir modal d'ajout
function openAddModal() {
    document.getElementById('modalTitle').textContent = 'Nouvel Utilisateur';
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
    document.getElementById('mot_de_passe').required = true;
    document.getElementById('userModal').style.display = 'block';
}

// Éditer utilisateur
async function editUser(id) {
    try {
        const result = await apiRequest(`/users/${id}`);
        
        if (result.success) {
            const u = result.user;
            
            document.getElementById('modalTitle').textContent = 'Modifier Utilisateur';
            document.getElementById('userId').value = u.id;
            document.getElementById('nom').value = u.nom;
            document.getElementById('email').value = u.email;
            document.getElementById('role_id').value = u.role_id;
            document.getElementById('mot_de_passe').required = false;
            document.getElementById('mot_de_passe').value = '';
            
            document.getElementById('passwordGroup').querySelector('small').textContent = 
                'Laissez vide pour ne pas changer le mot de passe';
            
            document.getElementById('userModal').style.display = 'block';
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors du chargement de l\'utilisateur');
    }
}

// Activer/Désactiver utilisateur
async function toggleUserStatus(id, currentStatus) {
    const action = currentStatus ? 'désactiver' : 'activer';
    
    if (!confirm(`Êtes-vous sûr de vouloir ${action} cet utilisateur ?`)) {
        return;
    }
    
    try {
        const result = await apiRequest(`/users/${id}/status`, 'PUT', { actif: !currentStatus });
        
        if (result.success) {
            alert(`Utilisateur ${action === 'désactiver' ? 'désactivé' : 'activé'} avec succès`);
            loadUsers();
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la modification du statut');
    }
}

// Soumettre le formulaire
document.getElementById('userForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const userId = document.getElementById('userId').value;
    const data = {
        nom: document.getElementById('nom').value,
        email: document.getElementById('email').value,
        role_id: parseInt(document.getElementById('role_id').value)
    };
    
    const password = document.getElementById('mot_de_passe').value;
    if (password) {
        data.mot_de_passe = password;
    }
    
    try {
        let result;
        if (userId) {
            result = await apiRequest(`/users/${userId}`, 'PUT', data);
        } else {
            result = await apiRequest('/users', 'POST', data);
        }
        
        if (result.success) {
            alert(userId ? 'Utilisateur modifié avec succès' : 'Utilisateur créé avec succès');
            closeModal();
            loadUsers();
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur: ' + error.message);
    }
});

// Fermer modal
function closeModal() {
    document.getElementById('userModal').style.display = 'none';
}

// Badge de rôle
function getRoleBadge(role) {
    const badges = {
        'Administrateur': 'badge-danger',
        'Magasinier': 'badge-warning',
        'Vendeur': 'badge-info'
    };
    
    const badgeClass = badges[role] || 'badge-info';
    return `<span class="badge ${badgeClass}">${role}</span>`;
}

// Badge de statut
function getStatutBadge(actif) {
    return actif 
        ? '<span class="badge badge-success">Actif</span>'
        : '<span class="badge badge-danger">Inactif</span>';
}

// Formater la date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Charger au démarrage
loadUsers();
