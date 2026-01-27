// Central export for all project seed data

export {
  CREDIT_BUREAU_PROJECT_ID,
  creditBureauProject,
  creditBureauObjectives,
  creditBureauEnvironments,
} from "./credit-bureau";

export {
  WEALTH_MANAGEMENT_PROJECT_ID,
  wealthManagementProject,
  wealthManagementObjectives,
  wealthManagementEnvironments,
} from "./wealth-management";

import { Project } from "@/types/project";
import { creditBureauProject } from "./credit-bureau";
import { wealthManagementProject } from "./wealth-management";

// All available projects
export const DEFAULT_PROJECTS: Project[] = [
  creditBureauProject,
  wealthManagementProject,
];

// Get project by ID
export const getProjectById = (projectId: string): Project | undefined => {
  return DEFAULT_PROJECTS.find((p) => p.id === projectId);
};

// Get project by short code
export const getProjectByCode = (shortCode: string): Project | undefined => {
  return DEFAULT_PROJECTS.find(
    (p) => p.shortCode.toLowerCase() === shortCode.toLowerCase(),
  );
};
