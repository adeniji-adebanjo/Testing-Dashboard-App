import { Project } from "@/types/project";
import { TestObjective, TestEnvironment } from "@/types/test-case";

export const WEALTH_MANAGEMENT_PROJECT_ID = "wealth-management-app";

export const wealthManagementProject: Project = {
  id: WEALTH_MANAGEMENT_PROJECT_ID,
  name: "Rosabon Wealth Management App",
  shortCode: "WMA",
  description:
    "A comprehensive wealth management application for Rosabon. Enables investors to manage their portfolios, track investments, and interact with financial advisors.",
  techStack: ["React Native", "Node.js", "PostgreSQL", "Redis", "AWS"],
  targetUsers: [
    "Individual Investors",
    "Financial Advisors",
    "Portfolio Managers",
    "Admin Staff",
  ],
  documentVersion: "1.0",
  status: "active",
  phase: "planning",
  color: "#10B981", // Green
  icon: "wallet",
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Default test objectives for Wealth Management App
export const wealthManagementObjectives: TestObjective[] = [
  {
    id: "wma-obj-1",
    projectId: WEALTH_MANAGEMENT_PROJECT_ID,
    description: "Validate user registration and KYC verification flows",
    completed: false,
  },
  {
    id: "wma-obj-2",
    projectId: WEALTH_MANAGEMENT_PROJECT_ID,
    description: "Test investment product browsing and selection",
    completed: false,
  },
  {
    id: "wma-obj-3",
    projectId: WEALTH_MANAGEMENT_PROJECT_ID,
    description: "Verify portfolio tracking and balance calculations",
    completed: false,
  },
  {
    id: "wma-obj-4",
    projectId: WEALTH_MANAGEMENT_PROJECT_ID,
    description: "Test payment gateway integration (deposits/withdrawals)",
    completed: false,
  },
  {
    id: "wma-obj-5",
    projectId: WEALTH_MANAGEMENT_PROJECT_ID,
    description: "Validate notification system (email, SMS, push)",
    completed: false,
  },
  {
    id: "wma-obj-6",
    projectId: WEALTH_MANAGEMENT_PROJECT_ID,
    description: "Test investment maturity and returns calculations",
    completed: false,
  },
  {
    id: "wma-obj-7",
    projectId: WEALTH_MANAGEMENT_PROJECT_ID,
    description: "Verify document upload and management features",
    completed: false,
  },
  {
    id: "wma-obj-8",
    projectId: WEALTH_MANAGEMENT_PROJECT_ID,
    description: "Test admin dashboard and reporting capabilities",
    completed: false,
  },
  {
    id: "wma-obj-9",
    projectId: WEALTH_MANAGEMENT_PROJECT_ID,
    description: "Validate security features (2FA, session management)",
    completed: false,
  },
  {
    id: "wma-obj-10",
    projectId: WEALTH_MANAGEMENT_PROJECT_ID,
    description: "Test mobile app performance and offline capabilities",
    completed: false,
  },
];

// Default test environments for Wealth Management App
export const wealthManagementEnvironments: TestEnvironment[] = [
  {
    id: "wma-env-1",
    projectId: WEALTH_MANAGEMENT_PROJECT_ID,
    component: "Mobile App (iOS)",
    details: "iOS 15+ on iPhone 12 and above",
    status: "pending",
  },
  {
    id: "wma-env-2",
    projectId: WEALTH_MANAGEMENT_PROJECT_ID,
    component: "Mobile App (Android)",
    details: "Android 11+ on various devices",
    status: "pending",
  },
  {
    id: "wma-env-3",
    projectId: WEALTH_MANAGEMENT_PROJECT_ID,
    component: "Backend API",
    details: "Node.js v18+ with Express",
    status: "pending",
  },
  {
    id: "wma-env-4",
    projectId: WEALTH_MANAGEMENT_PROJECT_ID,
    component: "Database",
    details: "PostgreSQL 15 with Redis cache",
    status: "pending",
  },
  {
    id: "wma-env-5",
    projectId: WEALTH_MANAGEMENT_PROJECT_ID,
    component: "Payment Gateway",
    details: "Paystack/Flutterwave sandbox",
    status: "pending",
  },
  {
    id: "wma-env-6",
    projectId: WEALTH_MANAGEMENT_PROJECT_ID,
    component: "Test Data",
    details: "Sample investor accounts and portfolios",
    status: "pending",
  },
];
