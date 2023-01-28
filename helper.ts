import { useCallback, useEffect, useRef, useState } from 'react';
import {
  fromEvent,
  map,
  throttleTime,
  takeUntil,
  pairwise,
  distinctUntilChanged,
  Observable,
  Subject,
  animationFrameScheduler,
} from 'rxjs';

export enum ScrollDirection {
  REST,
  DOWN,
  UP,
}

export enum ScrollStatus {
  TOP = 'TOP',
  MIDDLE = 'MIDDLE',
  BOTTOM = 'BOTTOM',
}

//*LIMIT HEIGHT RESPRESENT THE HEIGHT BELOW WHICH THE SCROLL WILL NOT BE CALCULATED
export const useScrollDirection = (limitHeight = 0) => {
  const [scrollDir, setScrollDir] = useState<ScrollDirection>(
    ScrollDirection.REST
  );
  const { takeUntilDestroyed } = useDestroyObservable();
  useEffect(() => {
    const scrollEvent$ = fromEvent(window.document, 'scroll').pipe(
      // throttleTime(0, animationFrameScheduler),
      map(() => window.pageYOffset),
      pairwise(),
      map(([prevScrollPosition, currentScrollPosition]) => {
        if (limitHeight >= window.scrollY) return ScrollDirection.REST;
        return currentScrollPosition < prevScrollPosition
          ? ScrollDirection.UP
          : ScrollDirection.DOWN;
      }),
      distinctUntilChanged()
    );
    takeUntilDestroyed(scrollEvent$).subscribe(setScrollDir);
  }, [limitHeight, takeUntilDestroyed]);
  return scrollDir;
};

export const useIntersectionObserver = (
  element: Element,
  options: IntersectionObserverInit
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    if (element) {
      observer.observe(element);
    }

    return () => {
      observer.unobserve(element);
    };
  }, [element, options]);

  return isIntersecting;
};

export function takeUntilDestroyed<T>(
  observable: Observable<T>,
  destroyObservable: Observable<unknown>
) {
  return observable?.pipe(takeUntil(destroyObservable));
}
export function useDestroyObservable() {
  const destroy = useRef(new Subject());
  const takeUntilDestroyedFactory = useCallback(
    <T>(observable: Observable<T>) =>
      takeUntilDestroyed(observable, destroy.current),
    []
  );

  useEffect(() => {
    const destroy$ = destroy.current;
    return () => {
      destroy$.next(null);
      destroy$.complete();
    };
  }, []);

  return {
    destroy: destroy.current,
    takeUntilDestroyed: takeUntilDestroyedFactory,
  };
}
export const useElementInView = (options?: IntersectionObserverInit) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef(null);
  const [elem, setElem] = useState<HTMLElement>(null);
  const observer = useRef<IntersectionObserver>(null);

  const setRef = useCallback(
    (node: HTMLElement) => {
      if (ref.current) {
        observer.current?.unobserve(ref.current);
        observer.current = null;
      }

      if (node) {
        const config = {
          root: null,
          rootMargin: '0',
          threshold: 0,
          ...options,
        };

        observer.current = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            setIsIntersecting(entry.isIntersecting);
          });
        }, config);
        observer.current.observe(node);
      }

      ref.current = node;
      setElem(node);
    },
    [options]
  );

  return { setRef, elem, isIntersecting };
};
