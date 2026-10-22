interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_CREATOR_ID?: string;
  readonly VITE_CREATOR_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
