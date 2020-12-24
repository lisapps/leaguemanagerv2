import React, { useContext, useState } from "react";
import Modal from "../Modal/Modal";
import TeamsModalContent from "../TeamsModalContent";
import { useAccordionContext } from "../Accordion/hooks";

const TeamsSetupAccHeader = ({ children, ...props }) => {
  const [isShowing, setIsShowing] = useState(false);
  const { toggleRemBtn } = useAccordionContext();

  const handleShow = () => {
    setIsShowing(true);
  };
  const handleClose = () => {
    setIsShowing(false);
  };

  return (
    // add context to compare to activekey, if match add active class for triangle button turn. children[2] adds active class

    <div className="c-accordion__header">
      <div
        key={children[0].divisionId}
        className={
          children[1] ? `c-accordion__btn` : `c-accordion__btn ` + children[2]
        }
        {...props}
      >
        {children[0].division} Division
      </div>
      <div className="c-textBtnContainer">
        <span className={"js-showRemBtn e-btn__minus"}>
          <span
            className={`e-minustext tooltip--top`}
            aria-label="Reveal buttons that allow a team to be removed from a division."
            onClick={toggleRemBtn}
          >
            Remove Team
          </span>
          <span className="e-forwardSlash"></span>
        </span>

        <span
          className={`e-btn__plus tooltip--top`}
          aria-label="Add teams from pool to division."
          onClick={handleShow}
        >
          <span className="e-plustext">+ </span>
          Add Team
        </span>
        <Modal mtype={"c-addTeamModal"} value={isShowing} onClose={handleClose}>
          <TeamsModalContent
            division={children[0].divisionId}
            onConfirm={handleClose}
          />
        </Modal>
      </div>
    </div>
  );
};

export default TeamsSetupAccHeader;
