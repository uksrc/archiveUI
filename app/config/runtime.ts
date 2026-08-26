// This file is used to define the runtime configuration for the application.
// It reads environment variables and exports them in a structured format.
// This allows the application to access configuration values at runtime.
export type RuntimeConfig = {
    SERVICE_HOST: string;
    OIDC_SERVER_URL: string;
    OIDC_CLIENT_ID: string; 
    OIDC_AUTH_CALLBACK: string;
};

export const PUBLIC_RUNTIME_KEYS = [
    "SERVICE_HOST",
    "OIDC_SERVER_URL",
    "OIDC_CLIENT_ID",
    "OIDC_AUTH_CALLBACK",
] as const;

export type PublicRuntimeKey = (typeof PUBLIC_RUNTIME_KEYS)[number];
export type PublicRuntimeConfig = Pick<RuntimeConfig, PublicRuntimeKey>;