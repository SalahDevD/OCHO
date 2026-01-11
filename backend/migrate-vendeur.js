const db = require('./config/database');

async function checkAndAddVendeurColumn() {
    try {
        console.log('Vérification de la colonne vendeur_id...');
        const [columns] = await db.query(`
            SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'Produit' AND COLUMN_NAME = 'vendeur_id' AND TABLE_SCHEMA = DATABASE()
        `);
        
        if (columns.length > 0) {
            console.log('✅ Colonne vendeur_id existe');
            await db.end();
            process.exit(0);
        }
        
        console.log('Ajout de la colonne vendeur_id...');
        await db.query(`
            ALTER TABLE Produit 
            ADD COLUMN vendeur_id INT AFTER categorie_id
        `);
        
        console.log('✅ Colonne ajoutée avec succès');
        await db.end();
        process.exit(0);
    } catch (err) {
        console.error('❌ Erreur:', err.message);
        process.exit(1);
    }
}

checkAndAddVendeurColumn();
