import React, { useState, useRef } from "react";
import axios from "axios";
import { LeaguesContext } from "../hooks/LeaguesContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from "./Modal/Modal";
import MergeModalContent from "./MergeModalContent";
import Dialog from "./Dialog";
import teamAddIcon from "../../public/images/icons/team-add.svg";
import teamImg from "../../public/images/icons/icons-photo-team.svg";
import mergeLine from "../../public/images/icons/merge.svg";
import dotenv from "dotenv";

const MergeTab = ({ onMerge }) => {
  dotenv.config();
  var server = process.env.API_URL;
  const bes = "https://avp-backend.com/";
  const initState = {
    isSubmitting: false,
    errorMessage: null,
    sourceBtn: null,
    pTeam: null,
    pImg: null,
    pName: null,
    cTeam: null,
    cImg: null,
    cName: null,
  };

  const { selectedLeague } = React.useContext(LeaguesContext);
  const [isShowing, setIsShowing] = useState(false);
  // this modal state is handled differently than other places bc of too many re-renders.
  const [modalState, setModalState] = useState(initState);
  const [showDialog, setShowDialog] = useState(false);
  const mergeArr = useRef;
  mergeArr.current = [modalState.pTeam, modalState.cTeam];

  const notify = (txt) =>
    toast.dark(txt, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: false,
      progress: undefined,
    });

  const handleMMShow = (source) => {
    if (selectedLeague[0].leagueStatus == 3) {
      notify("You can't merge teams in an active league.");
    } else {
      setModalState({ ...modalState, sourceBtn: source });
      setIsShowing(true);
    }
  };

  const handleMMClose = () => {
    setIsShowing(false);
  };

  const handleDialogShow = () => setShowDialog(true);
  const handleDialogClose = () => setShowDialog(false);

  const handleClickMerge = () => {
    handleDialogShow();
  };

  const handleConfirmMerge = () => {
    handleDialogClose();
    sendMergeTeams();
  };

  const clearSelections = () => {
    setModalState(initState);
  };

  function handleAddMergeTeam(t, i, n) {
    if (modalState.sourceBtn == "parent")
      setModalState({
        ...modalState,
        pTeam: t,
        pImg: i !== "" ? bes + i : "",
        pName: n,
      });
    if (modalState.sourceBtn == "child")
      setModalState({
        ...modalState,
        cTeam: t,
        cImg: i !== "" ? bes + i : "",
        cName: n,
      });
    handleMMClose();
  }

  function sendMergeTeams() {
    if (mergeArr.current.length == 2)
      setModalState({ ...modalState, isSubmitting: true });
    axios({
      method: "post",
      url: server + "/mergeTeams",
      data: {
        teams: mergeArr.current,
      },
      withCredentials: true,
    })
      .then((res) => {
        if (res.data.status == "Success") {
          setModalState({ ...modalState, isSubmitting: false });
          notify("Teams merged successfully.");
          setTimeout(function () {
            onMerge();
          }, 5200);
        } else {
          throw res;
        }
      })
      .catch((error) => {
        setModalState({
          ...modalState,
          isSubmitting: false,
          errorMessage: error,
        });
        console.error("adding teams failed:", error);
        notify("Merging Teams Failed.");
        setTimeout(function () {
          onMerge();
        }, 5200);
      });
  }

  return (
    <>
      <div
        className={`l-content__flexContainer l-content__flexContainer--center u-mt35`}
      >
        <div className={`c-card c-card__xxs`}>
          <div className={`l-content__flexContainer--center`}>
            <span className={`u-small_label u-mt15 u-mb15`}>Main Team</span>
          </div>
          <div className={`l-content__flexContainer--center`}>
            <span
              className={`u-mb25 js-modalBtn`}
              id="js-merge1"
              onClick={() => handleMMShow("parent")}
            >
              <img
                className={`e-mergeModalOpener`}
                id="js-mergeImg1"
                src={
                  modalState.pImg == null
                    ? teamAddIcon
                    : modalState.pImg == ""
                    ? teamImg
                    : modalState.pImg
                }
              />
            </span>
          </div>
          <div className={`l-content__flexContainer--center`}>
            <span className={`u-small_label u-mt15 u-mb15`}>
              {modalState.pName || ""}
            </span>
          </div>
        </div>
      </div>
      <div
        className={`l-content__flexContainer l-content__flexContainer--center`}
      >
        <img id="js-mergeImg1" height="60px" src={mergeLine} />
      </div>
      <div
        className={`l-content__flexContainer l-content__flexContainer--center u-mb25`}
      >
        <div className={`c-card c-card__xxs`}>
          <div className={`l-content__flexContainer--center`}>
            <span className={`u-small_label u-mt15 u-mb15`}>Merge Team</span>
          </div>
          <div className={`l-content__flexContainer--center`}>
            <span
              className={`u-mb25 js-modalBtn`}
              onClick={() => handleMMShow("child")}
              id="js-merge2"
            >
              <img
                className={`e-mergeModalOpener`}
                id="js-mergeImg2"
                src={
                  modalState.cImg == null
                    ? teamAddIcon
                    : modalState.cImg == ""
                    ? teamImg
                    : modalState.cImg
                }
              />
            </span>
          </div>
          <div className={`l-content__flexContainer--center`}>
            <span className={`u-small_label u-mt15 u-mb15`}>
              {modalState.cName || ""}
            </span>
          </div>
        </div>
      </div>
      {modalState.pTeam !== null && modalState.cTeam !== null ? (
        <div
          className={`l-content__flexContainer l-content__flexContainer--right u-mt40`}
          id="js-mergeFormBtns"
        >
          <button
            className={`e-btn--small e-btn--secondary js-cancelMerge`}
            onClick={(e) => {
              e.preventDefault();
              clearSelections();
            }}
            disabled={modalState.isSubmitting}
          >
            cancel
          </button>
          <button
            className="e-btn--small"
            onClick={(e) => {
              e.preventDefault();
              handleClickMerge();
            }}
            disabled={modalState.isSubmitting}
          >
            {modalState.isSubmitting ? "Sending..." : "Confirm"}
          </button>
        </div>
      ) : (
        ""
      )}
      <Modal mtype={"c-addTeamModal"} value={isShowing} onClose={handleMMClose}>
        <MergeModalContent onConfirm={handleAddMergeTeam} />
      </Modal>
      <ToastContainer />
      <Dialog
        show={showDialog}
        buttons={[
          {
            text: "cancel",
            action: handleDialogClose,
            type: "secondary",
          },
          {
            text: "confirm",
            action: () => {
              handleConfirmMerge();
            },
            type: "primary",
          },
        ]}
        heading={"Are you sure?"}
        content={
          "This will merge the teams, removing the child team completely."
        }
      />
    </>
  );
};

export default MergeTab;
