import type { Route } from "./+types/home";
import {
  ArchiveService,
} from "./ArchiveServiceBlock/ArchiveService";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "e-MERLIN Archive Service" },
    { name: "description", content: "e-MERLIN Archive Service" },
  ];
}

export default function Home() {
  return <ArchiveService />;
}
