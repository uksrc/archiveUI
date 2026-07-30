type RuntimeEnvMap = Record<string, string | undefined>;

declare global {
  interface Window {
    __APP_ENV__?: RuntimeEnvMap;
  }
}

function getRuntimeEnv(): RuntimeEnvMap | undefined {
  if (typeof window !== "undefined" && window.__APP_ENV__) {
    return window.__APP_ENV__;
  }

  const globalWithEnv = globalThis as typeof globalThis & {
    __APP_ENV__?: RuntimeEnvMap;
  };

  return globalWithEnv.__APP_ENV__;
}

export function getEnvVar(name: string, fallback = ""): string {
  const runtimeEnv = getRuntimeEnv();
  if (runtimeEnv?.[name]) {
    return runtimeEnv[name]!;
  }

  const processEnv = typeof process !== "undefined" ? process.env : undefined;
  if (processEnv?.[name]) {
    return processEnv[name]!;
  }

  const viteEnv = (import.meta as ImportMeta & { env?: Record<string, string | boolean | undefined> }).env;
  const viteValue = viteEnv?.[name];
  if (viteValue !== undefined && viteValue !== "") {
    return String(viteValue);
  }

  return fallback;
}
