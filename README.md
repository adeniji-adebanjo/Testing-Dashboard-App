# Credit Bureau Testing Dashboard

A high-performance, aesthetically rich dashboard for managing software testing lifecycles, specializing in credit bureau applications. This dashboard provides a modular approach to both functional and non-functional testing, with seamless cloud synchronization via Supabase.

## ✨ Features

- **Multi-Project Management**: Effortlessly toggle between different projects, each with its own isolated data, settings, and custom testing tabs.
- **Dynamic Testing Modules**:
  - **Functional Testing**: Customizable modules (e.g., Authentication, Search, API) with editable default scenarios.
  - **Non-Functional Testing**: Specialized modules for Performance, Security, Usability, and Compatibility metrics.
- **Template System**: Define project-wide templates for test cases, including custom ID prefixes (e.g., AUTH-001) and default scenarios.
- **AI-Powered Generation**: (Ready for integration) Capabilities to auto-generate test cases from PRD uploads.
- **Rich Data Visualizations**: Real-time metrics tracking for test progress and defect density.
- **Export Capabilities**: Generate professional PDF reports and Excel spreadsheets of test results.
- **Responsive & Premium UI**: Built with a "Visual Excellence" philosophy using Tailwind CSS, Radix UI, and Lucide Icons.

## 🚀 Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **State Management**: [TanStack Query v5](https://tanstack.com/query/latest)
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI & Radix UI
- **Icons**: Lucide React
- **Logging/Analytics**: Custom internal telemetry

## 📁 Project Structure

```text
src/
├── app/                  # Next.js App Router (Dashboard, Login, API)
│   ├── (dashboard)/      # Protected dashboard routes
│   │   └── projects/     # Project-specific testing pages
├── components/           # Reusable UI components
│   ├── testing/          # Test case tables, managers, and modules
│   ├── layout/           # Sidebar, Navbar, and Shell
│   └── ui/               # Primary UI primitives (buttons, cards, etc.)
├── hooks/                # Custom React hooks (Data fetching, Auth)
├── lib/                  # Utility functions and Cloud Storage logic
├── types/                # TypeScript interfaces and global definitions
└── context/              # React Context providers
```

## 🛠️ Getting Started

### 1. Prerequisite

Ensure you have Node.js (v18+) and an active Supabase project.

### 2. Installation

```bash
git clone https://github.com/adeniji-adebanjo/App-Testing-Dashboard.git
cd App-Testing-Dashboard
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Schema

Apply the latest SQL migration (found in the "Project Settings" or provided separately) to your Supabase SQL editor to set up the following:

- `projects` & `project_tabs`
- `functional_modules` & `functional_module_templates`
- `default_test_scenarios`
- `test_data` & `defects`

### 5. Run Locally

```bash
npm run dev
```

## ⚙️ Configuration

You can customize the testing matrix via the **"Configure Modules"** button on the Functional and Non-Functional testing pages. This allows you to:

- Rename or reorder tabs.
- Change Test Case ID prefixes.
- Pre-populate projects with standard scenarios (e.g., "Verify SSL compliance" for Security).

---

Developed with ❤️ for quality assurance excellence.
