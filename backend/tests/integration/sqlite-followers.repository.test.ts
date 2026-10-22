import Database from 'better-sqlite3';
import { afterEach, describe, expect, it } from 'vitest';
import { initializeDatabase } from '../../src/infrastructure/persistence/database.connection';
import { SQLiteFollowersRepository } from '../../src/infrastructure/persistence/sqlite/sqlite-followers.repository';

describe('SQLite database initialization', () => {
  const databases: Database.Database[] = [];

  function createDatabase(): Database.Database {
    const database = new Database(':memory:');
    databases.push(database);
    return database;
  }

  afterEach(() => {
    for (const database of databases.splice(0)) {
      database.close();
    }
  });

  it('applies the versioned followers migration', () => {
    const database = createDatabase();

    initializeDatabase(database);

    expect(database.pragma('user_version')).toEqual([{ user_version: 1 }]);
    expect(database.prepare(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'creator_followers'",
    ).get()).toEqual({ name: 'creator_followers' });
  });

  it('can initialize the same database repeatedly', () => {
    const database = createDatabase();

    expect(() => {
      initializeDatabase(database);
      initializeDatabase(database);
    }).not.toThrow();

    expect(database.pragma('user_version')).toEqual([{ user_version: 1 }]);
  });

  it('keeps independent in-memory databases isolated', () => {
    const first = createDatabase();
    const second = createDatabase();

    initializeDatabase(first);

    expect(first.prepare(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'creator_followers'",
    ).get()).toEqual({ name: 'creator_followers' });
    expect(second.prepare(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'creator_followers'",
    ).get()).toBeUndefined();
  });

  it('persists a unique relation and does not increment its count twice', () => {
    const database = createDatabase();
    initializeDatabase(database);
    const repository = new SQLiteFollowersRepository(database);

    expect(repository.follow('creator-1', 'reader-1')).toEqual({
      created: true,
      followerCount: 1,
    });
    expect(repository.follow('creator-1', 'reader-1')).toEqual({
      created: false,
      followerCount: 1,
    });
    expect(repository.follow('creator-1', 'reader-2')).toEqual({
      created: true,
      followerCount: 2,
    });
  });

  it('removes only the requested relation and makes removal idempotent', () => {
    const database = createDatabase();
    initializeDatabase(database);
    const repository = new SQLiteFollowersRepository(database);
    repository.follow('creator-1', 'reader-1');
    repository.follow('creator-1', 'reader-2');

    expect(repository.unfollow('creator-1', 'reader-1')).toEqual({
      removed: true,
      followerCount: 1,
    });
    expect(repository.unfollow('creator-1', 'reader-1')).toEqual({
      removed: false,
      followerCount: 1,
    });
    expect(repository.unfollow('creator-1', 'unknown')).toEqual({
      removed: false,
      followerCount: 1,
    });
  });

  it('keeps relations unique by creator and user pair', () => {
    const database = createDatabase();
    initializeDatabase(database);
    const repository = new SQLiteFollowersRepository(database);

    expect(repository.follow('creator-1', 'reader-1').created).toBe(true);
    expect(repository.follow('creator-2', 'reader-1').created).toBe(true);
    expect(repository.follow('creator-1', 'reader-2').created).toBe(true);
    expect(repository.follow('creator-1', 'reader-1').created).toBe(false);
  });
});
