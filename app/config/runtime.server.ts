import type { RuntimeConfig, PublicRuntimeConfig } from "./runtime";
import { PUBLIC_RUNTIME_KEYS } from "./runtime";

// Helper function to read an environment variable and throw an error if it's missing.
function requiredEnvVar(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
};

// Export the runtime configuration object, populated with values from environment variables.
export function getRuntimeConfig(): RuntimeConfig { 
    return { 
    SERVICE_HOST: requiredEnvVar("SERVICE_HOST"),
    OIDC_SERVER_URL: requiredEnvVar("OIDC_SERVER_URL"),
    OIDC_CLIENT_ID: requiredEnvVar("OIDC_CLIENT_ID"),
    OIDC_AUTH_CALLBACK: requiredEnvVar("OIDC_AUTH_CALLBACK")
    }
};

// Export a function to get the public runtime configuration, which can be used in the client-side code.
export function getPublicRuntimeConfig(): PublicRuntimeConfig {
    const config = getRuntimeConfig();
    return PUBLIC_RUNTIME_KEYS.reduce((acc, key) => {
        acc[key] = config[key];
        return acc;
    }, {} as PublicRuntimeConfig);
};