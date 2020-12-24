import React, { useState, useRef, useEffect, useContext } from "react";
import ReactDOM from "react-dom";

const Modal = ({ children, onClose, ...props }) => {
  //state is handled by lifted state in parent component ie. TeamsSetupAccHeader.js, set using handler functions
  // then destructured as onClose
  const ref = useRef();

  function onClickOutside(ref, handler) {
    useEffect(
      () => {
        const listener = (event) => {
          // Do nothing if clicking ref's element or descendent elements
          var curr = ref.current;
          if (!curr || curr.contains(event.target)) {
            return;
          }
          handler(event);
        };

        document.addEventListener("mousedown", listener);
        document.addEventListener("touchstart", listener);

        return () => {
          document.removeEventListener("mousedown", listener);
          document.removeEventListener("touchstart", listener);
        };
      },
      // Add ref and handler to affect dependencies
      // It's worth noting that because passed in handler is a new ...
      // ... function on every render that will cause this effect ...
      // ... callback/cleanup to run every render. It's not a big deal ...
      // ... but to optimize you can wrap handler in useCallback before ...
      // ... passing it into this hook.
      [ref, handler]
    );
  }

  let show = props.value;

  onClickOutside(ref, onClose);

  const content = show && (
    <div
      className={`c-modal ${show ? "show" : ""}`}
      id={props.mtype}
      aria-modal
      aria-hidden={!show}
      tabIndex={-1}
      role="dialog"
    >
      <div
        className={`e-btn_close u-transfast`}
        onClick={onClose}
        aria-label="Close"
      ></div>
      <div className="c-modal__content" ref={ref}>
        <div>{children}</div>
      </div>
    </div>
  );

  return <>{ReactDOM.createPortal(content, document.body)}</>;
};

export default Modal;
