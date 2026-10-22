import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';

const followersMigration = readFileSync(
  fileURLToPath(new URL('./migrations/001-create-followers.sql', import.meta.url)),
  'utf8',
);

export function initializeDatabase(database: Database.Database): void {
  const versionRow = database
    .prepare<[], { readonly user_version: number }>('PRAGMA user_version')
    .get();

  if (!versionRow || typeof versionRow.user_version !== 'number') {
    throw new Error('SQLite returned an invalid schema version.');
  }

  const currentVersion = versionRow.user_version;

  if (currentVersion > 1) {
    throw new Error(`Unsupported database schema version: ${currentVersion}.`);
  }

  if (currentVersion === 1) {
    return;
  }

  database.transaction(() => {
    database.exec(followersMigration);
    database.pragma('user_version = 1');
  })();
}

export function openDatabase(databasePath: string): Database.Database {
  if (databasePath !== ':memory:') {
    mkdirSync(dirname(resolve(databasePath)), { recursive: true });
  }

  const database = new Database(databasePath);

  try {
    initializeDatabase(database);
  } catch (error) {
    database.close();
    throw error;
  }

  return database;
}
