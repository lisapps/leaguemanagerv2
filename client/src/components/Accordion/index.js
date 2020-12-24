import React, { useMemo } from "react";
//AccordionContext must be separate hook so useAccordionContext can refer it too
import AccordionContext from "./AccordionContext";
import Collapse from "./Collapse";
import Toggle from "./Toggle";

const Accordion = ({
  element: Component,
  activeEventKey,
  onToggle,
  updateCollapse,
  onChangeBody,
  removeBtn,
  toggleRemBtn,
  children,
  ...otherProps
}) => {
  //useMemo creates memoized data that only changes when dependencies change. Not every render
  const context = useMemo(() => {
    return {
      activeEventKey,
      onToggle,
      updateCollapse,
      onChangeBody,
      removeBtn,
      toggleRemBtn,
    };
  }, [activeEventKey, onToggle, updateCollapse, onChangeBody, removeBtn]);

  return (
    <AccordionContext.Provider value={context}>
      <Component {...otherProps}>{children}</Component>
    </AccordionContext.Provider>
  );
};

//so component won't break if no component or toggle function are passed in, also need to define Component as element so that any component can be passed in.
Accordion.defaultProps = {
  // default render as div
  element: "div",
  // noop
  onToggle: () => {},
};

Accordion.Toggle = Toggle;
Accordion.Collapse = Collapse;

export default Accordion;
