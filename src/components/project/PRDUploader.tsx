"use client";

import { useState } from "react";
import {
  Upload,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronRight,
  FileCode,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TestCase } from "@/types/test-case";
import { useUpdateTestCases } from "@/hooks/useTestData";

interface PRDUploaderProps {
  projectId: string;
}

interface ParsedResult {
  testCases: Partial<TestCase>[];
  analysis: string;
}

export function PRDUploader({ projectId }: PRDUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ParsedResult | null>(null);
  const { mutate: updateTestCases, isPending: isSaving } =
    useUpdateTestCases(projectId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const analyzeWithAI = async () => {
    if (!file) return;

    setIsAnalyzing(true);

    try {
      // Read file content
      const content = await readFileContent(file);

      // Call the AI analysis API
      const response = await fetch("/api/analyze-prd", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          projectId,
          fileName: file.name,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze PRD");
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setResult({
        testCases: data.testCases,
        analysis: data.analysis + (data.usedMock ? " (Demo Mode)" : ""),
      });
    } catch (error) {
      console.error("PRD analysis failed:", error);
      // Fallback to showing an error message
      setResult({
        testCases: [],
        analysis: `Analysis failed: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Helper to read file content as text
  const readFileContent = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const content = e.target?.result;
        if (typeof content === "string") {
          resolve(content);
        } else {
          // For PDF files, we'd need a proper PDF parser
          // For now, just read as text
          resolve(content?.toString() || "");
        }
      };

      reader.onerror = () => reject(new Error("Failed to read file"));

      // Read as text - works for .txt, .md files
      // For PDF/DOCX, you'd need additional libraries
      reader.readAsText(file);
    });
  };

  const handleImport = () => {
    if (!result) return;

    // In a real app, we'd merge with existing test cases
    // For now, we'll just prepend them or replace
    updateTestCases(result.testCases as TestCase[]);
  };

  return (
    <div className="space-y-6">
      {!result ? (
        <div
          className={cn(
            "border-2 border-dashed rounded-2xl p-10 transition-all duration-300 flex flex-col items-center justify-center gap-4 text-center",
            file
              ? "border-primary bg-primary/5"
              : "border-gray-200 hover:border-primary/50",
          )}
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary animate-in fade-in zoom-in duration-500">
            {isAnalyzing ? (
              <Loader2 size={32} className="animate-spin" />
            ) : file ? (
              <FileCode size={32} />
            ) : (
              <Upload size={32} />
            )}
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {isAnalyzing
                ? "AI Analyzing PRD..."
                : file
                  ? file.name
                  : "Upload PRD Document"}
            </h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto mt-1">
              {isAnalyzing
                ? "Our AI is extracting requirements and generating test scenarios..."
                : "Drop your PDF, DOCX or Markdown PRD to auto-generate test cases."}
            </p>
          </div>

          {!isAnalyzing && (
            <div className="flex flex-col gap-3 w-full max-w-xs">
              {!file ? (
                <>
                  <input
                    type="file"
                    id="prd-upload"
                    className="hidden"
                    accept=".pdf,.docx,.md,.txt"
                    onChange={handleFileChange}
                  />
                  <Button
                    variant="outline"
                    onClick={() =>
                      document.getElementById("prd-upload")?.click()
                    }
                    className="w-full rounded-xl"
                  >
                    Select File
                  </Button>
                </>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => setFile(null)}
                    disabled={isAnalyzing}
                    className="flex-1 rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={analyzeWithAI}
                    className="flex-1 rounded-xl bg-primary shadow-lg shadow-primary/20 gap-2 cursor-pointer"
                  >
                    <Sparkles size={16} />
                    Analyze with AI
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border-none shadow-sm bg-green-50/50 overflow-hidden">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <h4 className="font-bold text-green-900">Analysis Complete</h4>
                <p className="text-xs text-green-700 mt-0.5">
                  {result.analysis}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
              Generated Test Cases ({result.testCases.length})
            </p>
            {result.testCases.map((tc, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm hover:border-primary/30 transition-colors group"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <h5 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <span className="text-primary">{tc.testCaseId}:</span>{" "}
                      {tc.scenario}
                    </h5>
                    <p className="text-[10px] text-gray-500 line-clamp-2 italic">
                      {tc.module} • {tc.steps?.split("\n").length} steps
                    </p>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-gray-300 group-hover:text-primary transition-colors shrink-0 mt-1"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setResult(null)}
              className="flex-1 rounded-xl"
            >
              Back
            </Button>
            <Button
              onClick={handleImport}
              disabled={isSaving}
              className="flex-1 rounded-xl bg-primary shadow-lg shadow-primary/20 gap-2"
            >
              {isSaving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Check size={16} />
              )}
              Import Test Cases
            </Button>
          </div>
        </div>
      )}

      <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 flex gap-3">
        <AlertCircle size={18} className="text-amber-600 shrink-0" />
        <div className="space-y-1">
          <p className="text-xs font-bold text-amber-900">
            Experimental Feature
          </p>
          <p className="text-[10px] text-amber-700 leading-relaxed">
            AI parsing accuracy depends on document quality. Always review
            generated test cases before marked as standard.
          </p>
        </div>
      </div>
    </div>
  );
}
