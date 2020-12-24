import React, { useState, useRef, useEffect } from "react";

const DDmenu = ({ ...props }) => {
  const [showDD, setShowDD] = useState(false);
  const [selected, setSelected] = useState(props.selected || "");

  // useref keeps component from re-rendering if selected changes
  const refDropdown = useRef(null);
  const refButton = useRef(null);
  const refField = useRef(props.name);
  const refItems = useRef(props.items);

  // close if clicked outside
  useEffect(() => {
    if (showDD) {
      document.addEventListener("click", handleClick);
      return () => {
        document.removeEventListener("click", handleClick);
      };
    }
  }, [showDD]);

  // close function
  const handleClick = (e) => {
    if (
      refDropdown &&
      refDropdown.current &&
      refDropdown.current.contains(e.target)
    ) {
      return;
    }

    setShowDD(false);
  };

  const toggleDD = (e) => {
    setShowDD(() => !showDD);
  };

  //  ### Drop Down pane ###   //
  const DD = () => {
    //set selected item and send value to form
    const sendVals = (fname, val, txt) => {
      props.selCallBack(fname, val);
      setSelected(txt);
    };

    if (props.disabled !== "disabled") {
      return (
        <ul
          className={`e-input__selectionMenu c-ddMenu u-card`}
          id={"e-input__selectionMenu" + props.modifier}
        >
          {refItems.current.map((item) => (
            <li
              key={item.text}
              className="e-input__selectItem"
              onClick={() => sendVals(refField.current, item.value, item.text)}
            >
              {item.text}
            </li>
          ))}
        </ul>
      );
    } else {
      return null;
    }
  };

  return (
    // ### opener button ### //
    <li className={`e-createForm__liEntry e-customSelect`}>
      <label
        className={
          "e-createForm__label e-createForm__label" +
          props.modifier +
          " " +
          props.disabled
        }
      >
        {/* Label I.e. Gender */}
        {props.label}
      </label>
      <div
        className={`e-customSelect__select u-align__text--right e-customSelect__select--form ${
          props.disabled ? "disabled" : showDD ? "show" : ""
        } `}
        onClick={toggleDD}
        ref={refButton}
      >
        {/* actuall drop down */}
        {showDD ? <DD selected={selected} /> : null}
        <span>{selected}</span>
      </div>
    </li>
  );
};

export default DDmenu;
