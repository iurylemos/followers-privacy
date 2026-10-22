import type { ChangeEvent } from 'react';
import type { FollowersActions } from '../../services/followers.service';
import { useFollowers } from '../../hooks/use-followers';

export type FollowersPageProps = Readonly<{
  creatorId: string;
  creatorName: string;
  service: FollowersActions;
}>;

function formatFollowerCount(count: number): string {
  if (count === 0) {
    return 'Nenhuma pessoa acompanha esta criadora.';
  }

  if (count === 1) {
    return '1 pessoa acompanha esta criadora.';
  }

  return `${count} pessoas acompanham esta criadora.`;
}

export function FollowersPage({
  creatorId,
  creatorName,
  service,
}: FollowersPageProps) {
  const {
    userId,
    following,
    followerCount,
    isPending,
    statusMessage,
    statusKind,
    updateUserId,
    submit,
  } = useFollowers(service, creatorId);

  function handleUserIdChange(event: ChangeEvent<HTMLInputElement>): void {
    updateUserId(event.currentTarget.value);
  }

  return (
    <div className="page-shell">
      <header className="site-header">
        <a className="wordmark" href="/" aria-label="Página inicial">
          <span aria-hidden="true" className="wordmark__mark" />
          seguir
        </a>
        <p className="site-header__note">Um gesto simples, uma comunidade mais próxima.</p>
      </header>

      <main className="follow-layout">
        <section className="creator-panel" aria-labelledby="creator-heading">
          <div className="creator-panel__orbit" aria-hidden="true">
            <span />
          </div>
          <p className="creator-panel__context">Criadora em destaque</p>
          <div className="creator-monogram" aria-hidden="true">
            {creatorName
              .split(/\s+/)
              .slice(0, 2)
              .map((word) => word.charAt(0))
              .join('')
              .toLocaleUpperCase('pt-BR')}
          </div>
          <div className="creator-panel__identity">
            <p className="creator-panel__eyebrow">Um lugar para acompanhar de perto</p>
            <h1 id="creator-heading">{creatorName}</h1>
            <p className="creator-panel__description">
              Ideias, histórias e inspiração — mais perto de quem acompanha.
            </p>
          </div>
        </section>

        <section className="action-panel" aria-labelledby="action-heading">
          <div>
            <p className="action-panel__eyebrow">Sua comunidade</p>
            <h2 id="action-heading">Quer acompanhar?</h2>
            <p className="action-panel__intro">
              Escolha um identificador para demonstrar a ação.
            </p>
          </div>

          <form className="follow-form" onSubmit={submit}>
            <label htmlFor="user-id">Seu identificador</label>
            <input
              autoComplete="off"
              disabled={isPending}
              id="user-id"
              maxLength={64}
              name="userId"
              onChange={handleUserIdChange}
              pattern="[A-Za-z0-9_-]{1,64}"
              placeholder="por exemplo, reader-42"
              required
              value={userId}
            />
            <p className="input-hint">Use letras, números, hífen ou sublinhado.</p>

            <button
              aria-busy={isPending}
              className="follow-button"
              disabled={isPending || userId.length === 0}
              type="submit"
            >
              {isPending ? 'Salvando…' : following ? 'Deixar de seguir' : 'Seguir'}
            </button>
          </form>

          {followerCount !== null && (
            <p className="follower-count">{formatFollowerCount(followerCount)}</p>
          )}

          <p
            aria-live="polite"
            className={`status-message status-message--${statusKind}`}
            role="status"
          >
            {statusMessage}
          </p>

          <p className="privacy-note">
            Este identificador é demonstrativo; não confirma sua identidade.
          </p>
        </section>
      </main>

      <footer className="page-footer">
        <span>Feito para acompanhar, não para identificar.</span>
      </footer>
    </div>
  );
}
