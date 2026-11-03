// TypeScript / app/layout.tsx / Next.js 14+ / browser target
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = { title: 'Rewards Cashout', description: 'Interactive rewards preview demo' };
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) { return <html lang="en"><body>{children}</body></html>; }
