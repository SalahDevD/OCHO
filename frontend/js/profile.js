// Vérifier l'authentification
if (!isAuthenticated()) {
    window.location.href = '../index.html';
}

const user = getUser();
document.getElementById('userRole').textContent = user.role;
document.getElementById('userName').textContent = user.nom;

// Charger la navigation selon le rôle
loadNavigation(user.role);

// Variables globales
let profileData = null;
let isEditMode = false;
let avatarFile = null;

// Charger les données du profil
async function loadProfileData() {
    try {
        // Récupérer les données utilisateur depuis l'API
        const result = await apiRequest(`/users/${user.id}`);
        
        if (result.success) {
            profileData = result.user;
            displayProfileData();
            updateProfileManagementButtons();
        }
    } catch (error) {
        console.error('Erreur chargement profil:', error);
        showError('Erreur lors du chargement du profil');
    }
}

// Afficher les données du profil
function displayProfileData() {
    if (!profileData) return;

    // Afficher les informations principales
    document.getElementById('profileName').textContent = profileData.nom;
    document.getElementById('profileRole').textContent = profileData.role_nom;
    document.getElementById('profileEmail').textContent = profileData.email;
    
    // Afficher l'avatar
    displayAvatar(profileData.avatar);
    
    // Remplir le formulaire
    document.getElementById('fullName').value = profileData.nom;
    document.getElementById('email').value = profileData.email;
    document.getElementById('role').value = profileData.role_nom;
    document.getElementById('joinDate').value = new Date(profileData.created_at).toLocaleDateString('fr-FR');
    document.getElementById('bio').value = profileData.bio || '';
    
    // Charger les statistiques selon le rôle
    loadUserStatistics();
    
    // Afficher les informations du compte
    displayAccountInfo();
}

// Afficher l'avatar
function displayAvatar(avatarData) {
    const avatarElement = document.getElementById('profileAvatar');
    
    if (avatarData) {
        // Si l'avatar est stocké en base64
        avatarElement.innerHTML = `<img src="${avatarData}" alt="Avatar">`;
    } else {
        // Sinon, afficher l'emoji par défaut
        avatarElement.textContent = '👤';
        avatarElement.style.fontSize = '48px';
    }
}

// Gérer les boutons de gestion du profil
function updateProfileManagementButtons() {
    const noProfileButtons = document.getElementById('noProfileButtons');
    const existingProfileButtons = document.getElementById('existingProfileButtons');
    
    if (!profileData || (!profileData.nom && !profileData.email)) {
        // Aucun profil existant
        noProfileButtons.style.display = 'flex';
        existingProfileButtons.style.display = 'none';
    } else {
        // Profil existant
        noProfileButtons.style.display = 'none';
        existingProfileButtons.style.display = 'flex';
    }
}

// Initialiser un nouveau profil
function initNewProfile() {
    isEditMode = true;
    toggleEditMode();
}

// Basculer en mode édition
function toggleEditMode() {
    isEditMode = !isEditMode;
    
    const fullNameInput = document.getElementById('fullName');
    const editProfileBtn = document.getElementById('editProfileBtn');
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    const cancelProfileBtn = document.getElementById('cancelProfileBtn');
    const uploadAvatarBtn = document.getElementById('uploadAvatarBtn');
    
    if (isEditMode) {
        // Activer l'édition
        fullNameInput.disabled = false;
        fullNameInput.focus();
        
        editProfileBtn.style.display = 'none';
        saveProfileBtn.style.display = 'block';
        cancelProfileBtn.style.display = 'block';
        if (uploadAvatarBtn) uploadAvatarBtn.style.display = 'block';
    } else {
        // Désactiver l'édition
        fullNameInput.disabled = true;
        
        editProfileBtn.style.display = 'block';
        saveProfileBtn.style.display = 'none';
        cancelProfileBtn.style.display = 'none';
        if (uploadAvatarBtn) uploadAvatarBtn.style.display = 'none';
    }
}

