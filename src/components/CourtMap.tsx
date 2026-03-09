import { lazy, Suspense } from 'react';
import type { Court } from '@/types/court';

interface CourtMapProps {
  courts: Court[];
}

const LazyMapInner = lazy(() => import('./CourtMapInner'));

export const CourtMap = ({ courts }: CourtMapProps) => {
  return (
    <Suspense fallback={<div className="w-full rounded-xl overflow-hidden border bg-muted animate-pulse" style={{ height: 500 }} />}>
      <LazyMapInner courts={courts} />
    </Suspense>
  );
};
