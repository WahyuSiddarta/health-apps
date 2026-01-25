import { useCopilotTutorial } from "@/hooks/use-copilot-tutorial";
import React, { ReactNode } from "react";

interface CopilotWrapperProps {
  children: ReactNode;
}

export const CopilotWrapper: React.FC<CopilotWrapperProps> = ({ children }) => {
  const { completeTutorial } = useCopilotTutorial();

  return <>{children}</>;
};
