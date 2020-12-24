import React, { useState, useRef, useEffect } from "react";

const SetupDDmenu = ({ ...props }) => {
  const [showDD, setShowDD] = useState(false);
  const [selected, setSelected] = useState(props.selected || "");
  const [courts, setCourts] = useState([]);

  useEffect(() => {
    let s,
      total,
      end = 0;
    s = parseInt(props.start);
    total = parseInt(props.available);
    end = s + total - 1;
    let courtnumbers = Array(end - s + 1)
      .fill()
      .map((_, id) => s + id);
    setCourts(courtnumbers);
  }, []);

  // useref keeps component from re-rendering if selected changes
  const refDropdown = useRef(null);
  const refButton = useRef(null);

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
    const sendVals = (val) => {
      let tId = props.team;
      props.selCallBack(tId, val);
      setSelected(val);
    };
    return (
      <ul className={`e-input__selectionMenu c-ddMenu u-card`}>
        {courts.map((item) => (
          <li
            key={item}
            className="e-input__selectItem"
            onClick={() => sendVals(item)}
          >
            {item}
          </li>
        ))}
      </ul>
    );
    return null;
  };

  return (
    // ### opener button ### //
    <div
      className={`e-customSelect__select u-align__text--right e-customSelect__select--form ${
        showDD ? "show" : ""
      } `}
      onClick={toggleDD}
      ref={refButton}
    >
      {/* actuall drop down */}
      {showDD ? <DD selected={selected} /> : null}
      <span>Court {selected || props.court}</span>
    </div>
  );
};

export default SetupDDmenu;
