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
}
