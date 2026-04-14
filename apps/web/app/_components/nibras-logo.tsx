'use client';

import dynamic from 'next/dynamic';

type LogoVariant = 'surface' | 'inverse' | 'theme';

// Load the Three.js logo only on the client — keeps Three.js out of the
// server bundle and avoids any WebGL/canvas initialisation during SSR.
const NibrasLogoThree = dynamic(() => import('./nibras-logo-three'), {
  ssr: false,
  loading: () => <span style={{ display: 'inline-block', minWidth: 90, height: 38 }} />,
});

export default function NibrasLogo({
  variant = 'theme',
  width,
  className = '',
  // `priority` was used by next/image; kept for API compatibility but unused here
  priority: _priority = false,
}: {
  variant?: LogoVariant;
  width: number;
  className?: string;
  priority?: boolean;
}) {
  return <NibrasLogoThree variant={variant} width={width} className={className} />;
}