// Sauvegarder les modifications du profil
async function saveProfileChanges() {
    try {
        const fullName = document.getElementById('fullName').value;
        
        if (!fullName.trim()) {
            showError('Le nom complet est requis');
            return;
        }
        
        // Mettre à jour le nom
        const updateData = {
            nom: fullName.trim()
        };
        
        let result = await apiRequest(`/users/${user.id}`, 'PUT', updateData);
        
        if (!result.success) {
            showError(result.message || 'Erreur lors de la mise à jour');
            return;
        }
        
        // Si une image a été sélectionnée, l'uploader en base64
        if (avatarFile) {
            const reader = new FileReader();
            reader.onload = async function(e) {
                const base64Avatar = e.target.result;
                
                try {
                    const uploadResult = await apiRequest(`/users/${user.id}/avatar`, 'PUT', {
                        avatar: base64Avatar
                    });
                    
                    if (uploadResult.success) {
                        avatarFile = null;
                        console.log('✅ Avatar uploadé avec succès');
                        
                        // Mettre à jour les données du profil avec le nouvel avatar
                        if (profileData) {
                            profileData.avatar = base64Avatar;
                        }
                    } else {
                        console.warn('⚠️ Erreur upload avatar:', uploadResult.message);
                    }
                } catch (uploadError) {
                    console.error('Erreur lors de l\'upload de l\'avatar:', uploadError);
                }
            };
            reader.readAsDataURL(avatarFile);
        }
        
        if (result.success) {
            // Mettre à jour les données locales
            profileData.nom = fullName.trim();
            
            // Mettre à jour le localStorage
            const currentUser = getUser();
            currentUser.nom = fullName.trim();
            setUser(currentUser);
            
            // Mettre à jour l'affichage
            displayProfileData();
            toggleEditMode();
            
            showSuccess('Profil mis à jour avec succès');
        } else {
            showError(result.message || 'Erreur lors de la mise à jour');
        }
    } catch (error) {
        console.error('Erreur sauvegarde profil:', error);
        showError('Erreur lors de la sauvegarde');
    }
}

// Annuler l'édition du profil
function cancelProfileEdit() {
    // Restaurer les valeurs originales
    if (profileData) {
        document.getElementById('fullName').value = profileData.nom;
    }
    
    toggleEditMode();
    showInfo('Modifications annulées');
}

// Gestion de l'avatar
function handleAvatarUpload(event) {
    const file = event.target.files[0];
    
    if (!file) return;
    
    // Vérifier la taille du fichier (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        showError('L\'image est trop volumineuse (max 2MB)');
        return;
    }
    
    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
        showError('Veuillez sélectionner une image');
        return;
    }
    
    avatarFile = file;
    previewAvatar(file);
}

// Prévisualiser l'avatar
function previewAvatar(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const avatarElement = document.getElementById('profileAvatar');
        avatarElement.innerHTML = `<img src="${e.target.result}" alt="Avatar preview">`;
        avatarElement.style.fontSize = '0';
    };
    
    reader.readAsDataURL(file);
}

// Télécharger l'avatar sur le serveur
async function uploadAvatarToServer() {
    if (!avatarFile) {
        showError('Veuillez d\'abord sélectionner une image');
        return;
    }
    
    try {
        const reader = new FileReader();
        
        reader.onload = async function(e) {
            const base64Image = e.target.result;
            
            const result = await apiRequest(`/users/${user.id}/avatar`, 'PUT', {
                avatar: base64Image
            });
            
            if (result.success) {
                // Mettre à jour localement
                profileData.avatar = base64Image;
                
                // Réinitialiser
                avatarFile = null;
                document.getElementById('avatarInput').value = '';
                
                showSuccess('Avatar mis à jour avec succès');
            } else {
                showError(result.message || 'Erreur lors du téléchargement');
            }
        };
        
        reader.readAsDataURL(avatarFile);
    } catch (error) {
        console.error('Erreur upload avatar:', error);
        showError('Erreur lors du téléchargement');
    }
}

// Supprimer l'avatar
async function deleteAvatar() {
    if (!confirm('Êtes-vous sûr de vouloir supprimer votre avatar ?')) {
        return;
    }
    
    try {
        const result = await apiRequest(`/users/${user.id}/avatar`, 'PUT', {
            avatar: null
        });
        
        if (result.success) {
            profileData.avatar = null;
            displayAvatar(null);
            showSuccess('Avatar supprimé avec succès');
        } else {
            showError(result.message || 'Erreur lors de la suppression');
        }
    } catch (error) {
        console.error('Erreur suppression avatar:', error);
        showError('Erreur lors de la suppression');
    }
}

// Gestion de la biographie
function editBio() {
    const bioTextarea = document.getElementById('bio');
    const editBioBtn = document.getElementById('editBioBtn');
    const saveBioBtn = document.getElementById('saveBioBtn');
    const cancelBioBtn = document.getElementById('cancelBioBtn');
    
    bioTextarea.disabled = false;
    bioTextarea.focus();
    
    editBioBtn.style.display = 'none';
    saveBioBtn.style.display = 'block';
    cancelBioBtn.style.display = 'block';
}

