import type { JSX, MouseEventHandler } from "react";

type FollowButtonProps = Readonly<{
  following: boolean;
  isPending: boolean;
  userIdIsValid: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}>;

export function FollowButton({
  following,
  isPending,
  userIdIsValid,
  onClick,
}: FollowButtonProps): JSX.Element {
  return (
    <button
      aria-busy={isPending}
      className="follow-button"
      disabled={isPending || !userIdIsValid}
      onClick={onClick}
      type="submit"
    >
      {isPending ? "Salvando…" : following ? "Deixar de seguir" : "Seguir"}
    </button>
  );
}
