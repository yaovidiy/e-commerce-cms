import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../../local.db');
const db = new Database(dbPath);

console.log('Creating FTS5 virtual table for product search...');

try {
	// Create FTS5 virtual table
	db.exec(`
		CREATE VIRTUAL TABLE IF NOT EXISTS product_fts USING fts5(
			id UNINDEXED,
			name,
			description,
			sku,
			content='product',
			content_rowid='rowid'
		);
	`);

	console.log('✓ Created product_fts virtual table');

	// Create triggers to keep FTS table in sync
	db.exec(`
		CREATE TRIGGER IF NOT EXISTS product_fts_insert AFTER INSERT ON product BEGIN
			INSERT INTO product_fts(rowid, id, name, description, sku) 
			VALUES (new.rowid, new.id, new.name, COALESCE(new.description, ''), COALESCE(new.sku, ''));
		END;
	`);

	console.log('✓ Created insert trigger');

	db.exec(`
		CREATE TRIGGER IF NOT EXISTS product_fts_delete AFTER DELETE ON product BEGIN
			INSERT INTO product_fts(product_fts, rowid, id, name, description, sku) 
			VALUES('delete', old.rowid, old.id, old.name, COALESCE(old.description, ''), COALESCE(old.sku, ''));
		END;
	`);

	console.log('✓ Created delete trigger');

	db.exec(`
		CREATE TRIGGER IF NOT EXISTS product_fts_update AFTER UPDATE ON product BEGIN
			INSERT INTO product_fts(product_fts, rowid, id, name, description, sku) 
			VALUES('delete', old.rowid, old.id, old.name, COALESCE(old.description, ''), COALESCE(old.sku, ''));
			INSERT INTO product_fts(rowid, id, name, description, sku) 
			VALUES (new.rowid, new.id, new.name, COALESCE(new.description, ''), COALESCE(new.sku, ''));
		END;
	`);

	console.log('✓ Created update trigger');

	// Populate FTS table with existing products
	db.exec(`
		INSERT INTO product_fts(rowid, id, name, description, sku)
		SELECT rowid, id, name, COALESCE(description, ''), COALESCE(sku, '')
		FROM product;
	`);

	console.log('✓ Populated FTS table with existing products');

	console.log('\n✅ FTS5 setup complete!');
} catch (error) {
	console.error('❌ Error setting up FTS5:', error);
	process.exit(1);
} finally {
	db.close();
}
