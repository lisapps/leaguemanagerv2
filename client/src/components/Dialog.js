import React, { useState } from "react";

const Dialog = ({ show, buttons, css, heading, content, cbFunc }) => {
  const initState = {
    btnfooter: buttons ? true : false,
    //buttons should be passed in as an array of objects. Button obj should look like { text: "Cancel", action: someFunc(), type: "secondary"}. Type should be "primary" or "secondary".
    btns: buttons ? buttons : [],
    //add custom css classes to dialog container
    cssClass: css ? css : [],
    title: heading,
    content: content ? content : "",
    cb: cbFunc ? cbFunc : null,
  };

  const [state, setState] = useState(initState);

  if (show)
    return (
      <div
        className={`dialog-modal ${
          state.cssClass !== [] ? state.cssClass.map((item) => item) : ""
        }`}
      >
        <div className={`dialog-modal-box`}>
          <div className={`dialog-modal-box__content`}>
            <h1>{state.title}</h1>
            <p className={`u-small_body_text u-text--center`}>
              {state.content}
            </p>
          </div>
          {state.btnfooter ? (
            <div className={`dialog-modal-box__footer`}>
              {state.btns.map((btn, index) => (
                <button
                  className={`e-btn e-btn--small dialog-btn--${btn.type}`}
                  onClick={btn.action}
                  key={index}
                >
                  {btn.text}
                </button>
              ))}
            </div>
          ) : (
            ""
          )}
        </div>
      </div>
    );
  if (!show) return null;
};

export default Dialog;
