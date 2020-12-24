import React, { useState } from "react";
import { AuthContext } from "./App";
import Modal from "./components/Modal/Modal";
import TermsModalContent from "./components/TermsModalContent";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
var server = process.env.API_URL;

export const Signin = () => {
  const { dispatch } = React.useContext(AuthContext);
  const initialstate = {
    emailId: "",
    password: "",
    isSubmitting: false,
    errorMessage: null,
  };
  const [data, setData] = useState(initialstate);
  const [isShowing, setIsShowing] = useState(false);

  const handleInputChange = (event) => {
    setData({
      // spread the data
      ...data,
      // go thru keys, assign new values by input name
      [event.target.name]: event.target.value,
    });
  };

  const handleShow = () => {
    setIsShowing(true);
  };
  const handleClose = () => {
    setIsShowing(false);
  };
  
  const handleFormSubmit = (event) => {
    event.preventDefault();
    setData({
      ...data,
      isSubmitting: true,
      errorMessage: null,
    });

    axios({
      method: "post",
      url: server + "/signin",
      data: {
        username: data.emailId,
        password: data.password,
      },
    })
      .then((res) => {
        if (res.data.status == "Success") {
          return res.data;
        }
        throw res;
      })
      .then((resJson) => {
        dispatch({
          type: "LOGIN",
          payload: resJson,
        });
      })
      .catch((error) => {
        setData({
          ...data,
          isSubmitting: false,
          errorMessage:
            (error.data
              ? error.data.status
              : "Oops! We had a problem on our end. Please try again.") ||
            error.statusText,
        });
      });
  };
  
  return (
    <section className={`l-content l-content--signin`}>
      <div className={`l-content__row`}>
        <div className={`u-card c-signin-form`}>
          <div className="e-signinLogo"></div>
          <p className={`e-greet u-align__text--center`}>HELLO!</p>
          <form id="e-signin-form" onSubmit={handleFormSubmit}>
            <input
              type="text"
              name="emailId"
              placeholder="Email"
              value={data.emailId}
              onChange={handleInputChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={data.password}
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
              {data.isSubmitting ? "Loading..." : "Login"}
            </button>
          </form>
          <a href="/forgot">
            <p className={`e-passHelp u-align__text--center`}>
              Forgot Password?
            </p>
          </a>
        </div>
      </div>
      <div className="l-content__row">
        <p className={`js-modalBtn c-terms`} onClick={handleShow}>
          Terms and Conditions / Privacy Policy
        </p>
      </div>
      <p className="e-cookieMsg">
        *Please note that cookies must be enabled for this site to work
        properly.
      </p>
      <Modal mtype={"c-termsModal"} value={isShowing} onClose={handleClose}>
          <TermsModalContent
            onConfirm={handleClose}
          />
        </Modal>
      
    </section>
  );
};

export default Signin;
