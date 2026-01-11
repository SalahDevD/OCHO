const db = require('./config/database');

async function addAvatarColumn() {
    try {
        console.log('Adding avatar column to Utilisateur table...');
        
        await db.query(`
            ALTER TABLE Utilisateur ADD COLUMN avatar LONGTEXT AFTER actif
        `);
        
        console.log('✅ Avatar column added successfully!');
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('✅ Avatar column already exists');
        } else {
            console.error('❌ Error adding avatar column:', error.message);
        }
    }
    
    process.exit(0);
}

addAvatarColumn();
