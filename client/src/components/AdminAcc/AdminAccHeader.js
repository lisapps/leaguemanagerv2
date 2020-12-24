import React, { useContext, useState } from "react";
import Modal from "../Modal/Modal";
import MgrModalContent from "../MgrModalContent";
import { useAccordionContext } from "../Accordion/hooks";
import lIcon from "../../../public/images/icons/icons-photo-league.svg";

const AdminHeader = ({ children, ...props }) => {
  const [isShowing, setIsShowing] = useState(false);
  // const { toggleRemBtn } = useAccordionContext();

  const handleShow = () => {
    setIsShowing(true);
  };
  const handleClose = (mids) => {
    setIsShowing(false);
  };

  return (
    // add context to compare to activekey, if match add active class for triangle button turn. children[2] adds active class

    <div className="c-accordion__header">
      <div key={children[0].leagueId} {...props}>
        <div>
          <div className="e-leagueImage">
            <img
              className="u-img-rounded"
              id="e-leagueIcon"
              src={
                !children[0].leagueIcon == ""
                  ? `https://avp-backend.com/` + children[0].leagueIcon
                  : lIcon
              }
            />
          </div>
          <button
            className={
              children[1]
                ? `c-accordion__btn e-btn__league c-accordion__btn--centeredSmall ` +
                  children[1]
                : `c-accordion__btn e-btn__league c-accordion__btn--centeredSmall ` +
                  children[2]
            }
          >
            {children[0].leagueName}
          </button>
        </div>
      </div>
      <div className="c-textBtnContainer">
        <span
          className={`e-btn__plus tooltip--top`}
          aria-label="Add managers from pool to league."
          onClick={handleShow}
        >
          <span className="e-plustext">+ </span>
          Add Manager
        </span>
        <Modal
          mtype={"c-addManagerModal"}
          value={isShowing}
          onClose={handleClose}
        >
          <MgrModalContent
            league={children[0].leagueId}
            onConfirm={handleClose}
          />
        </Modal>
      </div>
    </div>
  );
};

export default AdminHeader;
