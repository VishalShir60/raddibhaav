import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/site-config';
import './globals.css';

export const metadata: Metadata = {
  authors: [{ name: SITE_CONFIG.creator.name, url: SITE_CONFIG.links.linkedin }],
  creator: SITE_CONFIG.creator.name,
  publisher: SITE_CONFIG.name,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
