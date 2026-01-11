const db = require('./config/database');

async function migrateUsersToClients() {
    try {
        console.log('🔄 Starting migration of Client users to Client table...\n');

        // Get all Client users
        const [clientUsers] = await db.query(`
            SELECT u.id, u.nom, u.email
            FROM Utilisateur u
            JOIN Role r ON u.role_id = r.id
            WHERE r.nom = 'Client' AND u.actif = TRUE
            ORDER BY u.id
        `);

        console.log(`Found ${clientUsers.length} Client users\n`);

        let created = 0;
        let skipped = 0;

        for (const user of clientUsers) {
            // Check if Client record already exists
            const [existing] = await db.query(
                'SELECT id FROM Client WHERE email = ?',
                [user.email]
            );

            if (existing.length > 0) {
                console.log(`⏭️  Skipped - Client already exists for ${user.email}`);
                skipped++;
            } else {
                try {
                    await db.query(
                        'INSERT INTO Client (nom, prenom, email) VALUES (?, ?, ?)',
                        [user.nom, '', user.email]
                    );
                    console.log(`✓ Created Client record for ${user.email}`);
                    created++;
                } catch (err) {
                    console.error(`✗ Error creating Client for ${user.email}:`, err.message);
                }
            }
        }

        console.log(`\n✅ Migration complete!`);
        console.log(`   Created: ${created}`);
        console.log(`   Skipped: ${skipped}`);
        console.log(`   Total:   ${clientUsers.length}`);

    } catch (error) {
        console.error('❌ Migration error:', error);
    } finally {
        process.exit(0);
    }
}

// Run the migration
migrateUsersToClients();
