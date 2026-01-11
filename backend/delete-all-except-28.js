const db = require('./config/database');

/**
 * Script: Supprimer tous les produits sauf l'id 28
 * ATTENTION: Cette action est IRRÉVERSIBLE!
 */

async function deleteAllProductsExcept() {
    try {
        console.log('⚠️  ATTENTION: Suppression de tous les produits sauf l\'id 28!\n');

        // 1. Trouver tous les produits SAUF l'id 28
        console.log('1️⃣  Récupération des produits à supprimer...');
        const [products] = await db.query('SELECT id FROM Produit WHERE id != 28');
        
        console.log(`   ✓ ${products.length} produits trouvés\n`);

        if (products.length === 0) {
            console.log('   ✓ Aucun produit à supprimer\n');
            process.exit(0);
        }

        console.log(`   IDs à supprimer: ${products.map(p => p.id).join(', ')}\n`);

        // 2. Supprimer les MouvementStock
        console.log('2️⃣  Suppression des mouvements de stock...');
        try {
            const [movementResult] = await db.query(`
                DELETE FROM MouvementStock 
                WHERE variante_id IN (
                    SELECT id FROM Variante 
                    WHERE produit_id != 28
                )
            `);
            console.log(`   ✓ ${movementResult.affectedRows} mouvements supprimés\n`);
        } catch (e) {
            console.log(`   ⚠️  Erreur (non-critique): ${e.message}\n`);
        }

        // 3. Supprimer les LigneCommande
        console.log('3️⃣  Suppression des lignes de commande...');
        try {
            const [lineResult] = await db.query(`
                DELETE FROM LigneCommande 
                WHERE variante_id IN (
                    SELECT id FROM Variante 
                    WHERE produit_id != 28
                )
            `);
            console.log(`   ✓ ${lineResult.affectedRows} lignes supprimées\n`);
        } catch (e) {
            console.log(`   ⚠️  Erreur (non-critique): ${e.message}\n`);
        }

        // 4. Supprimer les Variantes
        console.log('4️⃣  Suppression des variantes...');
        const [variantResult] = await db.query('DELETE FROM Variante WHERE produit_id != 28');
        console.log(`   ✓ ${variantResult.affectedRows} variantes supprimées\n`);

        // 5. Supprimer les Produits
        console.log('5️⃣  Suppression des produits...');
        const [productResult] = await db.query('DELETE FROM Produit WHERE id != 28');
        console.log(`   ✓ ${productResult.affectedRows} produits supprimés\n`);

        // 6. Vérifier
        console.log('6️⃣  Vérification...');
        const [remaining] = await db.query('SELECT id, nom, reference FROM Produit ORDER BY id');
        console.log(`   ✓ ${remaining.length} produit(s) restant(s):`);
        remaining.forEach(p => {
            console.log(`      - ID ${p.id}: ${p.reference} (${p.nom})`);
        });

        console.log('\n✅ Suppression complétée avec succès!');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Erreur GRAVE:', error.message);
        console.error('Code:', error.code);
        process.exit(1);
    }
}

// Exécuter
deleteAllProductsExcept();

