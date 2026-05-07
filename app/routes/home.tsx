import type { Route } from "./+types/home";
import {
  ArchiveService,
} from "./ArchiveServiceBlock/ArchiveService";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "e-Merlin Archive Service" },
    { name: "description", content: "e-Merlin Archive Service" },
  ];
}

export default function Home() {
  return <ArchiveService />;
}
