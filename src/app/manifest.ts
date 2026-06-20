// src/app/manifest.ts
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'work24/6 motors Garage',
    short_name: 'work24/6',
    description: 'The hands your car deserves! Manage garage transactions and reminders.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#0a0a16',
    theme_color: '#00f0ff',
    orientation: 'portrait',
    icons: [
      {
        src: '/logo.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}