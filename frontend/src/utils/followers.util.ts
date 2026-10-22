export class FollowersUtil {
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
