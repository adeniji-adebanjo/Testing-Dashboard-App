// src/app/api/analyze-prd/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { content, projectId, fileName } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: "No content provided" },
        { status: 400 },
      );
    }

    // Check if API key is configured
    if (!GEMINI_API_KEY) {
      // Return mock data if no API key
      return NextResponse.json({
        success: true,
        usedMock: true,
        testCases: generateMockTestCases(projectId),
        analysis:
          "Mock analysis: API key not configured. Add GOOGLE_GENERATIVE_AI_API_KEY to your .env.local file for real AI processing.",
      });
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Construct the prompt
    const prompt = `You are a QA Test Case Generator. Analyze the following Product Requirements Document (PRD) and extract test cases.

For each requirement or feature you identify, generate a test case with:
1. A clear scenario title
2. The module it belongs to
3. Step-by-step test steps (numbered)
4. Expected result

Return the output as a JSON array with objects containing these fields:
- testCaseId: string (format: TC-XXX)
- scenario: string (the test case title)
- module: string (feature area)
- steps: string (numbered steps, one per line)
- expectedResult: string
- priority: "high" | "medium" | "low"

PRD Content:
${content.substring(0, 15000)}

Return ONLY valid JSON array, no markdown formatting or explanation.`;

    // Call Gemini API
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the JSON response
    let testCases;
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        testCases = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON array found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError);
      console.log("Raw response:", text);
      // Return mock data if parsing fails
      return NextResponse.json({
        success: true,
        usedMock: true,
        testCases: generateMockTestCases(projectId),
        analysis:
          "AI analysis completed but response parsing failed. Using sample test cases.",
      });
    }

    // Format test cases to match our schema
    const formattedTestCases = testCases.map(
      (tc: Record<string, string>, index: number) => ({
        id: `tc-${Date.now()}-${index}`,
        testCaseId: tc.testCaseId || `TC-${String(index + 1).padStart(3, "0")}`,
        projectId: projectId,
        scenario: tc.scenario || tc.title || "Untitled Test Case",
        module: tc.module || "General",
        steps: tc.steps || "",
        expectedResult: tc.expectedResult || "",
        actualResult: "",
        status: "pending" as const,
        comments: `Generated from PRD: ${fileName || "uploaded document"}`,
      }),
    );

    return NextResponse.json({
      success: true,
      usedMock: false,
      testCases: formattedTestCases,
      analysis: `AI analysis complete. Extracted ${formattedTestCases.length} test cases from the PRD.`,
    });
  } catch (error) {
    console.error("PRD analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze PRD", details: String(error) },
      { status: 500 },
    );
  }
}

// Mock test case generator for demo mode
function generateMockTestCases(projectId: string) {
  return [
    {
      id: `tc-${Date.now()}-1`,
      testCaseId: "TC-001",
      projectId: projectId,
      scenario: "User Authentication - Login Flow",
      module: "Authentication",
      steps: [
        "1. Navigate to login page",
        "2. Enter valid email address",
        "3. Enter valid password",
        "4. Click 'Sign In' button",
      ].join("\n"),
      expectedResult: "User is authenticated and redirected to dashboard",
      actualResult: "",
      status: "pending" as const,
      comments: "Generated from PRD analysis (mock)",
    },
    {
      id: `tc-${Date.now()}-2`,
      testCaseId: "TC-002",
      projectId: projectId,
      scenario: "Data Validation - Required Fields",
      module: "Forms",
      steps: [
        "1. Navigate to data entry form",
        "2. Leave required fields empty",
        "3. Click 'Submit' button",
      ].join("\n"),
      expectedResult:
        "Form shows validation errors for required fields, submission is blocked",
      actualResult: "",
      status: "pending" as const,
      comments: "Generated from PRD analysis (mock)",
    },
    {
      id: `tc-${Date.now()}-3`,
      testCaseId: "TC-003",
      projectId: projectId,
      scenario: "Report Generation - PDF Export",
      module: "Reports",
      steps: [
        "1. Navigate to reports section",
        "2. Select date range",
        "3. Click 'Generate PDF' button",
        "4. Wait for download prompt",
      ].join("\n"),
      expectedResult:
        "PDF file downloads with correct data matching selected criteria",
      actualResult: "",
      status: "pending" as const,
      comments: "Generated from PRD analysis (mock)",
    },
  ];
}
