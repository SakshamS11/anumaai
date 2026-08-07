export type FutureOrganization = { id: string; name: string };
export type FutureMembershipRole = "representative" | "manager" | "admin";
export type FutureTeam = { id: string; name: string };
export type FutureLocation = { id: string; name: string };

export const developmentContext = {
  label: "Development context",
  description: "Organization, location, and role scope will be established in Phase 2.",
} as const;
