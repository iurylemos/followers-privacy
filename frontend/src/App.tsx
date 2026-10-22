import type { JSX } from "react";
import { FollowersService } from "./services/followers.service";
import FollowersTemplate from "./components/templates/Followers";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
const creatorId = import.meta.env.VITE_CREATOR_ID || "creator-1";
const creatorName = import.meta.env.VITE_CREATOR_NAME || "Criadora em destaque";
const followersService = new FollowersService(apiUrl);

export default function App(): JSX.Element {
  return (
    <FollowersTemplate
      creatorId={creatorId}
      creatorName={creatorName}
      service={followersService}
    />
  );
}
