import { useEffect, useRef, useState, type SubmitEvent } from "react";
import type {
  FollowersActions,
  FollowersStatusKind,
  FollowersResult,
} from "../interfaces/followers.interface";
import { FollowersUtil } from "../utils/followers.util";

const invalidApiResponseMessage = "A API retornou uma resposta inválida.";

function isFollowersResult(value: unknown): value is FollowersResult {
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

function isFollowerCount(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value >= 0
  );
}

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
  const countRequestVersion = useRef<number>(0);

  useEffect(() => {
    let cancelled = false;
    const requestVersion = countRequestVersion.current;

    void service
      .getFollowerCount(creatorId)
      .then((count) => {
        if (cancelled || countRequestVersion.current !== requestVersion) {
          return;
        }
        if (!isFollowerCount(count)) {
          throw new Error(invalidApiResponseMessage);
        }
        setFollowerCount(count);
      })
      .catch((error: unknown) => {
        if (cancelled || countRequestVersion.current !== requestVersion) {
          return;
        }
        setStatusKind("error");
        setStatusMessage(
          error instanceof Error && error.message.length > 0
            ? error.message
            : "Não foi possível consultar a quantidade de seguidores.",
        );
      });

    return () => {
      cancelled = true;
    };
  }, [creatorId, service]);

  useEffect(() => {
    if (!FollowersUtil.isValidUserId(userId)) {
      return;
    }

    let cancelled = false;

    void service
      .getFollowing(creatorId, userId)
      .then((isFollowing) => {
        if (cancelled) {
          return;
        }
        if (typeof isFollowing !== "boolean") {
          throw new Error(invalidApiResponseMessage);
        }
        setFollowing(isFollowing);
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }
        setStatusKind("error");
        setStatusMessage(
          error instanceof Error && error.message.length > 0
            ? error.message
            : "Não foi possível consultar o estado do seguimento.",
        );
      });

    return () => {
      cancelled = true;
    };
  }, [creatorId, service, userId]);

  const updateUserId = (value: string): void => {
    setUserId(value);
    setFollowing(false);
    setStatusMessage("");
    setStatusKind("idle");
  };

  const submit = async (event: SubmitEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if (isPending) {
      return;
    }
    if (!FollowersUtil.isValidUserId(userId)) {
      setStatusKind("error");
      setStatusMessage("Informe um identificador válido para continuar.");
      return;
    }

    setIsPending(true);
    setStatusKind("pending");
    setStatusMessage("Aguardando confirmação da API…");

    try {
      const result: FollowersResult = following
        ? await service.unfollow(creatorId, userId)
        : await service.follow(creatorId, userId);
      if (!isFollowersResult(result)) {
        throw new Error(invalidApiResponseMessage);
      }
      const expectedFollowing = !following;

      if (result.following !== expectedFollowing) {
        throw new Error("A API não confirmou o estado solicitado.");
      }

      countRequestVersion.current += 1;
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
