import type { ChangeEventHandler, JSX } from "react";
import { FollowersUtil } from "../../../utils/followers.util";

type UserIdInputProps = {
  disabled?: boolean;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
};

export default function UserIdInput({
  disabled = false,
  value,
  onChange,
}: Readonly<UserIdInputProps>): JSX.Element {
  const isInvalid = value.length > 0 && !FollowersUtil.isValidUserId(value);

  return (
    <>
      <label htmlFor="user-id">Seu identificador</label>
      <input
        aria-describedby="user-id-hint"
        aria-invalid={isInvalid || undefined}
        autoComplete="off"
        disabled={disabled}
        id="user-id"
        maxLength={64}
        name="userId"
        onChange={onChange}
        pattern="(?:[A-Za-z0-9_]|-){1,64}"
        placeholder="por exemplo, reader-42"
        required
        value={value}
      />
      <p className="input-hint" id="user-id-hint">
        Use de 1 a 64 letras, números, hífen ou sublinhado.
      </p>
    </>
  );
}
