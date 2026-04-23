import type { Metadata } from "next";
import { EducationSection } from "@/components/EducationSection";

export const metadata: Metadata = {
  title: "Education",
  description: "Kathan Patel — B.Sc. Computer Science, Silver Oak College of Engineering & Technology.",
};

export default function EducationPage() {
  return <div className="pt-16"><EducationSection /></div>;
}
