// Vérifier si l'utilisateur est connecté
function isAuthenticated() {
    return localStorage.getItem('token') !== null;
}

// Sauvegarder le token et les infos utilisateur
function saveAuth(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
}

// Déconnexion
function logout() {
    // Déconnexion directe sans confirmation
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Déterminer le bon chemin de redirection
    const isInPagesFolder = window.location.pathname.includes('/pages/');
    
    if (isInPagesFolder) {
        window.location.href = '../index.html';
    } else {
        window.location.href = 'index.html';
    }
}


// Obtenir les infos utilisateur
function getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// Gestion du formulaire de connexion
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const messageDiv = document.getElementById('message');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // Afficher message de chargement
            messageDiv.className = 'message';
            messageDiv.textContent = 'Connexion en cours...';
            messageDiv.style.display = 'block';

            try {
                const result = await apiRequest('/auth/login', 'POST', { email, password });
                
                if (result.success) {
                    saveAuth(result.token, result.user);
                    messageDiv.className = 'message success';
                    messageDiv.textContent = '✅ Connexion réussie !';
                    
                    setTimeout(() => {
                        window.location.href = 'pages/dashboard.html';
                    }, 1000);
                } else {
                    messageDiv.className = 'message error';
                    messageDiv.textContent = '❌ ' + (result.message || 'Email ou mot de passe incorrect');
                }
            } catch (error) {
                console.error('Erreur login:', error);
                messageDiv.className = 'message error';
                messageDiv.textContent = '❌ ' + (error.message || 'Erreur de connexion au serveur');
            }
        });
    }
    
    // Rediriger vers dashboard si déjà connecté
    const currentPath = window.location.pathname;
    if ((currentPath.endsWith('index.html') || currentPath === '/') && isAuthenticated()) {
        window.location.href = 'pages/dashboard.html';
    }
});
