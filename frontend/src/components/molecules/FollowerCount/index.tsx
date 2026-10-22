import type { JSX } from "react";
import { FollowersUtil } from "../../../utils/followers.util";

type FollowerCountProps = Readonly<{
  count: number;
}>;

export function FollowerCount({ count }: FollowerCountProps): JSX.Element {
  return (
    <p aria-atomic="true" aria-live="polite" className="follower-count">
      {FollowersUtil.formatFollowerCount(count)}
    </p>
  );
}
