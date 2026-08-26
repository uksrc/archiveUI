import type { Route } from "./+types/home";
import {
  ArchiveService,
} from "./ArchiveServiceBlock/ArchiveService";
import { useRouteLoaderData } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "e-MERLIN Archive Service" },
    { name: "description", content: "e-MERLIN Archive Service" },
  ];
}

export default function Home() {
  const rootData = useRouteLoaderData("root") as
  | { publicRuntimeConfig: {SERVICE_HOST: string} }  
  | undefined;

  const apiBaseUrl = rootData?.publicRuntimeConfig?.SERVICE_HOST?.replace(/\/+$/, ""); // Remove trailing slashes if any

  return <ArchiveService apiBaseUrl={apiBaseUrl}/>;
};

  
