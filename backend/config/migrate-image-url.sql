-- Migration: Augmenter la taille de image_url pour supporter les images base64
-- Date: 11 janvier 2026
-- Raison: Les images base64 peuvent être très longues (plusieurs kilobytes)

-- Vérifier l'état actuel
SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Produit' AND COLUMN_NAME = 'image_url';

-- Modifier la colonne pour supporter les longues URLs et images base64
ALTER TABLE Produit MODIFY image_url LONGTEXT;

-- Vérifier le résultat
SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Produit' AND COLUMN_NAME = 'image_url';

-- Si le changement a réussi, vous verrez: LONGTEXT au lieu de VARCHAR(255)
