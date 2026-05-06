import { useAuth } from "react-oidc-context";
import { LoginButton } from "~/root";
import { useNavigate } from "react-router";

export function LoginPage() {
  const auth = useAuth();

  return (
    <div>
      <h1>Sign in required</h1>
      <LoginButton />
    </div>
  );
}