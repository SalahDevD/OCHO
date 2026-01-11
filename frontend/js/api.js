// Configuration de l'API
const API_URL = 'http://localhost:5000/api';

// Debug: Log current origin
console.log('📍 Current Origin:', window.location.origin || 'null');
console.log('📍 Current URL:', window.location.href);
console.log('🌐 API URL:', API_URL);

// Fonction pour obtenir le token
function getToken() {
    return localStorage.getItem('token');
}

// Fonction pour faire des requêtes API
async function apiRequest(endpoint, method = 'GET', data = null) {
    const headers = {
        'Content-Type': 'application/json'
    };

    const token = getToken();
    console.log('🔍 Requête API:', { endpoint, method, token: token ? 'TOKEN_PRESENT' : 'NO_TOKEN' });
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers
    };

    if (data && (method === 'POST' || method === 'PUT')) {
        config.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);
        console.log(`📡 Response Status: ${response.status} - ${response.statusText}`);
        
        // Vérifier si la réponse est vide
        const contentType = response.headers.get('content-type');
        let result;
        
        if (contentType && contentType.includes('application/json')) {
            result = await response.json();
        } else {
            // Si ce n'est pas du JSON, essayer de lire comme texte
            const text = await response.text();
            console.error('⚠️ Réponse non JSON:', text);
            throw new Error(`Réponse invalide du serveur: ${response.status}`);
        }
        
        if (!response.ok) {
            console.error('❌ API Error Response:', result);
            throw new Error(result.message || `HTTP ${response.status}: Erreur API`);
        }
        
        console.log('✅ API Success:', { endpoint, data: result });
        return result;
    } catch (error) {
        console.error('❌ Erreur API:', error);
        throw error;
    }
}

// Fonctions API spécifiques
const API = {
    // Authentification
    login: (email, password) => apiRequest('/auth/login', 'POST', { email, password }),
    register: (data) => apiRequest('/auth/register', 'POST', data),
    logout: () => apiRequest('/auth/logout', 'POST'),
    
    // Utilisateurs
    getUsers: () => apiRequest('/users'),
    getUserById: (id) => apiRequest(`/users/${id}`),
    createUser: (data) => apiRequest('/users', 'POST', data),
    updateUser: (id, data) => apiRequest(`/users/${id}`, 'PUT', data),
    updateUserAvatar: (id, avatar) => apiRequest(`/users/${id}/avatar`, 'PUT', { avatar }),
    updateUserPassword: (id, data) => apiRequest(`/users/${id}/password`, 'PUT', data),
    deleteUser: (id) => apiRequest(`/users/${id}`, 'DELETE'),
    
    // Produits
    getProducts: () => apiRequest('/products'),
    getProductById: (id) => apiRequest(`/products/${id}`),
    getProductsByVendor: (vendorId) => apiRequest(`/products/vendeur/${vendorId}`),
    createProduct: (data) => apiRequest('/products', 'POST', data),
    updateProduct: (id, data) => apiRequest(`/products/${id}`, 'PUT', data),
    deleteProduct: (id) => apiRequest(`/products/${id}`, 'DELETE'),
    getProductCategories: () => apiRequest('/products/categories/all'),
    
    // Clients
    getClients: () => apiRequest('/clients'),
    getClientById: (id) => apiRequest(`/clients/${id}`),
    createClient: (data) => apiRequest('/clients', 'POST', data),
    updateClient: (id, data) => apiRequest(`/clients/${id}`, 'PUT', data),
    deleteClient: (id) => apiRequest(`/clients/${id}`, 'DELETE'),
    
    // Commandes
    getCommandes: () => apiRequest('/commandes'),
    getCommandeById: (id) => apiRequest(`/commandes/${id}`),
    getCommandesByVendor: (vendorId) => apiRequest(`/commandes/vendeur/${vendorId}`),
    createCommande: (data) => apiRequest('/commandes', 'POST', data),
    validerCommande: (id) => apiRequest(`/commandes/${id}/valider`, 'PUT'),
    updateStatut: (id, statut) => apiRequest(`/commandes/${id}/statut`, 'PUT', { statut }),
    
    // Dashboard
    getDashboardStats: () => apiRequest('/dashboard/stats'),
    getAlertes: () => apiRequest('/dashboard/alertes'),
    getVendorStats: (vendorId) => apiRequest(`/dashboard/vendeur/${vendorId}`)
};

