import { useState, useEffect, RefObject } from 'react';

export const useVirtualization = <T,>(
    items: T[],
    itemHeight: number,
    containerRef: RefObject<HTMLElement>,
    overscan = 5
) => {
  const [range, setRange] = useState({ start: 0, end: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateRange = () => {
      const { scrollTop, clientHeight } = container;
      const start = Math.floor(scrollTop / itemHeight);
      const end = start + Math.ceil(clientHeight / itemHeight);
      setRange({
        start: Math.max(0, start - overscan),
        end: Math.min(items.length, end + overscan),
      });
    };

    updateRange();

    container.addEventListener('scroll', updateRange, { passive: true });
    return () => {
      if (container) {
        container.removeEventListener('scroll', updateRange);
      }
    };
  }, [containerRef, items.length, itemHeight, overscan]);

  const paddingTop = range.start * itemHeight;
  const totalHeight = items.length * itemHeight;

  return {
    visibleItems: items.slice(range.start, range.end),
    paddingTop,
    totalHeight,
    range,
  };
};
