import type { Route } from "./+types/home";
import { useLoaderData } from "react-router";
import {
  ArchiveService,
  loader as archiveServiceLoader,
  type Observation,
} from "./ArchiveServiceBlock/ArchiveService";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  return archiveServiceLoader({ request });
}

export default function Home() {
  const observations = (useLoaderData() as Observation[] | undefined) ?? [];
  return <ArchiveService observations={observations} />;
}
