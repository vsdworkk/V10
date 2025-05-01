"use client";

import React, { createContext, useState, useCallback } from "react";
import type { Section } from "@/types";

interface WizardContextValue {
  currentSection: Section;
  handleSectionNavigate: (section: Section) => void;
  // we'll expose a way for the wizard to tell our context when the section changes
  setCurrentSection: (section: Section) => void;
}

export const WizardContext = createContext<WizardContextValue>({
  currentSection: "INTRO",
  handleSectionNavigate: () => {},
  setCurrentSection: () => {},
});

export function WizardProvider({ children }: { children: React.ReactNode }) {
  const [currentSection, setCurrentSection] = useState<Section>("INTRO");

  // Called by the sidebar when you click on a past section
  const handleSectionNavigate = useCallback((section: Section) => {
    setCurrentSection(section);
  }, []);

  return (
    <WizardContext.Provider value={{ currentSection, handleSectionNavigate, setCurrentSection }}>
      {children}
    </WizardContext.Provider>
  );
}
