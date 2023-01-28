import React, { useEffect, useRef } from 'react';
import { fromEvent } from 'rxjs';
import { ScrollStatus, useIntersectionObserver } from './helper';

export const StickyContainer: React.FC = ({
  children,
  containerRef,
  setScrollPosition,
}) => {
  const topRef = useRef();
  const bottomRef = useRef();
  const isTopVisible = useIntersectionObserver(topRef?.current, {
    threshold: 1,
  });
  const isBotttomVisible = useIntersectionObserver(bottomRef?.current, {
    threshold: 1,
  });

  function sett() {
    if (isTopVisible) return setScrollPosition(ScrollStatus.TOP);
    if (isBotttomVisible) return setScrollPosition(ScrollStatus.BOTTOM);
    return setScrollPosition(ScrollStatus.MIDDLE);
  }

  useEffect(() => {
    const scroll$ = fromEvent(window.document, 'scroll').subscribe(sett);
    return () => scroll$.unsubscribe();
  });

  return (
    <div className="tuu" ref={containerRef}>
      <div className="top-component" ref={topRef} />
      {children}
      <div className="bottom-component" ref={bottomRef} />
    </div>
  );
};
