// Configuration de l'API
const API_URL = 'http://localhost:5000/api';

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
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Erreur API');
        }
        
        return result;
    } catch (error) {
        console.error('Erreur API:', error);
        throw error;
    }
}

// Fonctions API spécifiques
const API = {
    // Authentification
    login: (email, password) => apiRequest('/auth/login', 'POST', { email, password }),
    register: (data) => apiRequest('/auth/register', 'POST', data),
    
    // Produits
    getProducts: () => apiRequest('/products'),
    getProductById: (id) => apiRequest(`/products/${id}`),
    createProduct: (data) => apiRequest('/products', 'POST', data),
    updateProduct: (id, data) => apiRequest(`/products/${id}`, 'PUT', data),
    deleteProduct: (id) => apiRequest(`/products/${id}`, 'DELETE'),
    
    // Clients
    getClients: () => apiRequest('/clients'),
    getClientById: (id) => apiRequest(`/clients/${id}`),
    createClient: (data) => apiRequest('/clients', 'POST', data),
    updateClient: (id, data) => apiRequest(`/clients/${id}`, 'PUT', data),
    deleteClient: (id) => apiRequest(`/clients/${id}`, 'DELETE'),
    
    // Commandes
    getCommandes: () => apiRequest('/commandes'),
    getCommandeById: (id) => apiRequest(`/commandes/${id}`),
    createCommande: (data) => apiRequest('/commandes', 'POST', data),
    validerCommande: (id) => apiRequest(`/commandes/${id}/valider`, 'PUT'),
    updateStatut: (id, statut) => apiRequest(`/commandes/${id}/statut`, 'PUT', { statut }),
    
    // Dashboard
    getDashboardStats: () => apiRequest('/dashboard/stats'),
    getAlertes: () => apiRequest('/dashboard/alertes')
};
