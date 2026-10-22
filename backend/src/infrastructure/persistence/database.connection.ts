import { mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import SqliteDatabase, { type Database } from "better-sqlite3";

export class DatabaseConnection {
  private readonly database: Database;

  private readonly followersMigration = readFileSync(
    fileURLToPath(
      new URL("./migrations/001-create-followers.sql", import.meta.url),
    ),
    "utf8",
  );

  constructor(databasePath: string) {
    if (databasePath !== ":memory:") {
      mkdirSync(dirname(resolve(databasePath)), { recursive: true });
    }

    this.database = new SqliteDatabase(databasePath);
  }

  public initializeDatabase(): void {
    const versionRow = this.database
      .prepare<[], { readonly user_version: number }>("PRAGMA user_version")
      .get();

    if (!versionRow || typeof versionRow.user_version !== "number") {
      throw new Error("SQLite returned an invalid schema version.");
    }

    const currentVersion = versionRow.user_version;

    if (currentVersion > 1) {
      throw new Error(
        `Unsupported database schema version: ${currentVersion}.`,
      );
    }

    if (currentVersion === 1) {
      return;
    }

    this.database.transaction(() => {
      this.database.exec(this.followersMigration);
      this.database.pragma("user_version = 1");
    })();
  }

  public getDatabase(): Database {
    try {
      this.initializeDatabase();
    } catch (error: unknown) {
      this.database.close();
      throw error;
    }

    return this.database;
  }
}
