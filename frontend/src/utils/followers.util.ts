export class FollowersUtil {
  public static isValidUserId(userId: string): boolean {
    return /^[A-Za-z0-9_-]{1,64}$/.test(userId);
  }

  public static formatFollowerCount(count: number): string {
    if (count === 0) {
      return "Nenhuma pessoa acompanha esta criadora.";
    }

    if (count === 1) {
      return "1 pessoa acompanha esta criadora.";
    }

    return `${count} pessoas acompanham esta criadora.`;
  }

  public static isFollowersResult(value: unknown): boolean {
    if (typeof value !== "object" || value === null) {
      return false;
    }

    return (
      "following" in value &&
      typeof value.following === "boolean" &&
      "followerCount" in value &&
      typeof value.followerCount === "number" &&
      Number.isSafeInteger(value.followerCount) &&
      value.followerCount >= 0
    );
  }

  public static isFollowerCount(value: unknown): value is number {
    return (
      typeof value === "number" && Number.isSafeInteger(value) && value >= 0
    );
  }
}
