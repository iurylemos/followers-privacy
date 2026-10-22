import type { ChangeEvent, JSX } from "react";
import type { FollowersActions } from "../../../interfaces/followers.interface";
import { useFollowers } from "../../../hooks/use-followers.hook";
import { FollowersUtil } from "../../../utils/followers.util";
import UserIdInput from "../../atoms/UserIdInput";
import FollowButton from "../../atoms/FollowButton";
import StatusMessage from "../../atoms/StatusMessage";
import FollowerCount from "../../molecules/FollowerCount";

type FollowersTemplateProps = {
  creatorId: string;
  creatorName: string;
  service: FollowersActions;
};

export default function FollowersTemplate({
  creatorId,
  creatorName,
  service,
}: Readonly<FollowersTemplateProps>): JSX.Element {
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

  const handleUserIdChange = (event: ChangeEvent<HTMLInputElement>): void => {
    updateUserId(event.currentTarget.value);
  };

  return (
    <div className="page-shell">
      <header className="site-header">
        <a className="wordmark" href="/" aria-label="Página inicial">
          <span aria-hidden="true" className="wordmark__mark" />
          seguir
        </a>
        <p className="site-header__note">
          Um gesto simples, uma comunidade mais próxima.
        </p>
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
              .join("")
              .toLocaleUpperCase("pt-BR")}
          </div>
          <div className="creator-panel__identity">
            <p className="creator-panel__eyebrow">
              Um lugar para acompanhar de perto
            </p>
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
            <UserIdInput
              disabled={isPending}
              onChange={handleUserIdChange}
              value={userId}
            />
            <FollowButton
              following={following}
              isPending={isPending}
              userIdIsValid={FollowersUtil.isValidUserId(userId)}
            />
          </form>

          {followerCount !== null && <FollowerCount count={followerCount} />}

          <StatusMessage kind={statusKind} message={statusMessage} />

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
