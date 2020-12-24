import React, { useState, useEffect } from "react";
import axios from "axios";
import mngrImg from "../../public/images/icons/icons-photo-person.svg";
import { useAccordionContext } from "./Accordion/hooks";
import dotenv from "dotenv";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

dotenv.config();
var server = process.env.API_URL;

const MgrModalContent = ({ league, onConfirm }) => {
  const initialstate = {
    managers: [],
    isLoading: true,
    errorMessage: false,
  };

  const [modalData, setModalData] = useState(initialstate);
  const [addList, setAddList] = useState([]);
  const { updateCollapse, onChangeBody } = useAccordionContext();

  const useUpdateCollapse = (s) => {
    //passing updateCollapse and setUpdateCollapse state down from Admin.js. Triggers data update for whole page.

    onChangeBody(s);
  };

  const notify = (txt) =>
    toast.dark(txt, {
      position: "top-center",
      autoClose: 4000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: false,
      progress: undefined,
    });

  useEffect(() => {
    axios({
      method: "post",
      url: server + "/loadMgrModal",
      data: {
        lId: league,
      },
      withCredentials: true,
    })
      .then((res) => {
        if (res.data.status == "Success") {
          setModalData(res.data.leagueManagersOverlay);
        } else {
          throw res;
        }
      })
      .catch((error) => {
        console.error("manager modal failed:", error);
        setModalData({
          isLoading: false,
          errorMessage:
            (error.data
              ? error.data.status
              : "No data loaded. Try logging in again.") || error.statusText,
        });
      });
  }, []);

  function handleRemove(id) {
    const newManagers = modalData.filter((mngr) => mngr.managerId != id);
    setModalData(newManagers);
  }

  const addManager = (mId) => {
    handleRemove(mId);
    setAddList((addList) => [...addList, mId]);
  };

  const handleConfirm = () => {
    sendAddMngrs();
    onConfirm(addList);
    
    useUpdateCollapse(!updateCollapse);
  };

  const handleCancel = () => {
    setAddList([]);
    onConfirm();
  };

  function sendAddMngrs() {
    if (addList.length > 0)
      axios({
        method: "post",
        url: server + "/addManager",
        data: {
          lId: league,
          mIds: addList,
        },
        withCredentials: true,
      })
        .then((res) => {
          if (res.data.status == "Success") {
            notify("Manager added.");
          } else {
            throw res;
          }
        })
        .catch((error) => {
          console.error("adding managers failed:", error);
          notify("Manager wasn't added. There was a problem.");
        });
  }

  if (modalData.isLoading)
    return (
      <div
        className={`c-accordion__panel c-card c-teamTable u-animated u-animated--faster a-fadeIn`}
      >
        <div className="c-teamTable__header">
          <div className="c-teamTable__header__item">
            <span>First</span>
          </div>
          <div className="c-teamTable__header__item">
            <span>Players</span>
          </div>
          <div className="c-teamTable__header__item">
            <span>Status</span>
          </div>
          <div className="c-teamTable__header__item">
            <span>Payment</span>
          </div>
        </div>
        <div className={`c-teamTable__listing--reg u-table__listing--temp`}>
          <svg className="e-indicatorimg" xmlns="http://www.w3.org/2000/svg">
            <circle cx="14" cy="14" r="14" fill="#eeeeee"></circle>
          </svg>
          <div className="u-table__listing__item"></div>
          <div className="u-table__listing__item">
            <span className="e-playercount"></span>
          </div>
          <div className={`u-table__listing__item c-statusIndicator`}>
            <svg></svg>
            <span className="e-indicatorText"></span>
          </div>
          <div className={`u-table__listing__item c-statusIndicator`}>
            <svg></svg>
            <span className="e-indicatorText"></span>
          </div>
          <div className="u-table__listing__item"></div>
        </div>
      </div>
    );
  if (modalData.errorMessage)
    return `Something went wrong in the Mangers Modal: ${modalData.errorMessage}`;

  if (modalData && modalData.length == 0) {
    return (
      <div>
        <div className="c-teamTable__header">
          <div className="c-teamTable__header__item">
            <span>First</span>
          </div>
          <div className="c-teamTable__header__item">
            <span>Last</span>
          </div>
          <div className="c-teamTable__header__item">
            <span>Location</span>
          </div>
          <div className="c-teamTable__header__item">
            <span>Email</span>
          </div>
        </div>
        <div className="c-teamTable" id="c-teamTable__container">
          <div className="c-teamTable__listing">
            <span>NO TEAMS TO ADD</span>
          </div>
        </div>
      </div>
    );
  }
  if (modalData) {
    return (
      <>
        <div className="c-managerTable" id="c-managerTable__container">
          <div className="c-managerTable__header">
            <div className="c-managerTable__header__item">
              <span>First</span>
            </div>
            <div className="c-managerTable__header__item">
              <span>Last</span>
            </div>
            <div className="c-managerTable__header__item">
              <span>Location</span>
            </div>
            <div className="c-managerTable__header__item">
              <span>Email</span>
            </div>
          </div>
          {modalData.map((mngr) => (
            <div className="c-managerTable__listing" key={mngr.managerId}>
              <div className="c-managerTable__listing__item">
                <img
                  className="u-img-rounded"
                  src={
                    mngr.profilePic
                      ? "https://avp-backend.com/" + mngr.profilePic
                      : mngrImg
                  }
                  alt={mngr.firstName + " " + mngr.lastName}
                />
                <span className="c-managerTable__cell">{mngr.firstName}</span>
              </div>
              <div className="c-managerTable__listing__item">
                <span>{mngr.lastName}</span>
              </div>
              <div className={`c-managerTable__listing__item`}>
                {mngr.location}
              </div>
              <div className={`c-managerTable__listing__item`}>
                {mngr.emailId}
              </div>
              <div className="c-managerTable__listing__item">
                <button
                  className="e-btn__add"
                  onClick={() => addManager(mngr.managerId)}
                >
                  Add
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className={`l-content__row c-btnrow`}>
          <button
            className={`e-btn--small e-btn--secondary`}
            onClick={handleCancel}
          >
            cancel
          </button>
          <button className="e-btn--small" onClick={handleConfirm}>
            confirm
          </button>
        </div>
        <ToastContainer />
      </>
    );
  }
};

export default MgrModalContent;
