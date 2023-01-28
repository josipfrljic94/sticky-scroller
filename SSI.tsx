import React, { useRef, useState } from 'react';
import {
  ScrollDirection,
  ScrollStatus,
  useIntersectionObserver,
  useScrollDirection,
} from './helper';

export const SSI: React.FC = ({ children, scrollStatus }) => {
  const direction = useScrollDirection();
  const scrollCount = window.scrollY;
  const elRef = useRef();
  const [firstEl, setFirstEl] = useState();
  const [thirdEl, setThirdEl] = useState();
  const [style, setStyle] = useState({
    top: '0',
    something: '0',
    bottom: 'unset',
  });

  const wrapElement = elRef?.current;
  React.useEffect(() => {
    if (!wrapElement) return;
    const [prvi, _, treci] = wrapElement.children;
    setFirstEl(prvi);
    setThirdEl(treci);
  }, [wrapElement]);

  const isTopVisible = useIntersectionObserver(firstEl, {
    threshold: 0.1,
  });
  const isBottomVisible = useIntersectionObserver(thirdEl, {
    threshold: 0.1,
  });

  React.useEffect(() => {
    if (!wrapElement) return;
    const [_, contentEl, ...rest] = wrapElement.children;

    if (!contentEl) return;
    const { height, top, bottom } = contentEl.getBoundingClientRect();

    const diffHeight = height - window.innerHeight + 20;
    if (diffHeight < 0) {
      setStyle({
        top: '0',
        something: '0px',
        bottom: 'unset',
      });
      return;
    }

    if (scrollStatus === ScrollStatus.TOP && top > 0) {
      setStyle((state) => ({ ...state, something: '0px' }));
    }
    if (scrollStatus === ScrollStatus.BOTTOM) return;

    if (direction === ScrollDirection.DOWN) {
      if (isBottomVisible || bottom < window.innerHeight) return;

      if (isTopVisible || (top < 30 && top > -20)) {
        setStyle({
          top: `${-diffHeight}px`,
          bottom: 'unset',
          something: `${scrollCount}px`,
        });
      } else {
        setStyle(({ something }) => ({
          top: `${-diffHeight}px`,
          bottom: 'unset',
          something: `${something}px`,
        }));
      }
    }
    if (direction === ScrollDirection.UP) {
      if (isTopVisible) return;

      if (isBottomVisible || bottom < window.innerHeight + 20) {
        setStyle({
          bottom: `${-diffHeight}px`,
          top: 'unset',
          something: `${scrollCount - diffHeight}px`,
        });
      } else {
        setStyle(({ something }) => ({
          bottom: `${-diffHeight}px`,
          top: 'unset',
          something: `${something}px`,
        }));
      }
    }
  }, [direction, scrollStatus, isTopVisible, isBottomVisible]);

  const clones = React.Children.map(children, (child) => {
    return React.cloneElement(child, { style });
  });
  return (
    <div ref={elRef} className="wrap">
      <div style={{ height: style.something }} />
      {clones}
      <div />
    </div>
  );
};
