import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useLoaderData,
  redirect,
} from "react-router";
import { useEffect, useMemo, useRef } from "react";

import type { Route } from "./+types/root";
import type { 
  LinksFunction,
  LoaderFunctionArgs,
  ActionFunctionArgs,
} from "react-router";
import { AuthProvider, useAuth } from "react-oidc-context";

import "./app.css";
import "./SRC_colours.css";

import { getPublicRuntimeConfig } from "./config/runtime.server";


// Externally defined stuff
export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const publicRuntimeConfig = getPublicRuntimeConfig();
  return { publicRuntimeConfig };
}

// log in function
export function LoginButton() {
  const auth = useAuth();

  return (
    <button
      onClick={() => auth.signinRedirect()}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
    >
      Log in
    </button>
  );
}

// log out function
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

// Component to ensure user is authenticated before rendering children
function RequiredAuth({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const location = useLocation();
  const isAuthCallbackRoute = location.pathname.endsWith("/auth/callback");
  const redirectStartedRef = useRef(false);
  console.log("Auth state:", auth);

  useEffect(() => {
    if (
      !redirectStartedRef.current &&
      !isAuthCallbackRoute &&
      !auth.isLoading &&
      !auth.isAuthenticated &&
      !auth.error
    ) {
      redirectStartedRef.current = true;
      void auth.signinRedirect();
    }
  }, [isAuthCallbackRoute, auth.isLoading, auth.isAuthenticated, auth.error, auth.signinRedirect]);

  useEffect(() => {
    if (isAuthCallbackRoute || auth.isAuthenticated || auth.error) {
      redirectStartedRef.current = false;
    }
  }, [isAuthCallbackRoute, auth.isAuthenticated, auth.error]);

  if (isAuthCallbackRoute) {
    return <>{children}</>;
  }

  if (auth.isLoading) {
    return (<div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">Welcome to the e-Merlin Data Archive</h1>
        <p className="mb-6">Please wait while we authenticate you...</p>
      </div>
    </div> //add background image and styling to the login page
    );
  }

  if (auth.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded shadow-md text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication error</h1>
          <p className="mb-6">Please try logging in again.</p>
          <LoginButton />
        </div>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return (
      <p>redirecting for log in process...</p> // or a loading spinner while redirecting
    );
  }

  return <>{children}</>;
}

// Main App component
export default function App() {

  const { publicRuntimeConfig } = useLoaderData<typeof loader>();
  // Define the OIDC configuration for authentication
  const oidcConfig = useMemo(() => {
    const serviceHostUrl = publicRuntimeConfig.SERVICE_HOST.replace(/\/+$/, "");
    const postLogoutRedirectUri = serviceHostUrl ? `${serviceHostUrl}/archive-gui` : "";

    return {    
      authority: publicRuntimeConfig.OIDC_SERVER_URL,
      client_id: publicRuntimeConfig.OIDC_CLIENT_ID,
      redirect_uri: publicRuntimeConfig.OIDC_AUTH_CALLBACK,
      post_logout_redirect_uri: postLogoutRedirectUri,
      response_type: "code",
      scope: "openid profile email",
      automaticSilentRenew: true,
      loadUserInfo: true,
      onSigninCallback: () => {
        // Clear OIDC query params from the callback URL without changing route here.
        window.history.replaceState({}, document.title, window.location.pathname);
      },
    };
  }, [publicRuntimeConfig]);
   
  return (
    <AuthProvider {...oidcConfig}>
      <RequiredAuth>
        <Outlet />
      </RequiredAuth>
   </AuthProvider>
  );
}

// Error boundary component to handle errors in the app
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oh Man!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
