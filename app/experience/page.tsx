import type { Metadata } from "next";
import { ExperienceSection } from "@/components/ExperienceSection";

export const metadata: Metadata = {
  title: "Experience",
  description: "Kathan Patel's career history across Digip Technologies and Parkar Digital.",
};

export default function ExperiencePage() {
  return <div className="pt-16"><ExperienceSection /></div>;
}