async function saveBio() {
    try {
        const bio = document.getElementById('bio').value;
        
        const result = await apiRequest(`/users/${user.id}`, 'PUT', {
            bio: bio
        });
        
        if (result.success) {
            profileData.bio = bio;
            cancelBioEdit();
            showSuccess('Biographie mise à jour avec succès');
        } else {
            showError(result.message || 'Erreur lors de la sauvegarde');
        }
    } catch (error) {
        console.error('Erreur sauvegarde bio:', error);
        showError('Erreur lors de la sauvegarde');
    }
}

function cancelBioEdit() {
    const bioTextarea = document.getElementById('bio');
    const editBioBtn = document.getElementById('editBioBtn');
    const saveBioBtn = document.getElementById('saveBioBtn');
    const cancelBioBtn = document.getElementById('cancelBioBtn');
    
    // Restaurer la valeur originale
    bioTextarea.value = profileData.bio || '';
    bioTextarea.disabled = true;
    
    editBioBtn.style.display = 'block';
    saveBioBtn.style.display = 'none';
    cancelBioBtn.style.display = 'none';
}

// Gestion du mot de passe
function showChangePasswordForm() {
    document.getElementById('changePasswordForm').style.display = 'block';
}

function hideChangePasswordForm() {
    document.getElementById('changePasswordForm').style.display = 'none';
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
}

async function updatePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
        showError('Tous les champs sont requis');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showError('Les nouveaux mots de passe ne correspondent pas');
        return;
    }
    
    if (newPassword.length < 6) {
        showError('Le mot de passe doit contenir au moins 6 caractères');
        return;
    }
    
    try {
        const result = await apiRequest(`/users/${user.id}/password`, 'PUT', {
            currentPassword,
            newPassword
        });
        
        if (result.success) {
            hideChangePasswordForm();
            showSuccess('Mot de passe mis à jour avec succès');
        } else {
            showError(result.message || 'Erreur lors de la mise à jour');
        }
    } catch (error) {
        console.error('Erreur changement mot de passe:', error);
        showError('Erreur lors de la mise à jour du mot de passe');
    }
}

