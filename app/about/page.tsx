import type { Metadata } from "next";
import { AboutSection } from "@/components/AboutSection";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about Kathan N. Patel — Technical Lead with 8+ years building scalable .NET applications.",
};

export default function AboutPage() {
  return <div className="pt-16"><AboutSection /></div>;
}
