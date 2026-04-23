import type { Metadata } from "next";
import { ProjectsSection } from "@/components/ProjectsSection";

export const metadata: Metadata = {
  title: "Projects",
  description: "Kathan Patel's key projects — legal tech, fintech trading, healthcare, e-commerce.",
};

export default function ProjectsPage() {
  return <div className="pt-16"><ProjectsSection /></div>;
}