// Charger les statistiques utilisateur
async function loadUserStatistics() {
    const statsSection = document.getElementById('statsSection');
    const statsGrid = document.getElementById('statsGrid');
    
    if (!statsSection || !statsGrid) return;
    
    statsSection.style.display = 'block';
    
    try {
        if (user.role === 'Client') {
            // Statistiques pour client
            const ordersResult = await apiRequest('/commandes');
            const orderCount = ordersResult.success ? ordersResult.commandes.length : 0;
            
            statsGrid.innerHTML = `
                <div class="stat-item">
                    <div class="stat-icon">🛒</div>
                    <div class="stat-value">${orderCount}</div>
                    <div class="stat-label">Commandes</div>
                </div>
                <div class="stat-item">
                    <div class="stat-icon">📅</div>
                    <div class="stat-value">${new Date(profileData.created_at).getFullYear()}</div>
                    <div class="stat-label">Membre depuis</div>
                </div>
            `;
            
        } else if (user.role === 'Employé') {
            // Statistiques pour vendeur
            const productsResult = await apiRequest('/products');
            const ordersResult = await apiRequest('/commandes');
            
            let productCount = 0;
            let orderCount = 0;
            let totalRevenue = 0;
            
            if (productsResult.success) {
                productCount = productsResult.products.filter(p => p.vendeur_id === user.id).length;
            }
            
            if (ordersResult.success) {
                // Calculer les commandes et revenus du vendeur
                ordersResult.commandes.forEach(order => {
                    // Logique simplifiée - à adapter selon votre structure
                    if (order.vendeur_id === user.id) {
                        orderCount++;
                        totalRevenue += order.total || 0;
                    }
                });
            }
            
            statsGrid.innerHTML = `
                <div class="stat-item">
                    <div class="stat-icon">📦</div>
                    <div class="stat-value">${productCount}</div>
                    <div class="stat-label">Produits</div>
                </div>
                <div class="stat-item">
                    <div class="stat-icon">🛒</div>
                    <div class="stat-value">${orderCount}</div>
                    <div class="stat-label">Commandes</div>
                </div>
                <div class="stat-item">
                    <div class="stat-icon">💰</div>
                    <div class="stat-value">${formatPrice(totalRevenue)}</div>
                    <div class="stat-label">Revenus</div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Erreur chargement statistiques:', error);
        statsGrid.innerHTML = '<div class="stat-item">Erreur chargement statistiques</div>';
    }
}

// Afficher les informations du compte
function displayAccountInfo() {
    const accountInfo = document.getElementById('accountInfo');
    
    if (!accountInfo) return;
    
    const lastLogin = profileData.derniere_connexion 
        ? new Date(profileData.derniere_connexion).toLocaleString('fr-FR')
        : 'Jamais';
    
    accountInfo.innerHTML = `
        <div class="info-row">
            <span class="info-label">Dernière connexion:</span>
            <span class="info-value">${lastLogin}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Statut:</span>
            <span class="info-value">
                <span style="color: ${profileData.actif ? '#4caf50' : '#f44336'}; font-weight: bold;">
                    ${profileData.actif ? 'Actif' : 'Inactif'}
                </span>
            </span>
        </div>
    `;
}

// Fonctions utilitaires pour les messages
function showSuccess(message) {
    const alert = document.getElementById('successAlert');
    alert.textContent = message;
    alert.style.display = 'block';
    
    setTimeout(() => {
        alert.style.display = 'none';
    }, 3000);
}

function showError(message) {
    const alert = document.getElementById('errorAlert');
    alert.textContent = message;
    alert.style.display = 'block';
    
    setTimeout(() => {
        alert.style.display = 'none';
    }, 5000);
}

function showInfo(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-info';
    alert.textContent = message;
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 10px 15px;
        background: #2196f3;
        color: white;
        border-radius: 4px;
        z-index: 1000;
    `;
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 3000);
}

// Formater le prix
function formatPrice(price) {
    return new Intl.NumberFormat('fr-MA', {
        style: 'currency',
        currency: 'MAD'
    }).format(price || 0);
}

// Écouteurs d'événements pour l'avatar
document.addEventListener('DOMContentLoaded', () => {
    const avatarInput = document.getElementById('avatarInput');
    const profileAvatar = document.getElementById('profileAvatar');
    
    if (avatarInput) {
        avatarInput.addEventListener('change', handleAvatarUpload);
    }
    
    if (profileAvatar) {
        // Créer les boutons d'action pour l'avatar
        const avatarActions = document.createElement('div');
        avatarActions.style.cssText = `
            position: absolute;
            bottom: 0;
            right: 0;
            display: flex;
            gap: 5px;
            background: rgba(0,0,0,0.7);
            padding: 5px;
            border-radius: 4px;
        `;
        
        const changeBtn = document.createElement('button');
        changeBtn.textContent = '📷';
        changeBtn.title = 'Changer l\'avatar';
        changeBtn.style.cssText = `
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 16px;
            padding: 5px;
        `;
        changeBtn.onclick = () => avatarInput.click();
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '🗑️';
        deleteBtn.title = 'Supprimer l\'avatar';
        deleteBtn.style.cssText = `
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 16px;
            padding: 5px;
        `;
        deleteBtn.onclick = deleteAvatar;
        
        const uploadBtn = document.createElement('button');
        uploadBtn.textContent = '⬆️';
        uploadBtn.title = 'Télécharger l\'avatar';
        uploadBtn.style.cssText = `
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 16px;
            padding: 5px;
        `;
        uploadBtn.onclick = uploadAvatarToServer;
        
        avatarActions.appendChild(changeBtn);
        avatarActions.appendChild(deleteBtn);
        avatarActions.appendChild(uploadBtn);
        
        profileAvatar.style.position = 'relative';
        profileAvatar.appendChild(avatarActions);
    }
    
    // Ajouter les event listeners pour l'upload d'image
    const uploadAvatarBtn = document.getElementById('uploadAvatarBtn');
    
    if (uploadAvatarBtn && avatarInput) {
        uploadAvatarBtn.addEventListener('click', function() {
            avatarInput.click();
        });
        
        avatarInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                // Valider le type de fichier
                if (!file.type.startsWith('image/')) {
                    showError('❌ Veuillez sélectionner une image valide');
                    return;
                }
                
                // Valider la taille du fichier (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    showError('❌ L\'image ne doit pas dépasser 5MB');
                    return;
                }
                
                // Stocker le fichier
                avatarFile = file;
                
                // Afficher un aperçu
                const reader = new FileReader();
                reader.onload = function(e) {
                    const avatarElement = document.getElementById('profileAvatar');
                    avatarElement.innerHTML = `<img src="${e.target.result}" alt="Avatar">`;
                };
                reader.readAsDataURL(file);
                
                console.log('✅ Image sélectionnée:', file.name);
            }
        });
    }
    
    // Charger les données du profil
    loadProfileData();
});