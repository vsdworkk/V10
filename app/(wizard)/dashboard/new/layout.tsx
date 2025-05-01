/**
 * @description
 * Server layout for the pitch wizard. Renders a full-screen header,
 * a centered "application card" with a vertical sidebar and wizard content,
 * and a footer—all styled to match your design spec.
 */

"use server";

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import SectionProgressSidebar from "./_components/section-progress-bar";
import type { Section } from "@/types";

interface PitchWizardLayoutProps {
  children: React.ReactNode;
}

export default async function PitchWizardLayout({
  children,
}: PitchWizardLayoutProps) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/login");
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Subtle grid-pattern overlay */}
      <div
        className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Header - Updated to position logo far left and image far right */}
      <header id="header" className="bg-white p-6 shadow-sm">
        <div className="max-w-full w-full px-12 mx-auto flex items-center justify-between">
          {/* Logo positioned with padding from the left edge */}
          <div className="flex items-center pl-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <i className="fa-solid fa-briefcase text-white"></i>
            </div>
            <span className="ml-2 text-2xl font-bold text-blue-600">
              JobFlow
            </span>
          </div>
         
        
        </div>
      </header>
      
      {/* Main "application card" container */}
      <div id="main-container" className="flex items-stretch justify-center p-12">
        <div
          id="application-card"
          className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden w-[90%] max-w-6xl flex"
        >
          {/* Sidebar with vertical progress */}
          <div
            id="sidebar"
            className="w-72 border-r border-gray-100 bg-white p-8 flex items-center shadow-lg"
          >
            <SectionProgressSidebar />
          </div>

          {/* Your wizard content */}
          <section id="main-content" className="flex-1 p-5">
            {children}
          </section>
        </div>
      </div>
      
    </div>
  );
}
