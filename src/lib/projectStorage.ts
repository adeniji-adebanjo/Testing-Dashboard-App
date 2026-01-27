// src/lib/projectStorage.ts
import {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
  ProjectStats,
} from "@/types/project";
import { supabase, getSessionId, isSupabaseEnabled } from "./supabase";
import { DEFAULT_PROJECTS } from "@/data/projects";

const PROJECTS_STORAGE_KEY = "testing_portal_projects";

// Generate a unique project ID
const generateProjectId = (name: string): string => {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const timestamp = Date.now().toString(36);
  return `${slug}-${timestamp}`;
};

// Local storage helpers
const saveProjectsToLocal = (projects: Project[]): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error("Error saving projects to localStorage:", error);
  }
};

const loadProjectsFromLocal = (): Project[] => {
  if (typeof window === "undefined") return DEFAULT_PROJECTS;
  try {
    const stored = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with default projects to ensure they always exist
      const defaultIds = DEFAULT_PROJECTS.map((p) => p.id);
      const customProjects = parsed.filter(
        (p: Project) => !defaultIds.includes(p.id),
      );
      return [...DEFAULT_PROJECTS, ...customProjects];
    }
    return DEFAULT_PROJECTS;
  } catch (error) {
    console.error("Error loading projects from localStorage:", error);
    return DEFAULT_PROJECTS;
  }
};

// Initialize projects (ensure defaults exist)
export const initializeProjects = async (): Promise<Project[]> => {
  const projects = loadProjectsFromLocal();

  // Save to ensure defaults are persisted
  saveProjectsToLocal(projects);

  // If Supabase is enabled, sync to cloud
  if (isSupabaseEnabled()) {
    try {
      const sessionId = getSessionId();
      // Check if user has projects in cloud
      const { data: existingData } = await supabase!
        .from("test_data")
        .select("data")
        .eq("data_type", PROJECTS_STORAGE_KEY)
        .single();

      if (!existingData) {
        // Save default projects to cloud
        await supabase!.from("test_data").insert([
          {
            session_id: sessionId,
            data_type: PROJECTS_STORAGE_KEY,
            data: projects,
          },
        ]);
      }
    } catch (error) {
      console.warn("Could not sync projects to cloud:", error);
    }
  }

  return projects;
};

// Load all projects
export const loadProjects = async (): Promise<Project[]> => {
  // Try to load from Supabase first
  if (isSupabaseEnabled()) {
    try {
      const { data, error } = await supabase!
        .from("test_data")
        .select("data")
        .eq("data_type", PROJECTS_STORAGE_KEY)
        .single();

      if (data && !error) {
        const projects = data.data as Project[];
        // Also save to localStorage for offline access
        saveProjectsToLocal(projects);
        return projects;
      }
    } catch (error) {
      console.warn("Could not load projects from cloud, using local:", error);
    }
  }

  return loadProjectsFromLocal();
};

// Get a single project by ID
export const getProject = async (
  projectId: string,
): Promise<Project | null> => {
  const projects = await loadProjects();
  return projects.find((p) => p.id === projectId) || null;
};

