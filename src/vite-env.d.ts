/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AUTH_MODE?: string;
  readonly VITE_OKTA_ISSUER?: string;
  readonly VITE_OKTA_CLIENT_ID?: string;
  readonly VITE_OKTA_REDIRECT_URI?: string;
  readonly VITE_OKTA_SCOPES?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
