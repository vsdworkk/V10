/**
 * @description
 * Server layout for the pitch wizard. Renders a full-screen header,
 * a centered “application card” with a vertical sidebar and wizard content,
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

      {/* Header */}
      <header id="header" className="bg-white p-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <i className="fa-solid fa-briefcase text-white"></i>
            </div>
            <span className="ml-2 text-2xl font-bold text-blue-600">
              JobFlow
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="px-4 py-2 text-gray-600 hover:text-gray-800">
              <i className="fa-regular fa-bell"></i>
            </button>
            <div className="w-10 h-10 rounded-full overflow-hidden">
              {/* TODO: swap src for the real user avatar */}
              <img
                src="/avatars/avatar-placeholder.jpg"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main “application card” container */}
      <div id="main-container" className="flex items-stretch justify-center p-12">
        <div
          id="application-card"
          className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden w-[90%] max-w-[90%] flex"
        >
          {/* Sidebar with vertical progress */}
          <aside
            id="sidebar"
            className="w-80 border-r border-gray-100 bg-white p-8"
          >
            {/* Render the vertical stepper */}
            <SectionProgressSidebar current={"INTRO"} />
          </aside>

          {/* Your wizard content */}
          <section id="main-content" className="flex-1 p-10">
            {children}
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer id="footer" className="bg-white border-t border-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500 mb-4 md:mb-0">
              © 2025 JobFlow. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <span className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer">
                Privacy Policy
              </span>
              <span className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer">
                Terms of Service
              </span>
              <span className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer">
                Contact Us
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
