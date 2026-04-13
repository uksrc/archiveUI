import type { Route } from "./+types/home";
import { useLoaderData } from "react-router";
import {
  ArchiveService,
  loader as archiveServiceLoader,
  type Observation,
} from "./ArchiveServiceBlock/ArchiveService";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "e-Merlin Archive Service" },
    { name: "description", content: "e-Merlin Archive Service" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  return archiveServiceLoader({ request });
}

export default function Home() {
  const observations = (useLoaderData() as Observation[] | undefined) ?? [];
  return <ArchiveService observations={observations} />;
}
