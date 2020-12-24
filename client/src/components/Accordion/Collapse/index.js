import React from "react";
// import PropTypes from "prop-types";

import { useAccordionContext } from "../hooks";

const Collapse = ({
  element: Component,
  eventKey,
  children,
  ...otherProps
}) => {
  const { activeEventKey } = useAccordionContext();

  return activeEventKey === eventKey ? (
    <Component {...otherProps}>{children}</Component>
  ) : null;
};

Collapse.defaultProps = {
  element: "div",
};

export default Collapse;
