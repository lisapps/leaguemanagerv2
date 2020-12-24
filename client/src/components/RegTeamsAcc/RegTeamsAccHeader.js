import React from "react";

const RegTeamsAccHeader = ({ children, ...props }) => {
  return (
    // add context to compare to activekey, if match add active class for triangle button turn. children[2] adds active class
    <div
      key={children[0].divisionId}
      className={
        children[1] ? `c-accordion__btn` : `c-accordion__btn ` + children[2]
      }
      {...props}
    >
      {children[0].division} Division
    </div>
  );
};

export default RegTeamsAccHeader;
