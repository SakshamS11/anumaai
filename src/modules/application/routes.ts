export type ApplicationRoute = {
  href:
    | "/conversations"
    | "/customer-intelligence"
    | "/frontline-performance"
    | "/outcome-intelligence"
    | "/administration";
  label: string;
  eyebrow: string;
  title: string;
  description: string;
  signal: "evidence" | "customer" | "performance" | "outcome" | "administration";
};

export const applicationRoutes: ApplicationRoute[] = [
  {
    href: "/conversations",
    label: "Conversations",
    eyebrow: "Interaction evidence",
    title: "Conversations",
    description:
      "Recorded and uploaded interactions will appear here. Evidence, processing status, and interaction intelligence will become available in later phases.",
    signal: "evidence",
  },
  {
    href: "/customer-intelligence",
    label: "Customer Intelligence",
    eyebrow: "Customer intelligence",
    title: "Customer Intelligence",
    description:
      "Customer needs, questions, objections and competitive signals will appear after interactions are processed.",
    signal: "customer",
  },
  {
    href: "/frontline-performance",
    label: "Frontline Performance",
    eyebrow: "Frontline intelligence",
    title: "Frontline Performance",
    description:
      "Evidence-backed interaction and process measures will appear as eligible conversations accumulate.",
    signal: "performance",
  },
  {
    href: "/outcome-intelligence",
    label: "Outcome Intelligence",
    eyebrow: "Outcome intelligence",
    title: "Outcome Intelligence",
    description:
      "Outcome comparisons will become available after sufficient labelled interactions exist.",
    signal: "outcome",
  },
  {
    href: "/administration",
    label: "Administration",
    eyebrow: "Application foundation",
    title: "Administration",
    description:
      "Organization configuration, teams, trackers and scorecards will be managed here in later phases.",
    signal: "administration",
  },
];

export function getApplicationRoute(href: ApplicationRoute["href"]) {
  const route = applicationRoutes.find((candidate) => candidate.href === href);

  if (!route) {
    throw new Error(`Unknown application route: ${href}`);
  }

  return route;
}
