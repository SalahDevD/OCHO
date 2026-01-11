# 🔄 Migration: Augmentation de la Colonne image_url

## ⚠️ Problème Identifié

Les images base64 très longues sont **tronquées** à 255 caractères car la colonne `image_url` était définie comme `VARCHAR(255)`.

```
VARCHAR(255) = 255 caractères max  ❌ Trop petit pour base64
LONGTEXT = 4GB max                 ✅ Parfait pour base64
```

## ✅ Solution

Changer `image_url` de `VARCHAR(255)` en `LONGTEXT`.

---

## 🚀 Comment Appliquer la Migration

### Option 1: Utiliser le Script Node.js (Recommandé)

```bash
cd backend
node migrate-image-url.js
```

**Résultat attendu:**
```
🔄 Migration: Augmentation de la colonne image_url...
État actuel: varchar(255)
⏳ Modification de la colonne image_url en LONGTEXT...
✅ Colonne modifiée avec succès en LONGTEXT
✅ État après migration: longtext
✅ Migration complétée avec succès!
```

### Option 2: SQL Directe (via MySQL)

```sql
-- Exécuter cette requête dans MySQL/MariaDB:
ALTER TABLE Produit MODIFY image_url LONGTEXT;

-- Vérifier le résultat:
SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Produit' AND COLUMN_NAME = 'image_url';
```

### Option 3: Fichier SQL

```bash
mysql -u root ocho_db < backend/config/migrate-image-url.sql
```

---

## 📊 Avant / Après

| Propriété | Avant | Après |
|-----------|-------|-------|
| Type | VARCHAR(255) | LONGTEXT |
| Taille max | 255 bytes | 4 GB |
| Images emoji | ✅ | ✅ |
| URLs courtes | ✅ | ✅ |
| URLs longues | ❌ | ✅ |
| Base64 courte | ✅ | ✅ |
| **Base64 longue** | ❌ | ✅ |

---

## 🧪 Test Après Migration

1. **Éditez un produit**
2. **Téléchargez/Collez une image base64 longue**
3. **Sauvegardez**
4. **Rechargez la page**
5. ✅ L'image devrait s'afficher correctement

---

## 🔒 Sécurité

`LONGTEXT` est sûr et n'introduit pas de vulnérabilités:
- ✅ Valide pour tous les types de contenu texte
- ✅ Compatible MySQL 5.7+
- ✅ Pas de risques de sécurité supplémentaires
- ✅ Performance optimisée pour cette utilisation

---

## 📝 Migration Automatique au Démarrage

Pour les futures installations, le fichier `init.sql` a été mis à jour avec `LONGTEXT` par défaut.

---

## 🆘 Dépannage

**"Erreur: Cannot acquire lock"**
- Attendez que toutes les connexions se ferment
- Ou redémarrez MySQL

**"Colonne introuvable"**
- Vérifiez que la base de données est `ocho_db`
- Vérifiez que la table est `Produit`

**L'image ne s'affiche toujours pas**
- Attendez quelques secondes après la migration
- Rafraîchissez la page du navigateur (Ctrl+F5)
- Vérifiez que l'image base64 est valide

---

**Date**: 11 janvier 2026  
**Fichiers affectés**: `Produit.image_url`  
**Impact**: Zéro downtime
