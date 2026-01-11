-- Add stock column to Produit table
ALTER TABLE Produit ADD COLUMN stock INT DEFAULT 0;
CREATE INDEX idx_produit_stock ON Produit(stock);
