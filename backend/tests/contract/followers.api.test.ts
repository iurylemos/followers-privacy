import Database from "better-sqlite3";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../src/app";
import { FollowersService } from "../../src/application/services/followers.service";
import { DatabaseConnection } from "../../src/infrastructure/persistence/database.connection";
import { SQLiteFollowersRepository } from "../../src/infrastructure/persistence/sqlite/sqlite-followers.repository";

describe("followers HTTP contract", () => {
  let database: Database.Database;
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    const databaseConnection = new DatabaseConnection(":memory:");
    database = databaseConnection.getDatabase();
    app = createApp({
      followersService: new FollowersService(
        new SQLiteFollowersRepository(database),
        "creator-1",
      ),
      creatorId: "creator-1",
      allowedOrigin: "http://localhost:5173",
    });
  });

  afterEach(() => {
    database.close();
  });

  it("creates once and returns a stable result for repeated follow requests", async () => {
    const firstResponse = await request(app)
      .post("/creators/creator-1/followers")
      .send({ userId: "reader-1" });

    expect(firstResponse.status).toBe(201);
    expect(firstResponse.body).toEqual({
      following: true,
      followerCount: 1,
    });

    const repeatedResponse = await request(app)
      .post("/creators/creator-1/followers")
      .send({ userId: "reader-1" });

    expect(repeatedResponse.status).toBe(200);
    expect(repeatedResponse.body).toEqual({
      following: true,
      followerCount: 1,
    });
  });

  it("removes a relation idempotently and returns the final state", async () => {
    await request(app)
      .post("/creators/creator-1/followers")
      .send({ userId: "reader-1" });

    const firstResponse = await request(app).delete(
      "/creators/creator-1/followers/reader-1",
    );

    expect(firstResponse.status).toBe(200);
    expect(firstResponse.body).toEqual({
      following: false,
      followerCount: 0,
    });

    const repeatedResponse = await request(app).delete(
      "/creators/creator-1/followers/reader-1",
    );

    expect(repeatedResponse.status).toBe(200);
    expect(repeatedResponse.body).toEqual({
      following: false,
      followerCount: 0,
    });
  });

  it("rejects invalid IDs without changing a relation", async () => {
    const invalidResponse = await request(app)
      .post("/creators/creator-1/followers")
      .send({ userId: "not a valid id" });

    expect(invalidResponse.status).toBe(400);
    expect(invalidResponse.body).toMatchObject({
      code: "INVALID_REQUEST",
    });

    const validResponse = await request(app)
      .post("/creators/creator-1/followers")
      .send({ userId: "reader-1" });

    expect(validResponse.body.followerCount).toBe(1);
  });

  it("returns zero and the persisted follower count", async () => {
    const emptyResponse = await request(app).get(
      "/creators/creator-1/followers/count",
    );

    expect(emptyResponse.status).toBe(200);
    expect(emptyResponse.body).toEqual({
      creatorId: "creator-1",
      count: 0,
    });

    await request(app)
      .post("/creators/creator-1/followers")
      .send({ userId: "reader-1" });
    await request(app)
      .post("/creators/creator-1/followers")
      .send({ userId: "reader-2" });

    const populatedResponse = await request(app).get(
      "/creators/creator-1/followers/count",
    );

    expect(populatedResponse.status).toBe(200);
    expect(populatedResponse.body).toEqual({
      creatorId: "creator-1",
      count: 2,
    });
  });

  it("returns the persisted follow state for a user", async () => {
    const absentResponse = await request(app).get(
      "/creators/creator-1/followers/reader-1",
    );

    expect(absentResponse.status).toBe(200);
    expect(absentResponse.body).toEqual({ following: false });

    await request(app)
      .post("/creators/creator-1/followers")
      .send({ userId: "reader-1" });

    const followingResponse = await request(app).get(
      "/creators/creator-1/followers/reader-1",
    );

    expect(followingResponse.status).toBe(200);
    expect(followingResponse.body).toEqual({ following: true });
  });

  it("rejects invalid IDs for follower queries", async () => {
    const invalidCreatorResponse = await request(app).get(
      "/creators/creator!/followers/count",
    );
    const invalidUserResponse = await request(app).get(
      "/creators/creator-1/followers/invalid%20user",
    );

    expect(invalidCreatorResponse.status).toBe(400);
    expect(invalidCreatorResponse.body).toMatchObject({
      code: "INVALID_REQUEST",
    });
    expect(invalidUserResponse.status).toBe(400);
    expect(invalidUserResponse.body).toMatchObject({
      code: "INVALID_REQUEST",
    });
  });

  it("rejects malformed JSON with a client error", async () => {
    const response = await request(app)
      .post("/creators/creator-1/followers")
      .set("Content-Type", "application/json")
      .send('{"userId":');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      code: "INVALID_REQUEST",
      message: "The request body must contain valid JSON.",
    });
  });

  it("returns not found for an unconfigured creator", async () => {
    const response = await request(app)
      .post("/creators/creator-2/followers")
      .send({ userId: "reader-1" });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      code: "CREATOR_NOT_FOUND",
      message: "The requested creator is not configured.",
    });
  });

  it("allows the configured frontend origin", async () => {
    const response = await request(app)
      .post("/creators/creator-1/followers")
      .set("Origin", "http://localhost:5173")
      .send({ userId: "reader-1" });

    expect(response.headers["access-control-allow-origin"]).toBe(
      "http://localhost:5173",
    );
  });
});
