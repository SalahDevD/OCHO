# 📸 Guide: Gestion des Images de Produits

## Vue d'ensemble
Le système OCHO permet maintenant de gérer facilement les images des produits. Chaque produit peut avoir:
- Un **emoji** (👕, 👔, 👗, etc.)
- Une **URL d'image** (lien vers une image en ligne)
- Une **image par défaut** (👕) si aucune image n'est définie

---

## 🎯 Fonctionnalités

### 1. ✅ Afficher les images dans la liste des produits
- Une colonne **"Image"** apparaît maintenant en premier dans le tableau des produits
- L'image s'affiche en petit format (40x40px) pour une meilleure visibilité

### 2. ✅ Voir l'image lors de l'édition
Quand vous éditez un produit:
- L'image actuelle s'affiche en grand format (aperçu)
- Vous pouvez modifier l'image en remplissant le champ "Image du Produit"
- Vous pouvez choisir parmi les emojis proposés: 👕 👔 👗 👠 👜 🧣 🧤 👒 ⌚ 🎽 👖 👘 🥻 👙 🩱
- Ou coller une URL d'image

### 3. ✅ Modifier l'image depuis la vue détails
Quand vous consultez les détails d'un produit:
- L'image s'affiche en grand format (120px)
- Un bouton **"🖼️ Modifier l'image"** permet de changer rapidement l'image
- Un dialog s'ouvre avec les options d'emoji et URL

### 4. ✅ Créer un produit avec image
Lors de la création d'un nouveau produit:
- La section "Image du Produit" est en haut du formulaire
- Sélectionnez un emoji ou collez une URL
- L'image s'affiche en temps réel (aperçu instantané)
- L'image est enregistrée avec le produit

---

## 📋 Cas d'usage

### Créer un produit avec image
1. Cliquez sur **"Nouveau Produit"**
2. Sélectionnez une image (emoji ou URL)
3. Remplissez les autres champs (référence, nom, prix, etc.)
4. Cliquez sur **"Enregistrer"**
✅ Le produit est créé avec son image

### Modifier l'image d'un produit existant
**Option 1: Depuis l'édition**
1. Cliquez sur ✏️ (bouton modifier)
2. Changez l'image dans la section "Image du Produit"
3. Cliquez sur **"Enregistrer"**

**Option 2: Depuis les détails (plus rapide!)**
1. Cliquez sur 👁️ (bouton voir)
2. Cliquez sur **"🖼️ Modifier l'image"**
3. Choisissez ou collez une image
4. Confirmez
✅ L'image est mise à jour instantanément

---

## 🎨 Options d'images

### Emojis disponibles
```
👕 T-shirt        👔 Costume       👗 Robe
👠 Chaussures     👜 Sac à main    🧣 Écharpe
🧤 Gants          👒 Chapeau       ⌚ Montre
🎽 Vêtement       👖 Pantalon      👘 Kimono
🥻 Judogi         👙 Maillot       🩱 Maillot de bain
```

### URLs d'images
Collez simplement une URL vers une image en ligne:
```
https://example.com/images/product.jpg
```

---

## 💾 Stockage des images

Les images sont stockées dans la base de données:
- **Emojis**: Stockés tels quels (1-2 caractères)
- **URLs**: Stockées en tant que texte (jusqu'à 255 caractères)
- **Défaut**: Si aucune image, l'emoji 👕 s'affiche

Table: `Produit.image_url` (VARCHAR(255))

---

## ✅ Checklist de validation

- [x] Les images s'affichent dans la liste des produits
- [x] L'image apparaît dans la modal de détails
- [x] Possibilité de modifier l'image depuis la vue détails
- [x] Possibilité de modifier l'image lors de l'édition
- [x] Les images sont sauvegardées en base de données
- [x] Les aperçus se mettent à jour en temps réel
- [x] Les permissions sont vérifiées (seuls Admin/Magasinier peuvent modifier)

---

## 🔧 Implémentation technique

### Backend
- Route: `PUT /api/products/:id` accepte `image_url`
- Controller: [productController.js](backend/controllers/productController.js)
- Table: `Produit.image_url` (VARCHAR(255))

### Frontend
- Affichage: [products.js](frontend/js/products.js) - Fonction `getImageHtml()`
- Édition: Modal avec aperçu instantané
- Détails: Affichage grand format + bouton de modification rapide

---

## 📝 Notes importantes

1. **Taille des images**: Les URLs doivent pointent vers des images accessibles publiquement
2. **Emojis**: Tous les emojis Unicode sont acceptés (pas seulement ceux proposés)
3. **Permissions**: Seuls Admin et Magasinier peuvent modifier les images
4. **Performance**: Les images via URL sont chargées côté client (pas de stockage de fichier)

---

## 🆘 Dépannage

**L'image ne s'affiche pas?**
- Vérifiez que l'URL d'image est valide et accessible
- Utilisez un emoji à la place

**L'aperçu ne se met pas à jour?**
- Vérifiez que le champ image_url a le focus
- Actualisez la page (F5)

**L'image n'est pas sauvegardée?**
- Vérifiez vos permissions (Admin ou Magasinier)
- Vérifiez que le serveur backend est actif

---

*Dernière mise à jour: 2026-01-11*
