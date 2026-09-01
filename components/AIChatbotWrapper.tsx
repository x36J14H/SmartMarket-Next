'use client';

import dynamic from 'next/dynamic';

const AIChatbot = dynamic(
  () => import('./AIChatbot').then((mod) => mod.AIChatbot),
  { ssr: false }
);

export function AIChatbotWrapper() {
  return <AIChatbot />;
}
