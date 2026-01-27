import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MainLayout from "@/components/layout/MainLayout";
import { ProjectProvider } from "@/context/ProjectContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Testing Management Portal",
  description:
    "Multi-project testing management portal for managing test cases, defects, and metrics across multiple projects",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ProjectProvider>
          <MainLayout>{children}</MainLayout>
        </ProjectProvider>
      </body>
    </html>
  );
}
