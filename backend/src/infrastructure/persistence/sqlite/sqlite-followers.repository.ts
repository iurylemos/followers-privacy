import Database from 'better-sqlite3';
import type {
  FollowersRepository,
  FollowMutation,
  UnfollowMutation,
} from '../../../domain/repositories/followers.repository';

type FollowerCountRow = Readonly<{ follower_count: number }>;

export class SQLiteFollowersRepository implements FollowersRepository {
  private readonly insertStatement: Database.Statement<
    [creatorId: string, userId: string],
    Database.RunResult
  >;
  private readonly deleteStatement: Database.Statement<
    [creatorId: string, userId: string],
    Database.RunResult
  >;
  private readonly countStatement: Database.Statement<
    [creatorId: string],
    FollowerCountRow
  >;
  private readonly followTransaction: (
    creatorId: string,
    userId: string,
  ) => FollowMutation;
  private readonly unfollowTransaction: (
    creatorId: string,
    userId: string,
  ) => UnfollowMutation;

  constructor(private readonly database: Database.Database) {
    this.insertStatement = database.prepare<
      [creatorId: string, userId: string],
      Database.RunResult
    >(
      `INSERT INTO creator_followers (creator_id, user_id)
       VALUES (?, ?)
       ON CONFLICT (creator_id, user_id) DO NOTHING`,
    );
    this.deleteStatement = database.prepare<
      [creatorId: string, userId: string],
      Database.RunResult
    >(
      `DELETE FROM creator_followers
       WHERE creator_id = ? AND user_id = ?`,
    );
    this.countStatement = database.prepare<
      [creatorId: string],
      FollowerCountRow
    >(
      `SELECT COUNT(*) AS follower_count
       FROM creator_followers
       WHERE creator_id = ?`,
    );

    this.followTransaction = database.transaction((creatorId, userId) => {
      const insertion = this.insertStatement.run(creatorId, userId);
      const followerCount = this.readFollowerCount(creatorId);

      return {
        created: insertion.changes === 1,
        followerCount,
      };
    });
    this.unfollowTransaction = database.transaction((creatorId, userId) => {
      const deletion = this.deleteStatement.run(creatorId, userId);
      const followerCount = this.readFollowerCount(creatorId);

      return {
        removed: deletion.changes === 1,
        followerCount,
      };
    });
  }

  follow(creatorId: string, userId: string): FollowMutation {
    return this.followTransaction(creatorId, userId);
  }

  unfollow(creatorId: string, userId: string): UnfollowMutation {
    return this.unfollowTransaction(creatorId, userId);
  }

  private readFollowerCount(creatorId: string): number {
    const row = this.countStatement.get(creatorId);

    if (!row || !Number.isSafeInteger(row.follower_count) || row.follower_count < 0) {
      throw new Error('SQLite returned an invalid follower count.');
    }

    return row.follower_count;
  }
}
