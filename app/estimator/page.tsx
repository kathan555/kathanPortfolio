import { Metadata } from 'next';
import EstimatorClient from '@/components/EstimatorClient';

export const metadata: Metadata = {
  title: "Free Project Cost Estimator",
  description:
    "Get an AI-powered budget estimate for your next project. Answer a few questions and receive an instant cost breakdown — built by Kathan Patel.",
  openGraph: {
    title: "Project Cost Estimator — Kathan Patel",
    description:
      "Answer a few questions and get an instant AI-generated cost estimate for your software project.",
    url: "https://kathanpatel.vercel.app/estimator",
  },
};

export default function EstimatorPage() {
  return <EstimatorClient />;
}