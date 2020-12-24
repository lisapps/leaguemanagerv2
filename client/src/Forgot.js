import React, { useState } from "react";
import { AuthContext } from "./App";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import dotenv from "dotenv";

dotenv.config();
var server = process.env.API_URL;

export const Forgot = () => {
  const { dispatch } = React.useContext(AuthContext);
  const initialstate = {
    emailId: "",
    isSubmitting: false,
    errorMessage: null,
  };
  const [data, setData] = useState(initialstate);
  const handleInputChange = (event) => {
    setData({
      // spread the data
      ...data,
      // go thru keys, assign new values by input name
      [event.target.name]: event.target.value,
    });
  };
  const handleForgotSubmit = (event) => {
    event.preventDefault();
    setData({
      ...data,
      isSubmitting: true,
      errorMessage: null,
    });

    const notify = () =>
      toast.dark("Password reset email has been sent.", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: false,
        progress: undefined,
      });

    axios({
      method: "post",
      url: server + "/forgotpass",
      data: {
        emailId: data.emailId,
      },
    })
      .then((res) => {
        if (res.data.status == "Success") {
          // setSnack(true);
          notify();
          setTimeout(function () {
            window.location = "/";
          }, 5200);
        }
        throw res;
      })
      .then((resJson) => {
        //redirect?
      })
      .catch((error) => {
        setData({
          ...data,
          isSubmitting: false,
          errorMessage:
            (error.data
              ? error.data.status
              : "No data loaded. Try logging in again.") || error.statusText,
        });
      });
  };
  return (
    <section className={`l-content l-content--signin`}>
      <div className={`l-content__row`}>
        <div className={`u-card c-signin-form`}>
          <div className="e-signinLogo"></div>
          <p className={`e-greet u-align__text--center`}>HELLO!</p>
          <form id="e-signin-form" onSubmit={handleForgotSubmit}>
            <input
              type="text"
              name="emailId"
              placeholder="Email"
              value={data.emailId}
              onChange={handleInputChange}
              required
            />
            {data.errorMessage && (
              <span className={`e-error u-align__text--center`}>
                {data.errorMessage}
              </span>
            )}
            <button
              className={`e-btn--lg u-align__button--center`}
              disabled={data.isSubmitting}
            >
              {data.isSubmitting ? "Loading..." : "Send Password"}
            </button>
          </form>
        </div>
      </div>
      <ToastContainer />
    </section>
  );
};

export default Forgot;
