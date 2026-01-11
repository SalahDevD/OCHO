const db = require('./config/database');

async function updateStatusEnum() {
    try {
        console.log('🔄 Updating Commande status ENUM...\n');

        // Modifier l'ENUM pour ajouter 'Payée'
        await db.query(`
            ALTER TABLE Commande 
            MODIFY COLUMN statut ENUM('Créée', 'Payée', 'Validée', 'En cours', 'Livrée', 'Annulée') DEFAULT 'Créée'
        `);

        console.log('✅ Commande status ENUM updated successfully!\n');
        console.log('📋 Updated statuses: Créée, Payée, Validée, En cours, Livrée, Annulée');

    } catch (error) {
        console.error('❌ Migration error:', error.message);
    } finally {
        process.exit(0);
    }
}

updateStatusEnum();
