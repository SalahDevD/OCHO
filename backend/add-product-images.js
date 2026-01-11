const db = require('./config/database');

async function addProductImages() {
    try {
        // Récupérer tous les produits
        const [products] = await db.query('SELECT id, nom FROM Produit');
        
        console.log(`Mise à jour de ${products.length} produits...`);
        
        const emojis = ['👕', '👔', '👗', '👠', '👜', '🧣', '🧤', '👒', '⌚', '🎽'];
        
        let updated = 0;
        for (let product of products) {
            const emoji = emojis[updated % emojis.length];
            await db.query('UPDATE Produit SET image_url = ? WHERE id = ?', [emoji, product.id]);
            updated++;
        }
        
        console.log(`✅ ${updated} produits mis à jour`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur:', error.message);
        setTimeout(() => process.exit(1), 100);
    }
}

addProductImages();
