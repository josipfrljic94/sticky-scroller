import * as React from 'react';
import { useRef, useState } from 'react';
import { ScrollStatus } from './helper';
import { SSI } from './SSI';
import { StickyContainer } from './StickyContainer';
import './style.css';

export default function App() {
  const containerRef = useRef();
  const [scrollState, setScrollState] = useState(ScrollStatus.TOP);

  function setScrollPosition(state: ScrollStatus) {
    setScrollState(state);
  }
  return (
    <div className="container">
      <StickyContainer
        containerRef={containerRef}
        setScrollPosition={setScrollPosition}
      >
        <div className="row">
          <div className="column">
            <SSI containerRef={containerRef} scrollStatus={scrollState}>
              <div className="left content"></div>
            </SSI>
          </div>
          <div className="column">
            <SSI containerRef={containerRef} scrollStatus={scrollState}>
              <div className="center content"></div>
            </SSI>
          </div>
          <div className="column">
            <SSI scrollStatus={scrollState} containerRef={containerRef}>
              <div className="right content"></div>
            </SSI>
          </div>
        </div>
      </StickyContainer>
    </div>
  );
}