// Navigation management - ensures consistent link visibility across all pages
function loadNavigation(role) {
    console.log('🔧 Loading navigation for role:', role);
    
    // Dashboard link - hidden for Client and Employé (they have seller-dashboard instead)
    const dashboardLink = document.getElementById('dashboardLink');
    if (dashboardLink) {
        if (role === 'Client' || role === 'Employé') {
            dashboardLink.style.display = 'none';
        } else {
            dashboardLink.style.display = 'flex';
        }
    }

    // Profile link - show for all roles
    const profileLink = document.getElementById('profileLink');
    if (profileLink) {
        profileLink.style.display = 'flex';
    }

    // Products link (inventory) - show for Admin and Magasinier only (hide for Employé)
    const productsLink = document.getElementById('productsLink');
    if (productsLink) {
        if (role === 'Administrateur' || role === 'Magasinier') {
            productsLink.style.display = 'flex';
        } else {
            productsLink.style.display = 'none';
            
            // Bloquer l'accès à products.html pour les vendeurs
            if (role === 'Employé' && window.location.pathname.includes('products.html') && 
                !window.location.pathname.includes('seller-products.html')) {
                console.log('🚫 Redirecting vendor from products.html to seller-products.html');
                window.location.href = 'seller-products.html';
            }
        }
    }

    // Seller Dashboard link - show for Employé only
    const sellerDashboardLink = document.getElementById('sellerDashboardLink');
    if (sellerDashboardLink) {
        if (role === 'Employé') {
            sellerDashboardLink.style.display = 'flex';
        } else {
            sellerDashboardLink.style.display = 'none';
        }
    }

    // Seller Products link - show for Employé only
    const sellerProductsLink = document.getElementById('sellerProductsLink');
    if (sellerProductsLink) {
        if (role === 'Employé') {
            sellerProductsLink.style.display = 'flex';
        } else {
            sellerProductsLink.style.display = 'none';
        }
    }

    // Shop link - show for Client and Employé
    const shopLink = document.getElementById('shopLink');
    if (shopLink) {
        if (role === 'Client' || role === 'Employé') {
            shopLink.style.display = 'flex';
        } else {
            shopLink.style.display = 'none';
        }
    }

    // Clients management link - show for Admin and Magasinier only
    const clientsLink = document.getElementById('clientsLink');
    if (clientsLink) {
        if (role === 'Administrateur' || role === 'Magasinier') {
            clientsLink.style.display = 'flex';
        } else {
            clientsLink.style.display = 'none';
        }
    }

    // Commandes link - show for all roles
    const commandesLink = document.getElementById('commandesLink');
    if (commandesLink) {
        commandesLink.style.display = 'flex';
    }

    // Users management link - show for Admin only
    const usersLink = document.getElementById('usersLink');
    if (usersLink) {
        if (role === 'Administrateur') {
            usersLink.style.display = 'flex';
        } else {
            usersLink.style.display = 'none';
        }
    }
}

// Fonctions utilitaires pour les requêtes
function formatPrice(price) {
    return new Intl.NumberFormat('fr-MA', {
        style: 'currency',
        currency: 'MAD'
    }).format(price || 0);
}

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

// Exporter les fonctions pour utilisation globale
window.API = API;
window.apiRequest = apiRequest;
window.loadNavigation = loadNavigation;
window.formatPrice = formatPrice;
window.formatDate = formatDate;