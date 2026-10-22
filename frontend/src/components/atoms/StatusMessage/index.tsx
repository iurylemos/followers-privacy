import type { JSX } from "react";
import type { FollowersStatusKind } from "../../../interfaces/followers.interface";

type StatusMessageProps = {
  kind: FollowersStatusKind;
  message: string;
};

export default function StatusMessage({
  kind,
  message,
}: Readonly<StatusMessageProps>): JSX.Element {
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