// Create a new project
export const createProject = async (
  input: CreateProjectInput,
): Promise<Project> => {
  const projects = await loadProjects();

  // Check for duplicate short code
  if (
    projects.some(
      (p) => p.shortCode.toLowerCase() === input.shortCode.toLowerCase(),
    )
  ) {
    throw new Error(
      `Project with short code "${input.shortCode}" already exists`,
    );
  }

  const newProject: Project = {
    id: generateProjectId(input.name),
    name: input.name,
    shortCode: input.shortCode.toUpperCase(),
    description: input.description,
    techStack: input.techStack,
    targetUsers: input.targetUsers,
    documentVersion: input.documentVersion || "1.0",
    status: "active",
    phase: "planning",
    color: input.color || "#6366F1", // Default indigo
    icon: input.icon,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const updatedProjects = [...projects, newProject];
  await saveProjects(updatedProjects);

  return newProject;
};

// Update an existing project
export const updateProject = async (
  projectId: string,
  input: UpdateProjectInput,
): Promise<Project> => {
  const projects = await loadProjects();
  const index = projects.findIndex((p) => p.id === projectId);

  if (index === -1) {
    throw new Error(`Project with ID "${projectId}" not found`);
  }

  // Check for duplicate short code if changing
  if (input.shortCode) {
    const existing = projects.find(
      (p) =>
        p.id !== projectId &&
        p.shortCode.toLowerCase() === input.shortCode!.toLowerCase(),
    );
    if (existing) {
      throw new Error(
        `Project with short code "${input.shortCode}" already exists`,
      );
    }
  }

  const updatedProject: Project = {
    ...projects[index],
    ...input,
    shortCode: input.shortCode?.toUpperCase() || projects[index].shortCode,
    updatedAt: new Date(),
  };

  projects[index] = updatedProject;
  await saveProjects(projects);

  return updatedProject;
};

// Delete a project
export const deleteProject = async (projectId: string): Promise<boolean> => {
  const projects = await loadProjects();

  // Prevent deleting default projects
  const defaultIds = DEFAULT_PROJECTS.map((p) => p.id);
  if (defaultIds.includes(projectId)) {
    throw new Error("Cannot delete default projects");
  }

  const filteredProjects = projects.filter((p) => p.id !== projectId);

  if (filteredProjects.length === projects.length) {
    return false; // Project not found
  }

  await saveProjects(filteredProjects);
  return true;
};

// Save all projects
const saveProjects = async (projects: Project[]): Promise<void> => {
  // Always save to localStorage
  saveProjectsToLocal(projects);

  // Sync to Supabase if enabled
  if (isSupabaseEnabled()) {
    try {
      const sessionId = getSessionId();

      // Check if record exists
      const { data: existing } = await supabase!
        .from("test_data")
        .select("id")
        .eq("data_type", PROJECTS_STORAGE_KEY)
        .single();

      if (existing) {
        await supabase!
          .from("test_data")
          .update({ data: projects })
          .eq("id", existing.id);
      } else {
        await supabase!.from("test_data").insert([
          {
            session_id: sessionId,
            data_type: PROJECTS_STORAGE_KEY,
            data: projects,
          },
        ]);
      }
    } catch (error) {
      console.warn("Could not sync projects to cloud:", error);
    }
  }
};

// Get project statistics
export const getProjectStats = async (
  projectId: string,
): Promise<ProjectStats> => {
  // Import here to avoid circular dependency
  const { loadFromStorage } = await import("./storage");

  // Load test cases for this project
  const allTestCases = loadFromStorage<
    Array<{ projectId?: string; status: string }>
  >("credit_bureau_test_cases", []);
  const projectTestCases = allTestCases.filter(
    (tc) => tc.projectId === projectId || !tc.projectId,
  );

  // Load defects for this project
  const allDefects = loadFromStorage<
    Array<{ projectId?: string; status: string }>
  >("credit_bureau_defects", []);
  const projectDefects = allDefects.filter(
    (d) => d.projectId === projectId || !d.projectId,
  );

  const passed = projectTestCases.filter((tc) => tc.status === "pass").length;
  const failed = projectTestCases.filter((tc) => tc.status === "fail").length;
  const pending = projectTestCases.filter(
    (tc) => tc.status === "pending",
  ).length;
  const blocked = projectTestCases.filter(
    (tc) => tc.status === "blocked",
  ).length;
  const total = projectTestCases.length;

  const defectsOpen = projectDefects.filter(
    (d) => d.status === "open" || d.status === "in-progress",
  ).length;
  const defectsClosed = projectDefects.filter(
    (d) => d.status === "resolved" || d.status === "closed",
  ).length;

  return {
    totalTestCases: total,
    passed,
    failed,
    pending,
    blocked,
    defectsOpen,
    defectsClosed,
    passRate: total > 0 ? Math.round((passed / total) * 100) : 0,
  };
};
