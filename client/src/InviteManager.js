import React, { useState, useEffect } from "react";
import axios from "axios";
import useForm from "./components/forms/useForm";
import validate from "./components/forms/FormValidation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useHistory } from "react-router-dom";
import dotenv from "dotenv";
import { AuthContext } from "./App";
import Cookies from "universal-cookie";

dotenv.config();
var server = process.env.API_URL;

const InviteManager = () => {
  const { dispatch } = React.useContext(AuthContext);
  const cookies = new Cookies();

  var authcookie = cookies.get("lmtoken");

  if (authcookie == undefined)
    dispatch({
      type: "LOGOUT",
    });

  //any validation and errors are local form errors, not this state
  const {
    values,
    errors,
    handleChange,
    handleSubmit,
    resetForm,
    handleClear,
  } = useForm(sendForm, validate);

  //form response data

  const initialstate = {
    isSubmitting: false,
    errorMessage: null,
  };
  const [data, setData] = useState(initialstate);

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

  let history = useHistory();

  const handleCancel = (e) => {
    resetForm();
    history.push("/admin");
  };

  const inviteChange = (e) => {
    handleChange(e);
    setData({
      ...data,
      errorMessage: null,
    });
  };

  function sendForm(e) {
    setData({
      ...data,
      isSubmitting: true,
    });

    //axios stuff here
    axios({
      method: "post",
      url: server + "/invite-manager",
      data: {
        emailId: values.emailId,
      },
      withCredentials: true,
    })
      .then((res) => {
        if (res.data.status == "Success") {
          setData({
            ...data,
            isSubmitting: false,
          });
          notify("Manager invitation was sent.");
          setTimeout(function () {
            history.push("/admin");
          }, 4200);
        } else {
          throw res;
        }
      })
      .catch((error) => {
        // notify("There was a problem sending the invitation.");
        setData({
          ...data,
          isSubmitting: false,
          errorMessage:
            (error.data ? error.data.message : null) || error.statusText,
        });
      });
  }

  return (
    <>
      <div className="l-main">
        <div
          className={`l-content__flexContainer l-content__flexContainer--row justify-space-between`}
        ></div>
        <section className="c-createForm">
          <form id="c-createForm" onSubmit={handleSubmit}>
            <p className="u-component_labels">Contact</p>
            <div
              className={`l-content__flexContainer--left--SectionCard u-card`}
            >
              {errors.emailId && (
                <li className="e-createForm__error--message u-align__text--right">
                  <div className="e-createForm__label.e-createForm__label--error">
                    {errors.emailId}
                  </div>
                </li>
              )}
              <li className="e-createForm__liEntry">
                <label
                  className={`e-createForm__label e-createForm__label--email`}
                >
                  Email *
                </label>
                <input
                  className="e-createForm__text"
                  id="e-createForm__text--email"
                  type="text"
                  name="emailId"
                  onChange={(event) => inviteChange(event)}
                  value={values.emailId || ""}
                />
              </li>
            </div>
          </form>
          <ToastContainer />
          <div className={`l-content__flexContainer--right u-mt25`}>
            {data.errorMessage && (
              <li className="e-createForm__error--message u-align__text--right">
                <div className="e-createForm__label.e-createForm__label--error">
                  {data.errorMessage}
                </div>
              </li>
            )}
          </div>
        </section>
        <span
          className={`l-content__flexContainer--right u-sticky__bottomBtns`}
        >
          <button
            className={`e-btn--small e-btn--secondary`}
            onClick={handleCancel}
            type="button"
          >
            cancel
          </button>
          <button
            className="e-btn--small"
            type="submit"
            form="c-createForm"
            disabled={data.isSubmitting}
          >
            {data.isSubmitting ? "Sending..." : "Invite"}
          </button>
        </span>
      </div>
    </>
  );
};

export default InviteManager;
