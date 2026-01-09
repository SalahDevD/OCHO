-- ============================================
-- OCHO - Base de Données Complète
-- Système de Gestion de Stock pour PME Vêtements
-- ============================================

-- Supprimer la base si elle existe (ATTENTION: supprime toutes les données)
DROP DATABASE IF EXISTS ocho_db;

-- Créer la base de données
CREATE DATABASE ocho_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ocho_db;

-- ============================================
-- TABLES PRINCIPALES
-- ============================================

-- Table Role
CREATE TABLE Role (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_role_nom (nom)
) ENGINE=InnoDB;

-- Table Utilisateur
CREATE TABLE Utilisateur (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    actif BOOLEAN DEFAULT TRUE,
    derniere_connexion TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES Role(id) ON DELETE RESTRICT,
    INDEX idx_user_email (email),
    INDEX idx_user_role (role_id),
    INDEX idx_user_actif (actif)
) ENGINE=InnoDB;

-- Table Client
CREATE TABLE Client (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100),
    email VARCHAR(150) UNIQUE,
    telephone VARCHAR(20),
    adresse TEXT,
    ville VARCHAR(100),
    code_postal VARCHAR(10),
    actif BOOLEAN DEFAULT TRUE,
    date_inscription TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_client_nom (nom),
    INDEX idx_client_email (email),
    INDEX idx_client_actif (actif)
) ENGINE=InnoDB;

-- Table Categorie
CREATE TABLE Categorie (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url VARCHAR(255),
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_categorie_nom (nom)
) ENGINE=InnoDB;

-- Table Produit
CREATE TABLE Produit (
    id INT PRIMARY KEY AUTO_INCREMENT,
    reference VARCHAR(50) NOT NULL UNIQUE,
    nom VARCHAR(200) NOT NULL,
    description TEXT,
    categorie_id INT NOT NULL,
    genre ENUM('Homme', 'Femme', 'Enfant', 'Unisexe') NOT NULL,
    saison ENUM('Été', 'Hiver', 'Printemps', 'Automne', 'Toute saison') DEFAULT 'Toute saison',
    marque VARCHAR(100),
    prix_achat DECIMAL(10, 2) NOT NULL,
    prix_vente DECIMAL(10, 2) NOT NULL,
    seuil_min INT DEFAULT 10,
    image_url VARCHAR(255),
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (categorie_id) REFERENCES Categorie(id) ON DELETE RESTRICT,
    INDEX idx_produit_reference (reference),
    INDEX idx_produit_categorie (categorie_id),
    INDEX idx_produit_genre (genre),
    INDEX idx_produit_actif (actif),
    INDEX idx_produit_nom (nom)
) ENGINE=InnoDB;

-- Table Variante (Taille, Couleur, Stock)
CREATE TABLE Variante (
    id INT PRIMARY KEY AUTO_INCREMENT,
    produit_id INT NOT NULL,
    taille VARCHAR(10) NOT NULL,
    couleur VARCHAR(50) NOT NULL,
    code_couleur VARCHAR(7),
    quantite INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (produit_id) REFERENCES Produit(id) ON DELETE CASCADE,
    UNIQUE KEY unique_variante (produit_id, taille, couleur),
    INDEX idx_variante_produit (produit_id),
    INDEX idx_variante_quantite (quantite),
    CONSTRAINT chk_quantite CHECK (quantite >= 0)
) ENGINE=InnoDB;

