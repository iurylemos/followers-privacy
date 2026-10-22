import { useState, type FormEvent } from 'react';
import type {
  FollowResult,
  FollowersActions,
} from '../services/followers.service';

export function useFollowers(
  service: FollowersActions,
  creatorId: string,
) {
  const [userId, setUserId] = useState('');
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState<number | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusKind, setStatusKind] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');

  function updateUserId(value: string): void {
    setUserId(value);
    setFollowing(false);
    setFollowerCount(null);
    setStatusMessage('');
    setStatusKind('idle');
  }

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (isPending) {
      return;
    }

    setIsPending(true);
    setStatusKind('pending');
    setStatusMessage('Aguardando confirmação da API…');

    try {
      const result: FollowResult = following
        ? await service.unfollow(creatorId, userId)
        : await service.follow(creatorId, userId);
      const expectedFollowing = !following;

      if (result.following !== expectedFollowing) {
        throw new Error('A API não confirmou o estado solicitado.');
      }

      setFollowing(result.following);
      setFollowerCount(result.followerCount);
      setStatusKind('success');
      setStatusMessage(
        result.following
          ? 'Agora você acompanha esta criadora.'
          : 'Você deixou de seguir a criadora.',
      );
    } catch (error: unknown) {
      setStatusKind('error');
      setStatusMessage(
        error instanceof Error && error.message.length > 0
          ? error.message
          : 'Não foi possível concluir a operação. Tente novamente.',
      );
    } finally {
      setIsPending(false);
    }
  }

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
