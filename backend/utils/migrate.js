import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { sequelize } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDirectory = path.join(__dirname, '..', 'migrations');

export async function runMigrations() {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name VARCHAR(255) NOT NULL PRIMARY KEY,
      executedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const [appliedRows] = await sequelize.query(
    'SELECT name FROM schema_migrations ORDER BY name'
  );
  const applied = new Set(appliedRows.map((row) => row.name));
  const files = (await fs.readdir(migrationsDirectory))
    .filter((file) => file.endsWith('.js'))
    .sort();

  for (const file of files) {
    const migration = await import(path.join(migrationsDirectory, file));
    const name = migration.name || file.replace(/\.js$/, '');

    if (applied.has(name)) continue;

    const transaction = await sequelize.transaction();
    try {
      await migration.up({ sequelize, transaction });
      await sequelize.query(
        'INSERT INTO schema_migrations (name) VALUES (?)',
        { replacements: [name], transaction }
      );
      await transaction.commit();
      console.log(`Migration applied: ${name}`);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
