const db = require('./config/database');

/**
 * Migration: Augmenter la taille de la colonne image_url
 * Pour supporter les images base64 (qui peuvent être très longues)
 */

async function migrateImageUrl() {
    try {
        console.log('🔄 Migration: Augmentation de la colonne image_url...');
        
        // Vérifier la taille actuelle
        const [columns] = await db.query(`
            SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'Produit' AND COLUMN_NAME = 'image_url'
        `);
        
        console.log('État actuel:', columns[0]?.COLUMN_TYPE || 'Colonne non trouvée');
        
        // Modifier la colonne
        console.log('⏳ Modification de la colonne image_url en LONGTEXT...');
        await db.query(`ALTER TABLE Produit MODIFY image_url LONGTEXT`);
        
        console.log('✅ Colonne modifiée avec succès en LONGTEXT');
        
        // Vérifier le résultat
        const [columnsAfter] = await db.query(`
            SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'Produit' AND COLUMN_NAME = 'image_url'
        `);
        
        console.log('✅ État après migration:', columnsAfter[0]?.COLUMN_TYPE || 'Erreur');
        console.log('✅ Migration complétée avec succès!');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur lors de la migration:', error.message);
        process.exit(1);
    }
}

// Exécuter la migration
migrateImageUrl();
