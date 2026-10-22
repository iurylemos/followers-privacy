import type { JSX } from "react";
import type { FollowersStatusKind } from "../../../interfaces/followers.interface";

type StatusMessageProps = Readonly<{
  kind: FollowersStatusKind;
  message: string;
}>;

export function StatusMessage({
  kind,
  message,
}: StatusMessageProps): JSX.Element {
  const isError = kind === "error";

  return (
    <p
      aria-atomic="true"
      aria-busy={kind === "pending"}
      aria-live={isError ? "assertive" : "polite"}
      className={`status-message status-message--${kind}`}
      role={isError ? "alert" : "status"}
    >
      {message}
    </p>
  );
}
