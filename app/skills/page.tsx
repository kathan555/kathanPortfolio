import type { Metadata } from "next";
import { SkillsSection } from "@/components/SkillsSection";

export const metadata: Metadata = {
  title: "Skills",
  description: "Kathan Patel's technical skill set — C#, Blazor, WPF, ASP.NET Core, MS-SQL, and more.",
};

export default function SkillsPage() {
  return <div className="pt-16"><SkillsSection /></div>;
}
