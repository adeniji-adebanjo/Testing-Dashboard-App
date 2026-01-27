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

// Initialize projects (ensure defaults exist and migrate if needed)
export const initializeProjects = async (): Promise<Project[]> => {
  const localProjects = loadProjectsFromLocal();
  saveProjectsToLocal(localProjects);

  if (isSupabaseEnabled()) {
    try {
      const sessionId = getSessionId();

      // 1. Check for legacy projects in test_data blob
      const { data: legacyData } = await supabase!
        .from("test_data")
        .select("id, data")
        .eq("data_type", PROJECTS_STORAGE_KEY)
        .single();

      // 2. Load projects from the new dedicated table
      const { data: currentProjects } = await supabase!
        .from("projects")
        .select("*");

      // 3. Migration logic: If legacy data exists but new table is empty, migrate
      if (legacyData && (!currentProjects || currentProjects.length === 0)) {
        console.log("Migrating project data to new relational structure...");
        const projectsToMigrate = legacyData.data as Project[];

        // Find user UUID for references
        const { data: userData } = await supabase!
          .from("users")
          .select("id")
          .eq("session_id", sessionId)
          .single();

        if (userData) {
          for (const p of projectsToMigrate) {
            // We'll skip ID for now to let Postgres generate a UUID,
            // or we could map our slug ID to a slug column.
            // For now, we'll store the slug in a way that doesn't break UUID constraint if possible,
            // but the migration script used UUID.
            // I'll update the code to handle real UUIDs for new projects.
            try {
              await supabase!.from("projects").insert({
                user_id: userData.id,
                name: p.name,
                short_code: p.shortCode,
                description: p.description,
                tech_stack: p.techStack,
                target_users: p.targetUsers,
                document_version: p.documentVersion,
                status: p.status,
                phase: p.phase,
                color: p.color,
              });
            } catch (err) {
              console.warn("Migration failed for project:", p.name, err);
            }
          }
          // Optionally delete legacy blob after migration
          // await supabase!.from("test_data").delete().eq("id", legacyData.id);
        }
      }
    } catch (error) {
      console.warn("Could not initialize/migrate projects in cloud:", error);
    }
  }

  return loadProjects();
};

// Load all projects
export const loadProjects = async (): Promise<Project[]> => {
  // Try to load from Supabase 'projects' table
  if (isSupabaseEnabled()) {
    try {
      const { data, error } = await supabase!.from("projects").select("*");

      if (data && !error && data.length > 0) {
        // Map DB fields to Project type
        const projects = data.map((p) => ({
          ...p,
          shortCode: p.short_code,
          techStack: p.tech_stack,
          targetUsers: p.target_users,
          documentVersion: p.document_version,
          createdAt: new Date(p.created_at),
          updatedAt: new Date(p.updated_at),
        })) as Project[];

        saveProjectsToLocal(projects);
        return projects;
      }
    } catch (error) {
      console.warn(
        "Could not load projects from cloud table, using local:",
        error,
      );
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
    id: generateProjectId(input.name), // Note: This is still a slug, DB will generate a separate UUID PK
    name: input.name,
    shortCode: input.shortCode.toUpperCase(),
    description: input.description,
    techStack: input.techStack,
    targetUsers: input.targetUsers,
    documentVersion: input.documentVersion || "1.0",
    status: "active",
    phase: "planning",
    color: input.color || "#6366F1",
    icon: input.icon,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Save to Local
  const updatedProjects = [...projects, newProject];
  saveProjectsToLocal(updatedProjects);

  // Sync to Cloud
  if (isSupabaseEnabled()) {
    try {
      const sessionId = getSessionId();
      const { data: userData } = await supabase!
        .from("users")
        .select("id")
        .eq("session_id", sessionId)
        .single();

      if (userData) {
        const { data: savedProject, error } = await supabase!
          .from("projects")
          .insert({
            user_id: userData.id,
            name: newProject.name,
            short_code: newProject.shortCode,
            description: newProject.description,
            tech_stack: newProject.techStack,
            target_users: newProject.targetUsers,
            document_version: newProject.documentVersion,
            status: newProject.status,
            phase: newProject.phase,
            color: newProject.color,
          })
          .select()
          .single();

        if (!error && savedProject) {
          // If successful, we could update the local ID with the actual UUID from DB
          // to ensure perfect relational mapping for test data.
          newProject.id = savedProject.id;
          saveProjectsToLocal([...projects, newProject]);
        }
      }
    } catch (error) {
      console.warn("Could not sync new project to cloud:", error);
    }
  }

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

  const updatedProject: Project = {
    ...projects[index],
    ...input,
    shortCode: input.shortCode?.toUpperCase() || projects[index].shortCode,
    updatedAt: new Date(),
  };

  projects[index] = updatedProject;
  saveProjectsToLocal(projects);

  // Sync to Cloud
  if (isSupabaseEnabled()) {
    try {
      // If projectId is a UUID, use it directly
      await supabase!
        .from("projects")
        .update({
          name: updatedProject.name,
          short_code: updatedProject.shortCode,
          description: updatedProject.description,
          tech_stack: updatedProject.techStack,
          target_users: updatedProject.targetUsers,
          document_version: updatedProject.documentVersion,
          status: updatedProject.status,
          phase: updatedProject.phase,
          color: updatedProject.color,
        })
        .eq("id", projectId); // This assumes the app is using the UUID as ID
    } catch (error) {
      console.warn("Could not sync update to cloud:", error);
    }
  }

  return updatedProject;
};

// Delete a project
export const deleteProject = async (projectId: string): Promise<boolean> => {
  const projects = await loadProjects();

  const defaultIds = DEFAULT_PROJECTS.map((p) => p.id);
  if (defaultIds.includes(projectId)) {
    throw new Error("Cannot delete default projects");
  }

  const filteredProjects = projects.filter((p) => p.id !== projectId);
  saveProjectsToLocal(filteredProjects);

  // Sync to Cloud
  if (isSupabaseEnabled()) {
    try {
      await supabase!.from("projects").delete().eq("id", projectId);
    } catch (error) {
      console.warn("Could not sync delete to cloud:", error);
    }
  }

  return true;
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
