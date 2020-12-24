import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import mgrImg from "../../../public/images/icons/icons-photo-person.svg";
import { setCookie } from "../../libs/cookie";
import { useAccordionContext } from "../Accordion/hooks";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import dotenv from "dotenv";

dotenv.config();
var server = process.env.API_URL;

const AdminAccBody = ({ children, ...props }) => {
  let history = useHistory();

  const initialstate = {
    managersList: children.managersList,
    isLoading: true,
    isSubmitting: false,
    errorMessage: false,
  };
  const [data, setData] = useState(initialstate);
  const { updateCollapse, onChangeBody, removeBtn } = useAccordionContext();

  const useUpdateCollapse = (s) => {
    onChangeBody(s);
  };

  useEffect(() => {
    setData({
      ...data,
      managersList: children.managersList,
      isSubmitting: false,
    });
  }, [children]);

  function removeManager(id) {
    setData({
      ...data,
      isSubmitting: true,
    });
    axios({
      method: "post",
      url: server + "/removeManagers",
      data: {
        lId: children.leagueId,
        mId: id,
      },
      withCredentials: true,
    })
      .then((res) => {
        if (res.data.status == "Success") {
          notify("Manager was removed from the league.");
          onChangeBody(!updateCollapse);
        } else {
          throw res;
        }
      })
      .catch((error) => {
        console.error("removing manager failed:", error);
        notify("Manager was not removed.");
        setData({
          ...data,
          isSubmitting: false,
        });
      });
  }

  const handleRemove = (tid) => {
    removeManager(tid);
    useUpdateCollapse(false);
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

  if (
    data.managersList.length == 0 &&
    data.isLoading == false &&
    data.errorMessage == false
  )
    return (
      <div
        className={`l-content__flexContainer--center u-h3_inactive c-accordion__panel--empty`}
      >
        No mangers found. Click + ADD MANAGER to get started
      </div>
    );
  if (data.managersList !== [])
    return (
      <div
        className={`c-accordion__panel c-card c-managerTable u-animated u-animated--faster a-fadeIn ${
          removeBtn ? "remove-active" : ""
        }`}
      >
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
            <span></span>
          </div>
        </div>
        {data.managersList.map((mngr) => (
          <div className="c-managerTable__listing" key={mngr.managerId}>
            <div className="c-managerTable__listing__item ">
              <img
                className="u-img-rounded"
                src={
                  mngr.profilePic
                    ? "https://avp-backend.com/" + mngr.profilePic
                    : mgrImg
                }
              />
              <span
                className="c-managerTable__cell"
                aria-label="Manager Last Name"
              >
                {mngr.firstName}
              </span>
            </div>
            <div className="c-managerTable__listing__item">
              <span aria-label="Last Name">{mngr.lastName}</span>
            </div>
            <div className="c-managerTable__listing__item">
              <span aria-label="Location">
                {mngr.city + ", " + mngr.stateCode}
              </span>
            </div>
            <div className="c-managerTable__listing__item">
              <button
                className="e-btn--admManagers"
                aria-label="Remove manager"
                onClick={() => handleRemove(mngr.managerId)}
                disabled={data.isSubmitting}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        <ToastContainer />
      </div>
    );
};

export default AdminAccBody;
