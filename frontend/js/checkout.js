// Vérifier l'authentification
if (!isAuthenticated()) {
    window.location.href = '../index.html';
}

const user = getUser();
let cart = [];
let shippingCost = 50;
let taxRate = 0.20;

// Format price helper
function formatPrice(price) {
    return new Intl.NumberFormat('fr-MA', {
        style: 'currency',
        currency: 'MAD'
    }).format(price);
}

// Récupérer le panier du localStorage
function getCartFromStorage() {
    const storedCart = sessionStorage.getItem('checkout_cart');
    return storedCart ? JSON.parse(storedCart) : [];
}

// Afficher le résumé de la commande
function displayOrderSummary() {
    cart = getCartFromStorage();
    
    if (cart.length === 0) {
        alert('Votre panier est vide');
        window.location.href = 'client-shop.html';
        return;
    }

    // Afficher les articles
    const itemsContainer = document.getElementById('orderItems');
    itemsContainer.innerHTML = cart.map(item => `
        <div class="order-item">
            <span>${item.nom} (x${item.quantity})</span>
            <span>${formatPrice(item.prix_vente * item.quantity)}</span>
        </div>
    `).join('');

    // Calculer les totaux
    const subtotal = cart.reduce((sum, item) => sum + (item.prix_vente * item.quantity), 0);
    const tax = subtotal * taxRate;
    const total = subtotal + tax + shippingCost;

    document.getElementById('subtotal').textContent = formatPrice(subtotal);
    document.getElementById('tax').textContent = formatPrice(tax);
    document.getElementById('total').textContent = formatPrice(total);
}

// Sélectionner une méthode de paiement
function selectPaymentMethod(method) {
    // Mettre à jour les options
    document.querySelectorAll('.payment-option').forEach(option => {
        option.classList.remove('selected');
    });
    event.currentTarget.classList.add('selected');

    // Mettre à jour le formulaire
    document.querySelector(`input[value="${method}"]`).checked = true;

    // Afficher/masquer les détails appropriés
    document.getElementById('cardPayment').style.display = method === 'card' ? 'block' : 'none';
    document.getElementById('otherPayment').style.display = method === 'card' ? 'none' : 'block';
}

// Valider les données du formulaire
function validateForm() {
    const fullName = document.getElementById('fullName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const address = document.getElementById('address').value.trim();
    const city = document.getElementById('city').value.trim();
    const zipcode = document.getElementById('zipcode').value.trim();
    const country = document.getElementById('country').value;

    if (!fullName || !phone || !email || !address || !city || !zipcode || !country) {
        alert('Veuillez remplir tous les champs requis');
        return false;
    }

    // Valider email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Veuillez entrer une adresse email valide');
        return false;
    }

    // Valider téléphone (format marocain ou international)
    const phoneRegex = /^[0-9+\-\s()]{7,}$/;
    if (!phoneRegex.test(phone)) {
        alert('Veuillez entrer un numéro de téléphone valide');
        return false;
    }

    return true;
}

// Valider les données de carte
function validateCardData() {
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    
    if (paymentMethod !== 'card') {
        return true; // Les autres méthodes sont validées à l'étape suivante
    }

    const cardHolder = document.getElementById('cardHolder').value.trim();
    const cardNumber = document.getElementById('cardNumber').value.trim();
    const expiryDate = document.getElementById('expiryDate').value.trim();
    const cvv = document.getElementById('cvv').value.trim();

    if (!cardHolder || !cardNumber || !expiryDate || !cvv) {
        alert('Veuillez remplir tous les champs de la carte');
        return false;
    }

    // Valider le numéro de carte (16-19 chiffres)
    const cardNumberOnly = cardNumber.replace(/\s/g, '');
    if (!/^\d{16,19}$/.test(cardNumberOnly)) {
        alert('Le numéro de carte doit contenir 16 à 19 chiffres');
        return false;
    }

    // Valider la date d'expiration
    if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
        alert('La date d\'expiration doit être au format MM/YY');
        return false;
    }

    // Valider le CVV
    if (!/^\d{3,4}$/.test(cvv)) {
        alert('Le CVV doit contenir 3 ou 4 chiffres');
        return false;
    }

    return true;
}

// Compléter le checkout
async function completeCheckout() {
    if (!validateForm()) {
        return;
    }

    if (!validateCardData()) {
        return;
    }

    try {
        // Préparer les données de la commande
        const articles = cart.map(item => ({
            produit_id: item.id,
            variante_id: item.variante_id || null,
            quantite: item.quantity,
            prix_unitaire: item.prix_vente
        }));

        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
        const subtotal = cart.reduce((sum, item) => sum + (item.prix_vente * item.quantity), 0);
        const tax = subtotal * taxRate;
        const total = subtotal + tax + shippingCost;

        const orderData = {
            client_id: user.id,
            articles: articles,
            notes: `Commande depuis la boutique en ligne. Paiement: ${paymentMethod}`,
            adresse_livraison: `${document.getElementById('address').value}, ${document.getElementById('city').value} ${document.getElementById('zipcode').value}, ${document.getElementById('country').value}`,
            telephone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            methode_paiement: paymentMethod,
            montant_total: total
        };

        // Créer la commande
        const result = await apiRequest('/commandes', 'POST', orderData);

        if (result.success) {
            // Sauvegarder les détails du paiement
            const paymentDetails = {
                orderId: result.commande.id,
                method: paymentMethod,
                amount: total,
                timestamp: new Date().toISOString()
            };

            if (paymentMethod === 'card') {
                // Masquer les données sensibles
                paymentDetails.lastFourDigits = document.getElementById('cardNumber').value.slice(-4);
            }

            // Sauvegarder l'adresse de livraison
            const deliveryAddress = {
                address: document.getElementById('address').value,
                city: document.getElementById('city').value,
                zipcode: document.getElementById('zipcode').value,
                country: document.getElementById('country').value
            };

            sessionStorage.setItem('last_payment', JSON.stringify(paymentDetails));
            sessionStorage.setItem('delivery_address', JSON.stringify(deliveryAddress));
            sessionStorage.removeItem('checkout_cart');

            // Rediriger vers la page de confirmation
            window.location.href = 'order-confirmation.html';
        } else {
            alert('Erreur: ' + result.message);
        }
    } catch (error) {
        console.error('Erreur checkout:', error);
        alert('Erreur lors de la création de la commande');
    }
}

// Formater le numéro de carte
document.getElementById('cardNumber')?.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\s/g, '');
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    e.target.value = formattedValue;
});

// Formater la date d'expiration
document.getElementById('expiryDate')?.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    e.target.value = value;
});

// Limiter le CVV à 3 ou 4 chiffres
document.getElementById('cvv')?.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
});

// Charger le résumé au démarrage
document.addEventListener('DOMContentLoaded', () => {
    displayOrderSummary();
});
