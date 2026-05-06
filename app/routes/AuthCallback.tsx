import { useAuth } from "react-oidc-context";
import { useEffect } from "react";

// This component handles the OIDC callback after authentication. It checks the authentication state and redirects the user accordingly.
export default function AuthCallback() {
  console.log("Auth function called");
  const auth = useAuth();
  console.log("Auth callback component rendered: ", auth);

  useEffect(() => {
    if (auth.isLoading) return;

    if (auth.error) {
      console.error("OIDC callbackerror:", auth.error);
      return;
    }

    if (auth.isAuthenticated) {
      // Redirect to the main page after successful authentication. The OIDC query params should have been cleared in the onSigninCallback handler.
      // forces refresh to ensure that the app state is fully updated after login, which can help prevent issues with stale state or missing user info. We can also consider using a more React-friendly approach to handle post-login redirection, such as using a state variable to trigger a redirect within the component, rather than relying on a full page reload. This would allow us to maintain the benefits of client-side routing and avoid unnecessary reloads, while still ensuring that the app state is properly updated after authentication.
      window.location.replace("/archive-gui/");
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.error]);

  return (
  
  <p>Signing you in; standby...</p>

  );
}