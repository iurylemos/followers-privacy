import Database from "better-sqlite3";
import { afterEach, describe, expect, it } from "vitest";
import { SQLiteFollowersRepository } from "../../src/infrastructure/persistence/sqlite/sqlite-followers.repository";
import { DatabaseConnection } from "../../src/infrastructure/persistence/database.connection";

describe("SQLite database initialization", () => {
  const databases: Database.Database[] = [];

  function createDatabaseConnection(): DatabaseConnection {
    const databaseConnection = new DatabaseConnection(":memory:");
    const database = databaseConnection.getDatabase();
    databases.push(database);
    return databaseConnection;
  }

  afterEach(() => {
    for (const database of databases.splice(0)) {
      database.close();
    }
  });

  it("applies the versioned followers migration", () => {
    const databaseConnection = createDatabaseConnection();
    const database = databaseConnection.getDatabase();

    databaseConnection.initializeDatabase();

    expect(database.pragma("user_version")).toEqual([{ user_version: 1 }]);
    expect(
      database
        .prepare(
          "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'creator_followers'",
        )
        .get(),
    ).toEqual({ name: "creator_followers" });
  });

  it("can initialize the same database repeatedly", () => {
    const databaseConnection = createDatabaseConnection();

    expect(() => {
      databaseConnection.initializeDatabase();
      databaseConnection.initializeDatabase();
    }).not.toThrow();

    expect(databaseConnection.getDatabase().pragma("user_version")).toEqual([
      { user_version: 1 },
    ]);
  });

  it("keeps independent in-memory databases isolated", () => {
    const firstConnection = createDatabaseConnection();
    const secondConnection = createDatabaseConnection();
    const firstRepository = new SQLiteFollowersRepository(
      firstConnection.getDatabase(),
    );
    const secondRepository = new SQLiteFollowersRepository(
      secondConnection.getDatabase(),
    );

    expect(firstRepository.follow("creator-1", "reader-1")).toEqual({
      created: true,
      followerCount: 1,
    });
    expect(secondRepository.follow("creator-1", "reader-1")).toEqual({
      created: true,
      followerCount: 1,
    });
  });

  it("persists a unique relation and does not increment its count twice", () => {
    const databaseConnection = createDatabaseConnection();
    databaseConnection.initializeDatabase();
    const database = databaseConnection.getDatabase();
    const repository = new SQLiteFollowersRepository(database);

    expect(repository.follow("creator-1", "reader-1")).toEqual({
      created: true,
      followerCount: 1,
    });
    expect(repository.follow("creator-1", "reader-1")).toEqual({
      created: false,
      followerCount: 1,
    });
    expect(repository.follow("creator-1", "reader-2")).toEqual({
      created: true,
      followerCount: 2,
    });
  });

  it("removes only the requested relation and makes removal idempotent", () => {
    const databaseConnection = createDatabaseConnection();
    databaseConnection.initializeDatabase();
    const database = databaseConnection.getDatabase();
    const repository = new SQLiteFollowersRepository(database);
    repository.follow("creator-1", "reader-1");
    repository.follow("creator-1", "reader-2");

    expect(repository.unfollow("creator-1", "reader-1")).toEqual({
      removed: true,
      followerCount: 1,
    });
    expect(repository.unfollow("creator-1", "reader-1")).toEqual({
      removed: false,
      followerCount: 1,
    });
    expect(repository.unfollow("creator-1", "unknown")).toEqual({
      removed: false,
      followerCount: 1,
    });
  });

  it("keeps relations unique by creator and user pair", () => {
    const databaseConnection = createDatabaseConnection();
    databaseConnection.initializeDatabase();
    const database = databaseConnection.getDatabase();
    const repository = new SQLiteFollowersRepository(database);

    expect(repository.follow("creator-1", "reader-1").created).toBe(true);
    expect(repository.follow("creator-2", "reader-1").created).toBe(true);
    expect(repository.follow("creator-1", "reader-2").created).toBe(true);
    expect(repository.follow("creator-1", "reader-1").created).toBe(false);
  });

  it("queries persisted follower counts and follow state", () => {
    const databaseConnection = createDatabaseConnection();
    databaseConnection.initializeDatabase();
    const repository = new SQLiteFollowersRepository(
      databaseConnection.getDatabase(),
    );

    expect(repository.getFollowerCount("creator-1")).toBe(0);
    expect(repository.getFollowing("creator-1", "reader-1")).toBe(false);

    repository.follow("creator-1", "reader-1");

    expect(repository.getFollowerCount("creator-1")).toBe(1);
    expect(repository.getFollowing("creator-1", "reader-1")).toBe(true);
    expect(repository.getFollowing("creator-1", "reader-2")).toBe(false);
    expect(repository.getFollowerCount("creator-2")).toBe(0);
  });
});
