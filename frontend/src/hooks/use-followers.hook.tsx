import { useState, type SubmitEvent } from "react";
import type {
  FollowersActions,
  FollowersStatusKind,
  FollowersResult,
} from "../interfaces/followers.interface";

type FollowersState = Readonly<{
  userId: string;
  following: boolean;
  followerCount: number | null;
  isPending: boolean;
  statusMessage: string;
  statusKind: FollowersStatusKind;
  updateUserId: (value: string) => void;
  submit: (event: SubmitEvent<HTMLFormElement>) => Promise<void>;
}>;

export function useFollowers(
  service: FollowersActions,
  creatorId: string,
): FollowersState {
  const [userId, setUserId] = useState<string>("");
  const [following, setFollowing] = useState<boolean>(false);
  const [followerCount, setFollowerCount] = useState<number | null>(null);
  const [isPending, setIsPending] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [statusKind, setStatusKind] = useState<FollowersStatusKind>("idle");

  const updateUserId = (value: string): void => {
    setUserId(value);
    setFollowing(false);
    setFollowerCount(null);
    setStatusMessage("");
    setStatusKind("idle");
  };

  const submit = async (event: SubmitEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if (isPending) {
      return;
    }

    setIsPending(true);
    setStatusKind("pending");
    setStatusMessage("Aguardando confirmação da API…");

    try {
      const result: FollowersResult = following
        ? await service.unfollow(creatorId, userId)
        : await service.follow(creatorId, userId);
      const expectedFollowing = !following;

      if (result.following !== expectedFollowing) {
        throw new Error("A API não confirmou o estado solicitado.");
      }

      setFollowing(result.following);
      setFollowerCount(result.followerCount);
      setStatusKind("success");
      setStatusMessage(
        result.following
          ? "Agora você acompanha esta criadora."
          : "Você deixou de seguir a criadora.",
      );
    } catch (error: unknown) {
      setStatusKind("error");
      setStatusMessage(
        error instanceof Error && error.message.length > 0
          ? error.message
          : "Não foi possível concluir a operação. Tente novamente.",
      );
    } finally {
      setIsPending(false);
    }
  };

  return {
    userId,
    following,
    followerCount,
    isPending,
    statusMessage,
    statusKind,
    updateUserId,
    submit,
  };
}
