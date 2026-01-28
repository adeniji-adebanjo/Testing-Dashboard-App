"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MoveLeft, AlertCircle, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Animated Background Element */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-700" />
        </div>

        <div className="relative z-10">
          {/* Logo */}
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic mb-8">
            Test<span className="text-primary not-italic">Portal</span>
          </h1>

          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
            <div className="w-20 h-20 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>

            <h2 className="text-6xl font-bold text-white mb-2">404</h2>
            <p className="text-xl font-medium text-gray-300 mb-4">
              Page Not Found
            </p>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              The page you are looking for might have been removed, had its name
              changed, or is temporarily unavailable.
            </p>

            <div className="flex flex-col gap-3">
              <Button
                asChild
                className="w-full py-6 font-bold text-lg shadow-lg shadow-primary/20 cursor-pointer"
              >
                <Link href="/dashboard" className="gap-2">
                  <Home size={20} />
                  Return to Dashboard
                </Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="w-full py-6 font-bold bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <Link href="/" className="gap-2">
                  <MoveLeft size={20} />
                  Public Landing Page
                </Link>
              </Button>
            </div>
          </div>

          <p className="mt-8 text-gray-500 text-xs">
            © {new Date().getFullYear()} TestPortal • All Rights Reserved
          </p>
        </div>
      </div>
    </div>
  );
}
