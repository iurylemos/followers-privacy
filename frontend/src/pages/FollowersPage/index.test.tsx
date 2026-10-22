import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type {
  FollowResult,
  FollowersActions,
} from '../../services/followers.service';
import { FollowersPage } from './index';

function deferred<Value>() {
  let resolve!: (value: Value) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<Value>((fulfill, fail) => {
    resolve = fulfill;
    reject = fail;
  });

  return { promise, resolve, reject };
}

function createService(
  follow: () => Promise<FollowResult>,
  unfollow: () => Promise<FollowResult>,
): FollowersActions {
  return {
    follow: vi.fn(follow),
    unfollow: vi.fn(unfollow),
  };
}

describe('FollowersPage', () => {
  it('changes follow state only after the API confirms each operation', async () => {
    const user = userEvent.setup();
    const followRequest = deferred<FollowResult>();
    const unfollowRequest = deferred<FollowResult>();
    const service = createService(
      () => followRequest.promise,
      () => unfollowRequest.promise,
    );

    render(
      <FollowersPage
        creatorId="creator-1"
        creatorName="Criadora em destaque"
        service={service}
      />,
    );

    await user.type(screen.getByRole('textbox', { name: 'Seu identificador' }), 'reader-1');
    await user.click(screen.getByRole('button', { name: 'Seguir' }));

    expect(await screen.findByRole('button', { name: 'Salvando…' })).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('Aguardando confirmação');
    expect(screen.queryByText('1 pessoa acompanha esta criadora.')).not.toBeInTheDocument();

    followRequest.resolve({ following: true, followerCount: 1 });

    expect(await screen.findByRole('button', { name: 'Deixar de seguir' })).toBeEnabled();
    expect(screen.getByText('1 pessoa acompanha esta criadora.')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Agora você acompanha esta criadora.');

    await user.click(screen.getByRole('button', { name: 'Deixar de seguir' }));

    expect(await screen.findByRole('button', { name: 'Salvando…' })).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('Aguardando confirmação');
    expect(screen.queryByText('Você deixou de seguir a criadora.')).not.toBeInTheDocument();

    unfollowRequest.resolve({ following: false, followerCount: 0 });

    expect(await screen.findByRole('button', { name: 'Seguir' })).toBeEnabled();
    expect(screen.getByText('Nenhuma pessoa acompanha esta criadora.')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Você deixou de seguir a criadora.');
  });

  it('keeps the unconfirmed state and shows an API error', async () => {
    const user = userEvent.setup();
    const service = createService(
      () => Promise.reject(new Error('A API está indisponível.')),
      () => Promise.resolve({ following: false, followerCount: 0 }),
    );

    render(
      <FollowersPage
        creatorId="creator-1"
        creatorName="Criadora em destaque"
        service={service}
      />,
    );

    await user.type(screen.getByRole('textbox', { name: 'Seu identificador' }), 'reader-1');
    await user.click(screen.getByRole('button', { name: 'Seguir' }));

    expect(await screen.findByRole('status')).toHaveTextContent('A API está indisponível.');
    expect(screen.getByRole('button', { name: 'Seguir' })).toBeEnabled();
    expect(screen.queryByText(/acompanha esta criadora\./)).not.toBeInTheDocument();
  });
});
