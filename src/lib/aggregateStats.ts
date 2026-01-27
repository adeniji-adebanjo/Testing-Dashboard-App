// src/lib/aggregateStats.ts
import { loadProjects, getProjectStats } from "./projectStorage";
import { Project, ProjectStats } from "@/types/project";

export interface GlobalStats {
  totalProjects: number;
  activeProjects: number;
  totalTestCases: number;
  totalPassed: number;
  totalFailed: number;
  totalPending: number;
  totalBlocked: number;
  totalDefectsOpen: number;
  totalDefectsClosed: number;
  overallPassRate: number;
  projectBreakdown: Array<{
    project: Project;
    stats: ProjectStats;
  }>;
}

/**
 * Aggregate statistics across all projects
 */
export const getGlobalStats = async (): Promise<GlobalStats> => {
  const projects = await loadProjects();
  const projectBreakdown: Array<{ project: Project; stats: ProjectStats }> = [];

  let totalTestCases = 0;
  let totalPassed = 0;
  let totalFailed = 0;
  let totalPending = 0;
  let totalBlocked = 0;
  let totalDefectsOpen = 0;
  let totalDefectsClosed = 0;

  for (const project of projects) {
    const stats = await getProjectStats(project.id);
    projectBreakdown.push({ project, stats });

    totalTestCases += stats.totalTestCases;
    totalPassed += stats.passed;
    totalFailed += stats.failed;
    totalPending += stats.pending;
    totalBlocked += stats.blocked;
    totalDefectsOpen += stats.defectsOpen;
    totalDefectsClosed += stats.defectsClosed;
  }

  const overallPassRate =
    totalTestCases > 0 ? Math.round((totalPassed / totalTestCases) * 100) : 0;

  return {
    totalProjects: projects.length,
    activeProjects: projects.filter((p) => p.status === "active").length,
    totalTestCases,
    totalPassed,
    totalFailed,
    totalPending,
    totalBlocked,
    totalDefectsOpen,
    totalDefectsClosed,
    overallPassRate,
    projectBreakdown,
  };
};

/**
 * Get projects sorted by health (pass rate)
 */
export const getProjectsByHealth = async (): Promise<
  Array<{ project: Project; stats: ProjectStats; healthScore: number }>
> => {
  const { projectBreakdown } = await getGlobalStats();

  return projectBreakdown
    .map(({ project, stats }) => ({
      project,
      stats,
      healthScore: stats.passRate,
    }))
    .sort((a, b) => b.healthScore - a.healthScore);
};

/**
 * Get critical issues across all projects
 */
export const getCriticalIssues = async (): Promise<{
  projectsWithFailures: number;
  projectsWithOpenDefects: number;
  highRiskProjects: Array<{ project: Project; reason: string }>;
}> => {
  const { projectBreakdown } = await getGlobalStats();

  const projectsWithFailures = projectBreakdown.filter(
    ({ stats }) => stats.failed > 0,
  ).length;

  const projectsWithOpenDefects = projectBreakdown.filter(
    ({ stats }) => stats.defectsOpen > 0,
  ).length;

  const highRiskProjects = projectBreakdown
    .filter(({ stats }) => stats.passRate < 70 || stats.defectsOpen > 5)
    .map(({ project, stats }) => ({
      project,
      reason:
        stats.passRate < 70
          ? `Low pass rate: ${stats.passRate}%`
          : `High open defects: ${stats.defectsOpen}`,
    }));

  return {
    projectsWithFailures,
    projectsWithOpenDefects,
    highRiskProjects,
  };
};
