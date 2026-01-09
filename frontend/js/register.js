// Si déjà connecté, rediriger vers le dashboard
if (localStorage.getItem('token')) {
    window.location.href = 'pages/dashboard.html';
}

// Gestion du formulaire d'inscription
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const messageDiv = document.getElementById('message');
    const nom = document.getElementById('nom').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const role_id = parseInt(document.getElementById('role').value);
    
    // Réinitialiser le message
    messageDiv.className = 'message';
    messageDiv.textContent = '';
    
    // Validation du formulaire
    if (!nom || !email || !password || !role_id) {
        messageDiv.className = 'message error';
        messageDiv.textContent = 'Tous les champs sont obligatoires';
        return;
    }
    
    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        messageDiv.className = 'message error';
        messageDiv.textContent = 'Email invalide';
        return;
    }
    
    // Validation du mot de passe
    if (password.length < 6) {
        messageDiv.className = 'message error';
        messageDiv.textContent = 'Le mot de passe doit contenir au moins 6 caractères';
        return;
    }
    
    // Vérification de la confirmation du mot de passe
    if (password !== confirmPassword) {
        messageDiv.className = 'message error';
        messageDiv.textContent = 'Les mots de passe ne correspondent pas';
        return;
    }
    
    // Afficher le chargement
    messageDiv.className = 'message';
    messageDiv.textContent = 'Création du compte en cours...';
    messageDiv.style.display = 'block';
    
    try {
        const result = await apiRequest('/auth/register', 'POST', {
            nom,
            email,
            mot_de_passe: password,
            role_id
        });
        
        if (result.success) {
            messageDiv.className = 'message success';
            messageDiv.textContent = '✅ Compte créé avec succès ! Redirection vers la connexion...';
            
            // Rediriger vers la page de connexion après 2 secondes
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        } else {
            messageDiv.className = 'message error';
            messageDiv.textContent = '❌ ' + (result.message || 'Erreur lors de la création du compte');
        }
    } catch (error) {
        console.error('Erreur inscription:', error);
        messageDiv.className = 'message error';
        messageDiv.textContent = '❌ ' + (error.message || 'Erreur lors de la création du compte');
    }
});

// Validation en temps réel de la confirmation du mot de passe
document.getElementById('confirmPassword').addEventListener('input', function() {
    const password = document.getElementById('password').value;
    const confirmPassword = this.value;
    
    if (confirmPassword && password !== confirmPassword) {
        this.style.borderColor = '#ef4444';
    } else {
        this.style.borderColor = '#e0e0e0';
    }
});
