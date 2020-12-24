import React from "react";
// import PropTypes from "prop-types";
import { useAccordionContext } from "../hooks";

const useAccordionClick = (eventKey, onClick) => {
  //send state change to context. onToggle is boolean, not a function
  const { onToggle, activeEventKey } = useAccordionContext();
  return (event) => {
    onToggle(eventKey === activeEventKey ? null : eventKey);
    //just send event that it was clicked
    if (onClick) {
      onClick(event);
    }
  };
};

const Toggle = ({
  element: Component,
  eventKey,
  onClick,
  children,
  ...otherProps
}) => {
  const accordionClick = useAccordionClick(eventKey, onClick);

  return (
    <Component onClick={accordionClick} {...otherProps}>
      {children}
    </Component>
  );
};

Toggle.defaultProps = {
  element: "div",
};

export default Toggle;
