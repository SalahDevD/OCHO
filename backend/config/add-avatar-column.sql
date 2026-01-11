-- Add avatar column to Utilisateur table if it doesn't exist
ALTER TABLE Utilisateur ADD COLUMN avatar LONGTEXT AFTER actif;
