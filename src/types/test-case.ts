export type TestStatus = "pass" | "fail" | "pending" | "blocked";

export interface TestCase {
  id: string;
  projectId?: string; // Optional for backward compatibility
  testCaseId: string;
  module: string;
  scenario: string;
  steps?: string;
  expectedResult: string;
  actualResult: string;
  status: TestStatus;
  comments: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TestModule {
  id: string;
  projectId?: string; // Optional for backward compatibility
  name: string;
  description: string;
  testCases: TestCase[];
}

export interface TestEnvironment {
  id?: string; // Added for consistency
  projectId?: string; // Added for multi-project support
  component: string;
  details: string;
  status: "ready" | "pending";
}

export interface TestObjective {
  id: string;
  projectId?: string; // Added for multi-project support
  description: string;
  completed: boolean;
}

export interface Defect {
  id: string;
  projectId?: string; // Optional for backward compatibility
  bugId: string;
  severity: "critical" | "high" | "medium" | "low";
  module: string;
  description: string;
  stepsToReproduce: string;
  status: "open" | "in-progress" | "resolved" | "closed";
  assignedTo: string;
  resolutionDate?: Date;
  createdAt: Date;
}

export interface SuccessMetric {
  id: string;
  projectId?: string; // Added for multi-project support
  metric: string;
  target: string;
  actualResult: string;
  status: "met" | "not-met" | "pending";
}

export interface SignOff {
  id?: string; // Added for consistency
  projectId?: string; // Added for multi-project support
  role: string;
  name: string;
  signature: string;
  date: Date | null;
}
