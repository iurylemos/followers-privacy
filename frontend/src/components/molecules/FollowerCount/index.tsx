import type { JSX } from "react";
import { FollowersUtil } from "../../../utils/followers.util";

type FollowerCountProps = {
  count: number;
};

export default function FollowerCount({
  count,
}: Readonly<FollowerCountProps>): JSX.Element {
  return (
    <p aria-atomic="true" aria-live="polite" className="follower-count">
      {FollowersUtil.formatFollowerCount(count)}
    </p>
  );
}
