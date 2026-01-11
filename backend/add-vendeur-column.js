const db = require('./config/database');

async function addVendeurColumn() {
    try {
        console.log('Vérification de la colonne vendeur_id dans Produit...');
        
        // Vérifier si la colonne existe déjà
        const [columns] = await db.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'Produit' AND COLUMN_NAME = 'vendeur_id'
        `);
        
        if (columns.length > 0) {
            console.log('✅ La colonne vendeur_id existe déjà');
            process.exit(0);
        }
        
        console.log('⚠️ Colonne vendeur_id manquante, ajout...');
        
        // Ajouter la colonne
        await db.query(`
            ALTER TABLE Produit 
            ADD COLUMN vendeur_id INT AFTER categorie_id,
            ADD FOREIGN KEY (vendeur_id) REFERENCES Utilisateur(id) ON DELETE SET NULL,
            ADD INDEX idx_produit_vendeur (vendeur_id)
        `);
        
        console.log('✅ Colonne vendeur_id ajoutée avec succès');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
        process.exit(1);
    }
}

addVendeurColumn();