-- Table Commande
CREATE TABLE Commande (
    id INT PRIMARY KEY AUTO_INCREMENT,
    reference VARCHAR(50) NOT NULL UNIQUE,
    client_id INT NOT NULL,
    utilisateur_id INT,
    date_commande TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    statut ENUM('Créée', 'Validée', 'En cours', 'Livrée', 'Annulée') DEFAULT 'Créée',
    total DECIMAL(10, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES Client(id) ON DELETE RESTRICT,
    FOREIGN KEY (utilisateur_id) REFERENCES Utilisateur(id) ON DELETE SET NULL,
    INDEX idx_commande_reference (reference),
    INDEX idx_commande_client (client_id),
    INDEX idx_commande_statut (statut),
    INDEX idx_commande_date (date_commande)
) ENGINE=InnoDB;

-- Table LigneCommande
CREATE TABLE LigneCommande (
    id INT PRIMARY KEY AUTO_INCREMENT,
    commande_id INT NOT NULL,
    variante_id INT NOT NULL,
    produit_id INT NOT NULL,
    quantite INT NOT NULL,
    prix_unitaire DECIMAL(10, 2) NOT NULL,
    sous_total DECIMAL(10, 2) GENERATED ALWAYS AS (quantite * prix_unitaire) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (commande_id) REFERENCES Commande(id) ON DELETE CASCADE,
    FOREIGN KEY (variante_id) REFERENCES Variante(id) ON DELETE RESTRICT,
    FOREIGN KEY (produit_id) REFERENCES Produit(id) ON DELETE RESTRICT,
    INDEX idx_ligne_commande (commande_id),
    INDEX idx_ligne_variante (variante_id),
    CONSTRAINT chk_ligne_quantite CHECK (quantite > 0),
    CONSTRAINT chk_ligne_prix CHECK (prix_unitaire >= 0)
) ENGINE=InnoDB;

-- Table MouvementStock
CREATE TABLE MouvementStock (
    id INT PRIMARY KEY AUTO_INCREMENT,
    variante_id INT NOT NULL,
    type ENUM('ENTRÉE', 'SORTIE') NOT NULL,
    quantite INT NOT NULL,
    motif ENUM('Approvisionnement', 'Vente', 'Retour client', 'Défectueux', 'Perte', 'Don', 'Correction', 'Autre') NOT NULL,
    reference_externe VARCHAR(100),
    utilisateur_id INT NOT NULL,
    date_mouvement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    quantite_avant INT NOT NULL,
    quantite_apres INT NOT NULL,
    notes TEXT,
    FOREIGN KEY (variante_id) REFERENCES Variante(id) ON DELETE RESTRICT,
    FOREIGN KEY (utilisateur_id) REFERENCES Utilisateur(id) ON DELETE RESTRICT,
    INDEX idx_mouvement_variante (variante_id),
    INDEX idx_mouvement_type (type),
    INDEX idx_mouvement_date (date_mouvement),
    INDEX idx_mouvement_user (utilisateur_id),
    CONSTRAINT chk_mouvement_quantite CHECK (quantite > 0)
) ENGINE=InnoDB;

-- Table Fournisseur (pour évolutions futures)
CREATE TABLE Fournisseur (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(150) NOT NULL,
    contact VARCHAR(100),
    email VARCHAR(150),
    telephone VARCHAR(20),
    adresse TEXT,
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_fournisseur_nom (nom)
) ENGINE=InnoDB;

-- Table LogsSysteme (Traçabilité complète)
CREATE TABLE LogsSysteme (
    id INT PRIMARY KEY AUTO_INCREMENT,
    utilisateur_id INT,
    action VARCHAR(255) NOT NULL,
    table_concernee VARCHAR(100),
    enregistrement_id INT,
    details TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    date_action TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (utilisateur_id) REFERENCES Utilisateur(id) ON DELETE SET NULL,
    INDEX idx_logs_user (utilisateur_id),
    INDEX idx_logs_date (date_action),
    INDEX idx_logs_table (table_concernee),
    INDEX idx_logs_action (action)
) ENGINE=InnoDB;

-- Table Alerte (pour les notifications de stock)
CREATE TABLE Alerte (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type ENUM('Stock faible', 'Rupture', 'Seuil critique') NOT NULL,
    variante_id INT NOT NULL,
    quantite_actuelle INT NOT NULL,
    seuil_min INT NOT NULL,
    message TEXT,
    statut ENUM('Active', 'Vue', 'Résolue') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    FOREIGN KEY (variante_id) REFERENCES Variante(id) ON DELETE CASCADE,
    INDEX idx_alerte_statut (statut),
    INDEX idx_alerte_type (type),
    INDEX idx_alerte_date (created_at)
) ENGINE=InnoDB;

-- ============================================
-- VUES UTILES
-- ============================================

-- Vue : Stock actuel par produit
CREATE VIEW v_stock_produits AS
SELECT 
    p.id as produit_id,
    p.reference,
    p.nom as produit_nom,
    c.nom as categorie,
    p.genre,
    p.prix_vente,
    p.seuil_min,
    COUNT(DISTINCT v.id) as nombre_variantes,
    COALESCE(SUM(v.quantite), 0) as stock_total,
    CASE 
        WHEN COALESCE(SUM(v.quantite), 0) = 0 THEN 'Rupture'
        WHEN COALESCE(SUM(v.quantite), 0) <= p.seuil_min THEN 'Critique'
        WHEN COALESCE(SUM(v.quantite), 0) <= (p.seuil_min * 2) THEN 'Faible'
        ELSE 'Normal'
    END as statut_stock
FROM Produit p
LEFT JOIN Categorie c ON p.categorie_id = c.id
LEFT JOIN Variante v ON p.id = v.produit_id
WHERE p.actif = TRUE
GROUP BY p.id;

-- Vue : Commandes avec détails
CREATE VIEW v_commandes_details AS
SELECT 
    cmd.id,
    cmd.reference,
    cmd.date_commande,
    cmd.statut,
    cmd.total,
    CONCAT(cl.nom, ' ', COALESCE(cl.prenom, '')) as client_nom,
    cl.email as client_email,
    cl.telephone as client_telephone,
    u.nom as utilisateur_nom,
    COUNT(lc.id) as nombre_articles,
    SUM(lc.quantite) as quantite_totale
FROM Commande cmd
JOIN Client cl ON cmd.client_id = cl.id
LEFT JOIN Utilisateur u ON cmd.utilisateur_id = u.id
LEFT JOIN LigneCommande lc ON cmd.id = lc.commande_id
GROUP BY cmd.id;

-- Vue : Statistiques ventes par produit
CREATE VIEW v_stats_ventes_produits AS
SELECT 
    p.id as produit_id,
    p.reference,
    p.nom as produit_nom,
    c.nom as categorie,
    COUNT(DISTINCT lc.commande_id) as nombre_commandes,
    SUM(lc.quantite) as quantite_vendue,
    SUM(lc.sous_total) as chiffre_affaires,
    AVG(lc.prix_unitaire) as prix_moyen
FROM Produit p
LEFT JOIN Categorie c ON p.categorie_id = c.id
LEFT JOIN LigneCommande lc ON p.id = lc.produit_id
LEFT JOIN Commande cmd ON lc.commande_id = cmd.id
WHERE cmd.statut IN ('Validée', 'En cours', 'Livrée')
GROUP BY p.id;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger : Mettre à jour le total de la commande après insertion ligne
DELIMITER //
CREATE TRIGGER after_ligne_commande_insert
AFTER INSERT ON LigneCommande
FOR EACH ROW
BEGIN
    UPDATE Commande 
    SET total = (
        SELECT SUM(sous_total) 
        FROM LigneCommande 
        WHERE commande_id = NEW.commande_id
    )
    WHERE id = NEW.commande_id;
END//
DELIMITER ;

-- Trigger : Mettre à jour le total de la commande après modification ligne
DELIMITER //
CREATE TRIGGER after_ligne_commande_update
AFTER UPDATE ON LigneCommande
FOR EACH ROW
BEGIN
    UPDATE Commande 
    SET total = (
        SELECT SUM(sous_total) 
        FROM LigneCommande 
        WHERE commande_id = NEW.commande_id
    )
    WHERE id = NEW.commande_id;
END//
DELIMITER ;

-- Trigger : Mettre à jour le total de la commande après suppression ligne
DELIMITER //
CREATE TRIGGER after_ligne_commande_delete
AFTER DELETE ON LigneCommande
FOR EACH ROW
BEGIN
    UPDATE Commande 
    SET total = COALESCE((
        SELECT SUM(sous_total) 
        FROM LigneCommande 
        WHERE commande_id = OLD.commande_id
    ), 0)
    WHERE id = OLD.commande_id;
END//
DELIMITER ;

-- Trigger : Créer alerte si stock faible après mouvement
DELIMITER //
CREATE TRIGGER after_mouvement_stock_check_alerte
AFTER INSERT ON MouvementStock
FOR EACH ROW
BEGIN
    DECLARE v_seuil INT;
    DECLARE v_produit_id INT;
    
    SELECT p.seuil_min, v.produit_id INTO v_seuil, v_produit_id
    FROM Variante v
    JOIN Produit p ON v.produit_id = p.id
    WHERE v.id = NEW.variante_id;
    
    IF NEW.quantite_apres <= v_seuil AND NEW.quantite_apres > 0 THEN
        INSERT INTO Alerte (type, variante_id, quantite_actuelle, seuil_min, message)
        VALUES (
            'Stock faible',
            NEW.variante_id,
            NEW.quantite_apres,
            v_seuil,
            CONCAT('Stock faible détecté. Quantité actuelle: ', NEW.quantite_apres, ', Seuil: ', v_seuil)
        );
    ELSEIF NEW.quantite_apres = 0 THEN
        INSERT INTO Alerte (type, variante_id, quantite_actuelle, seuil_min, message)
        VALUES (
            'Rupture',
            NEW.variante_id,
            0,
            v_seuil,
            'Rupture de stock détectée'
        );
    END IF;
END//
DELIMITER ;

-- ============================================
-- DONNÉES INITIALES
-- ============================================

-- Insertion des Rôles
INSERT INTO Role (nom, description) VALUES 
('Administrateur', 'Accès complet au système'),
('Magasinier', 'Gestion du stock et des entrées/sorties'),
('Employé', 'Consultation et enregistrement des ventes'),
('Client', 'Consultation catalogue et passage de commandes');

-- Insertion Utilisateurs (mot de passe: Admin@123)
-- Hash bcrypt pour "Admin@123": $2b$10$rQZJKe1Y3VZ8EaVVxRxBY.kYqVrJKF.xPJxLH1RXxI3nA7ZYQhKLC
INSERT INTO Utilisateur (nom, email, mot_de_passe, role_id) VALUES 
('Administrateur OCHO', 'admin@ocho.ma', '$2b$10$rQZJKe1Y3VZ8EaVVxRxBY.kYqVrJKF.xPJxLH1RXxI3nA7ZYQhKLC', 1),
('Mohammed Alaoui', 'alaoui@ocho.ma', '$2b$10$rQZJKe1Y3VZ8EaVVxRxBY.kYqVrJKF.xPJxLH1RXxI3nA7ZYQhKLC', 2),
('Fatima Zahra', 'fzahra@ocho.ma', '$2b$10$rQZJKe1Y3VZ8EaVVxRxBY.kYqVrJKF.xPJxLH1RXxI3nA7ZYQhKLC', 3);

-- Insertion Catégories
INSERT INTO Categorie (nom, description, actif) VALUES 
('T-shirt', 'T-shirts et polos pour tous', TRUE),
('Jean', 'Pantalons en jean de différentes coupes', TRUE),
('Veste', 'Vestes, manteaux et blousons', TRUE),
('Robe', 'Robes pour femmes et filles', TRUE),
('Chaussures', 'Chaussures pour toute la famille', TRUE),
('Accessoires', 'Ceintures, sacs, écharpes', TRUE),
('Chemise', 'Chemises et blouses', TRUE),
('Pantalon', 'Pantalons classiques et décontractés', TRUE);

-- Insertion Clients
INSERT INTO Client (nom, prenom, email, telephone, adresse, ville, code_postal, actif) VALUES 
('Alami', 'Mohammed', 'alami@email.com', '0612345678', 'Rue Mohamed V, Apt 12', 'Casablanca', '20000', TRUE),
('Bennis', 'Fatima', 'bennis@email.com', '0623456789', 'Boulevard Zerktouni, Résidence Al Amal', 'Rabat', '10000', TRUE),
('Chakir', 'Youssef', 'chakir@email.com', '0634567890', 'Avenue Hassan II, Immeuble C', 'Marrakech', '40000', TRUE),
('Tazi', 'Aisha', 'tazi@email.com', '0645678901', 'Quartier Maarif, Villa 5', 'Casablanca', '20100', TRUE),
('Idrissi', 'Omar', 'idrissi@email.com', '0656789012', 'Agdal, Rue des FAR', 'Rabat', '10080', TRUE);

-- Insertion Fournisseurs
INSERT INTO Fournisseur (nom, contact, email, telephone, adresse, actif) VALUES 
('Textile Maroc', 'Ahmed Benjelloun', 'contact@textilemaroc.ma', '0522334455', 'Zone Industrielle Ain Sebaa, Casablanca', TRUE),
('Fashion Import', 'Karim Alami', 'info@fashionimport.ma', '0537445566', 'Route de Témara, Rabat', TRUE),
('Style Plus', 'Nadia Tazi', 'contact@styleplus.ma', '0524556677', 'Avenue Mohammed VI, Marrakech', TRUE);

-- Insertion Produits
INSERT INTO Produit (reference, nom, description, categorie_id, genre, saison, marque, prix_achat, prix_vente, seuil_min, actif) VALUES 
-- T-shirts
('TSH-001', 'T-Shirt Col Rond Basique', 'T-shirt 100% coton, col rond, coupe classique', 1, 'Unisexe', 'Toute saison', 'OCHO Basic', 45.00, 89.00, 20, TRUE),
('TSH-002', 'Polo Sport Premium', 'Polo en coton piqué, logo brodé', 1, 'Homme', 'Été', 'OCHO Sport', 75.00, 149.00, 15, TRUE),
('TSH-003', 'T-Shirt Femme Col V', 'T-shirt coupe ajustée, col V, doux et confortable', 1, 'Femme', 'Toute saison', 'OCHO Femme', 50.00, 99.00, 20, TRUE),

-- Jeans
('JEN-001', 'Jean Slim Fit Homme', 'Jean stretch, coupe slim, délavage moderne', 2, 'Homme', 'Toute saison', 'OCHO Denim', 150.00, 299.00, 10, TRUE),
('JEN-002', 'Jean Skinny Femme', 'Jean taille haute, coupe skinny, très confortable', 2, 'Femme', 'Toute saison', 'OCHO Denim', 140.00, 279.00, 12, TRUE),
('JEN-003', 'Jean Enfant Regular', 'Jean résistant pour enfants, coupe regular', 2, 'Enfant', 'Toute saison', 'OCHO Kids', 90.00, 179.00, 15, TRUE),

-- Vestes
('VES-001', 'Veste en Jean Classique', 'Veste en jean 100% coton, style vintage', 3, 'Unisexe', 'Printemps', 'OCHO Denim', 180.00, 359.00, 8, TRUE),
('VES-002', 'Blouson Cuir Homme', 'Blouson en cuir véritable, doublure intérieure', 3, 'Homme', 'Automne', 'OCHO Premium', 450.00, 899.00, 5, TRUE),
('VES-003', 'Parka Hiver Femme', 'Parka chaude avec capuche fourrure', 3, 'Femme', 'Hiver', 'OCHO Winter', 350.00, 699.00, 6, TRUE),

-- Robes
('ROB-001', 'Robe d\'Été Fleurie', 'Robe légère à motifs floraux', 4, 'Femme', 'Été', 'OCHO Femme', 120.00, 239.00, 10, TRUE),
('ROB-002', 'Robe de Soirée Élégante', 'Robe longue pour occasions spéciales', 4, 'Femme', 'Toute saison', 'OCHO Élégance', 250.00, 499.00, 5, TRUE),

-- Chaussures
('CHAUS-001', 'Baskets Sport Homme', 'Baskets confortables pour le sport', 5, 'Homme', 'Toute saison', 'OCHO Sport', 200.00, 399.00, 12, TRUE),
('CHAUS-002', 'Escarpins Femme', 'Escarpins élégants talon 7cm', 5, 'Femme', 'Toute saison', 'OCHO Élégance', 180.00, 359.00, 8, TRUE);

-- Insertion Variantes (Tailles et Couleurs)
INSERT INTO Variante (produit_id, taille, couleur, code_couleur, quantite) VALUES 
-- T-Shirt Col Rond Basique (TSH-001)
(1, 'S', 'Blanc', '#FFFFFF', 25),
(1, 'M', 'Blanc', '#FFFFFF', 30),
(1, 'L', 'Blanc', '#FFFFFF', 20),
(1, 'XL', 'Blanc', '#FFFFFF', 15),
(1, 'S', 'Noir', '#000000', 20),
(1, 'M', 'Noir', '#000000', 35),
(1, 'L', 'Noir', '#000000', 25),
(1, 'XL', 'Noir', '#000000', 18),
(1, 'M', 'Bleu Marine', '#000080', 22),
(1, 'L', 'Bleu Marine', '#000080', 18),

-- Polo Sport Premium (TSH-002)
(2, 'M', 'Blanc', '#FFFFFF', 12),
(2, 'L', 'Blanc', '#FFFFFF', 15),
(2, 'XL', 'Blanc', '#FFFFFF', 10),
(2, 'M', 'Noir', '#000000', 14),
(2, 'L', 'Noir', '#000000', 16),
(2, 'L', 'Rouge', '#FF0000', 8),

-- T-Shirt Femme Col V (TSH-003)
(3, 'S', 'Rose', '#FFC0CB', 18),
(3, 'M', 'Rose', '#FFC0CB', 25),
(3, 'L', 'Rose', '#FFC0CB', 15),
(3, 'S', 'Blanc', '#FFFFFF', 20),
(3, 'M', 'Blanc', '#FFFFFF', 28),
(3, 'M', 'Noir', '#000000', 22),

-- Jean Slim Fit Homme (JEN-001)
(4, '30', 'Bleu Brut', '#1E3A5F', 12),
(4, '32', 'Bleu Brut', '#1E3A5F', 18),
(4, '34', 'Bleu Brut', '#1E3A5F', 15),
(4, '36', 'Bleu Brut', '#1E3A5F', 10),
(4, '32', 'Noir', '#000000', 14),
(4, '34', 'Noir', '#000000', 12),

-- Jean Skinny Femme (JEN-002)
(5, '36', 'Bleu Clair', '#87CEEB', 15),
(5, '38', 'Bleu Clair', '#87CEEB', 20),
(5, '40', 'Bleu Clair', '#87CEEB', 12),
(5, '38', 'Noir', '#000000', 18),
(5, '40', 'Noir', '#000000', 14),

-- Jean Enfant Regular (JEN-003)
(6, '6A', 'Bleu', '#0000FF', 10),
(6, '8A', 'Bleu', '#0000FF', 15),
(6, '10A', 'Bleu', '#0000FF', 12),
(6, '12A', 'Bleu', '#0000FF', 10),

-- Veste en Jean Classique (VES-001)
(7, 'M', 'Bleu Délavé', '#6495ED', 8),
(7, 'L', 'Bleu Délavé', '#6495ED', 10),
(7, 'XL', 'Bleu Délavé', '#6495ED', 6),

-- Blouson Cuir Homme (VES-002)
(8, 'M', 'Noir', '#000000', 4),
(8, 'L', 'Noir', '#000000', 5),
(8, 'L', 'Marron', '#8B4513', 3),

-- Parka Hiver Femme (VES-003)
(9, 'S', 'Noir', '#000000', 5),
(9, 'M', 'Noir', '#000000', 8),
(9, 'L', 'Noir', '#000000', 6),
(9, 'M', 'Beige', '#F5F5DC', 7),

-- Robe d'Été Fleurie (ROB-001)
(10, 'S', 'Multicolore', '#FF69B4', 8),
(10, 'M', 'Multicolore', '#FF69B4', 12),
(10, 'L', 'Multicolore', '#FF69B4', 10),

-- Robe de Soirée Élégante (ROB-002)
(11, 'S', 'Noir', '#000000', 4),
(11, 'M', 'Noir', '#000000', 6),
(11, 'M', 'Rouge', '#FF0000', 5),

-- Baskets Sport Homme (CHAUS-001)
(12, '41', 'Blanc', '#FFFFFF', 10),
(12, '42', 'Blanc', '#FFFFFF', 15),
(12, '43', 'Blanc', '#FFFFFF', 12),
(12, '42', 'Noir', '#000000', 14),

-- Escarpins Femme (CHAUS-002)
(13, '37', 'Noir', '#000000', 8),
(13, '38', 'Noir', '#000000', 12),
(13, '39', 'Noir', '#000000', 10),
(13, '38', 'Beige', '#F5F5DC', 9);

-- Insertion Commandes exemples
INSERT INTO Commande (reference, client_id, utilisateur_id, date_commande, statut, total) VALUES 
('CMD-2026-001', 1, 3, '2026-01-01 10:30:00', 'Livrée', 0),
('CMD-2026-002', 2, 3, '2026-01-02 14:15:00', 'Validée', 0),
('CMD-2026-003', 3, 3, '2026-01-03 09:45:00', 'En cours', 0),
('CMD-2026-004', 1, 3, '2026-01-04 16:20:00', 'Créée', 0);

-- Insertion Lignes de Commande
INSERT INTO LigneCommande (commande_id, variante_id, produit_id, quantite, prix_unitaire) VALUES 
-- Commande 1
(1, 2, 1, 2, 89.00),  -- 2x T-shirt Blanc M
(1, 7, 1, 1, 89.00),  -- 1x T-shirt Noir L
(1, 24, 4, 1, 299.00), -- 1x Jean Slim 32

-- Commande 2
(2, 17, 3, 3, 99.00),  -- 3x T-shirt Femme Rose S
(2, 31, 5, 2, 279.00), -- 2x Jean Skinny 38 Bleu Clair

-- Commande 3
(3, 11, 2, 1, 149.00), -- 1x Polo Blanc M
(3, 45, 10, 2, 239.00), -- 2x Robe d'Été M

-- Commande 4
(4, 51, 12, 1, 399.00); -- 1x Baskets 42 Blanc

-- Insertion Mouvements de Stock initiaux (Approvisionnement)
INSERT INTO MouvementStock (variante_id, type, quantite, motif, utilisateur_id, quantite_avant, quantite_apres, notes) VALUES 
-- Approvisionnement initial T-shirts
(1, 'ENTRÉE', 25, 'Approvisionnement', 2, 0, 25, 'Stock initial'),
(2, 'ENTRÉE', 30, 'Approvisionnement', 2, 0, 30, 'Stock initial'),
(3, 'ENTRÉE', 20, 'Approvisionnement', 2, 0, 20, 'Stock initial'),

-- Ventes (Sorties)
(2, 'SORTIE', 2, 'Vente', 3, 30, 28, 'Commande CMD-2026-001'),
(7, 'SORTIE', 1, 'Vente', 3, 25, 24, 'Commande CMD-2026-001');

-- Insertion Logs Système
INSERT INTO LogsSysteme (utilisateur_id, action, table_concernee, enregistrement_id, details) VALUES 
(1, 'Création utilisateur', 'Utilisateur', 2, 'Création du compte Magasinier'),
(2, 'Création produit', 'Produit', 1, 'Ajout T-Shirt Col Rond Basique'),
(3, 'Création commande', 'Commande', 1, 'Nouvelle commande pour client Alami Mohammed');

-- ============================================
-- PROCÉDURES STOCKÉES UTILES
-- ============================================

-- Procédure: Obtenir le stock détaillé d'un produit
DELIMITER //
CREATE PROCEDURE sp_get_stock_produit(IN p_produit_id INT)
BEGIN
    SELECT 
        v.id,
        v.taille,
        v.couleur,
        v.quantite,
        p.nom as produit_nom,
        p.reference,
        p.seuil_min,
        CASE 
            WHEN v.quantite = 0 THEN 'Rupture'
            WHEN v.quantite <= p.seuil_min THEN 'Critique'
            ELSE 'Normal'
        END as statut
    FROM Variante v
    JOIN Produit p ON v.produit_id = p.id
    WHERE v.produit_id = p_produit_id
    ORDER BY v.taille, v.couleur;
END//
DELIMITER ;

-- Procédure: Obtenir les alertes actives
DELIMITER //
CREATE PROCEDURE sp_get_alertes_actives()
BEGIN
    SELECT 
        a.*,
        p.nom as produit_nom,
        p.reference,
        v.taille,
        v.couleur
    FROM Alerte a
    JOIN Variante v ON a.variante_id = v.id
    JOIN Produit p ON v.produit_id = p.id
    WHERE a.statut = 'Active'
    ORDER BY a.created_at DESC;
END//
DELIMITER ;

-- Procédure: Statistiques dashboard
DELIMITER //
CREATE PROCEDURE sp_dashboard_stats()
BEGIN
    -- Total produits actifs
    SELECT COUNT(*) as total_produits FROM Produit WHERE actif = TRUE;
    
    -- Total clients actifs
    SELECT COUNT(*) as total_clients FROM Client WHERE actif = TRUE;
    
    -- Valeur stock total
    SELECT SUM(p.prix_vente * v.quantite) as valeur_stock
    FROM Produit p
    JOIN Variante v ON p.id = v.produit_id
    WHERE p.actif = TRUE;
    
    -- Commandes du mois
    SELECT 
        COUNT(*) as commandes_mois,
        SUM(total) as ca_mois
    FROM Commande
    WHERE MONTH(date_commande) = MONTH(CURRENT_DATE())
    AND YEAR(date_commande) = YEAR(CURRENT_DATE());
    
    -- Alertes actives
    SELECT COUNT(*) as alertes_actives FROM Alerte WHERE statut = 'Active';
END//
DELIMITER ;

-- ============================================
-- FIN DU SCRIPT
-- ============================================

-- Afficher un message de succès
SELECT '✅ Base de données OCHO créée avec succès!' as Message;
SELECT '📊 Vérification des tables créées:' as Info;
SHOW TABLES;

-- Afficher quelques statistiques
SELECT 
    (SELECT COUNT(*) FROM Produit) as Total_Produits,
    (SELECT COUNT(*) FROM Variante) as Total_Variantes,
    (SELECT COUNT(*) FROM Client) as Total_Clients,
    (SELECT COUNT(*) FROM Commande) as Total_Commandes,
    (SELECT SUM(quantite) FROM Variante) as Stock_Total_Articles;
