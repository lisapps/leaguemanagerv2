import React, { useState, useEffect } from "react";
import useForm from "./components/forms/useForm";
import validate from "./components/forms/FormValidation";
import axios from "axios";
import { AuthContext } from "./App";
import NumberFormat from "react-number-format";
import person from "../public/images/icons/icons-photo-person.svg";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useHistory } from "react-router-dom";
import dotenv from "dotenv";

dotenv.config();
var server = process.env.API_URL;

const CompleteProfile = () => {
  const {
    values,
    errors,
    handleChange,
    handleSubmit,
    resetForm,
    initVals,
  } = useForm(sendForm, validate);
  const { loginState } = React.useContext(AuthContext);
  const [image, setImage] = useState({ preview: person, raw: "" });

  let history = useHistory();

  //form response data
  const initialstate = {
    isSubmitting: false,
    errorMessage: null,
  };
  const [data, setData] = useState(initialstate);

  //set init form vals for required field checking
  useEffect(() => {
    if (Object.entries(values).length === 0) {
      let fields = {
        firstName: "",
        lastName: "",
        contact: "",
        // emailId: "",
        password: undefined,
        zip: "",
      };
      initVals(fields);
    }
  }, [values]);

  function sendForm(e) {
    values.contact = values.contact.replace(/\D/g, "");

    var objVals = {
      firstName: values.firstName,
      lastName: values.lastName,
      contact: values.contact,
      emailId: loginState.email,
      password: values.password,
      zip: values.zip,
    };

    const formData = new FormData();

    let _keys = Object.keys(objVals);
    let a = 0;

    for (a = _keys.length - 1; a >= 0; a--) {
      formData.set(_keys[a], objVals[_keys[a]]);
    }

    // appending formData DOES NOT WORK. Must set.
    image.raw && formData.set("pic", image.raw);

    //axios stuff here
    axios({
      method: "post",
      url: server + "/complete-profile",
      data: formData,
      headers: {
        "content-type": "multipart/form-data",
      },
      withCredentials: true,
    })
      .then((res) => {
        if (res.data.status == "Success") {
          notifySuccess();
          document.cookie = "lmtoken=; 01 Jan 1970 00:00:00 UTC; path=/;";
          setTimeout(function () {
            history.push("/");
          }, 5200);
        } else {
          throw res;
        }
      })
      .catch((error) => {
        setData({
          ...data,
          isSubmitting: false,
          errorMessage:
            (error.data ? error.data.message : null) || error.statusText,
        });
      });
  }

  const notify = () =>
    toast.dark("Image too large! Must be less than 700k.", {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: false,
      progress: undefined,
    });

  const notifySuccess = () =>
    toast.dark("Profile saved successfully.", {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: false,
      progress: undefined,
    });

  const handleImageChange = (e) => {
    if (e.target.files.length) {
      if (e.target.files[0].size > 700000) {
        notify();
      } else {
        setImage({
          preview: URL.createObjectURL(e.target.files[0]),
          raw: e.target.files[0],
        });
      }
    }
  };

  return (
    <section className={`c-createForm`}>
      <div className={`u-large_body u-text--center u-mb25 u-mt40`}>
        You must complete your profile before using the League Manager App.
      </div>
      <form id="c-createForm" onSubmit={handleSubmit}>
        <div className={`l-content__flexContainer u-mb25 u-mt40`}>
          <div
            className={`l-content__flexContainer l-content__flexContainer--column`}
          >
            <img
              src={image.preview}
              className="e-input__imgUploadIcon"
              height="200"
              alt="Image default"
              onClick={() => {
                document.getElementById("e-input__fileUpload").click();
              }}
            />

            <label
              htmlFor="Upload"
              className="e-input__imgLabel"
              onClick={() => {
                document.getElementById("e-input__fileUpload").click();
              }}
            >
              Upload Photo
            </label>
            <input
              id="e-input__fileUpload"
              name="profilePic"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              value={values.profilePic}
            />
          </div>

          <div className="l-content__flexContainer--column">
            <div
              className={`l-content__flexContainer l-content__flexContainer--row u-mt10`}
            >
              <input
                className={`e-input__name e-input__name--first`}
                id="e-input__firstName"
                type="text"
                name="firstName"
                placeholder="first name"
                onChange={handleChange}
                value={values.firstName || ""}
                required
              />
            </div>
            <div
              className={`l-content__flexContainer l-content__flexContainer--row u-mt10`}
            >
              <input
                className={`e-input__name e-input__name--last`}
                id="e-input__lastName"
                type="text"
                name="lastName"
                placeholder="last name"
                onChange={handleChange}
                value={values.lastName || ""}
                required
              />
            </div>
          </div>
        </div>
        <p className="u-component_labels">Contact</p>
        <div className={`l-content__flexContainer--left--SectionCard u-card`}>
          {errors.zip && (
            <li className="e-createForm__error--message u-align__text--right">
              <div className="e-createForm__label.e-createForm__label--error">
                {errors.zip}
              </div>
            </li>
          )}
          <li className="e-createForm__liEntry">
            <label
              className={`e-createForm__label e-createForm__label--location`}
            >
              Zip *
            </label>
            <input
              className="e-createForm__text"
              id="e-createForm__text--zip"
              type="text"
              name="zip"
              onChange={handleChange}
              value={values.zip || ""}
            />
          </li>
          {errors.contact && (
            <li className="e-createForm__error--message u-align__text--right">
              <div className="e-createForm__label.e-createForm__label--error">
                {errors.contact}
              </div>
            </li>
          )}
          <li className="e-createForm__liEntry">
            <label
              className={`e-createForm__label e-createForm__label--phone js-phone`}
            >
              Phone *
            </label>
            <NumberFormat
              format="(###) ###-####"
              type="tel"
              mask="_"
              className={`js-phone e-createForm__text e-createForm__text--noborder`}
              name="contact"
              onChange={handleChange}
              value={values.contact || ""}
            />
          </li>
          <li className="e-createForm__liEntry">
            <label className={`e-createForm__label e-createForm__label--email`}>
              Email
            </label>
            <div className="e-viewForm__text">{loginState.email}</div>
          </li>
        </div>
        <p></p>
        <p className="u-component_labels">Security</p>
        <p>
          Choose at least 8 characters, with 1 uppercase letter which is not the
          first letter used, at least 1 special character, and at least 1 number
        </p>
        <div className={`l-content__flexContainer--left--SectionCard u-card`}>
          <div className="c-form__password">
            {errors.password && (
              <li className="e-createForm__error--message u-align__text--right">
                <div className="e-createForm__label.e-createForm__label--error">
                  {errors.password}
                </div>
              </li>
            )}
            <li className="e-createForm__liEntry">
              <label
                className={`e-createForm__label e-createForm__label--password`}
              ></label>
              <input
                id="e-input__text--password"
                className="e-createForm__text"
                type="password"
                name="password"
                minLength="8"
                title="Choose at least 8 characters, with 1 uppercase letter which is not the first letter, at least 1 special character, and at least 1 number."
                value={values.password || ""}
                onChange={handleChange}
              />
            </li>
          </div>
          <div className="c-form__password">
            <li className="e-createForm__liEntry">
              <label
                className={`e-createForm__label e-createForm__label--password`}
              ></label>
              <input
                id="e-input__text--passwordConfirm"
                className="e-createForm__text"
                type="password"
                name="passwordConfirm"
                minLength="8"
                title="Confirm password."
                value={values.passwordConfirm || ""}
                onChange={handleChange}
              />
            </li>
          </div>
        </div>
        <div className={`l-content__flexContainer--right u-mt15`}>
          {data.errorMessage && (
            <li className="e-createForm__error--message u-align__text--right">
              <div className="e-createForm__label.e-createForm__label--error">
                {data.errorMessage}
              </div>
            </li>
          )}
          <button
            className={`e-btn--small e-btn--secondary`}
            onClick={resetForm}
            disabled={data.isSubmitting}
          >
            cancel
          </button>
          <button
            className="e-btn--small"
            type="submit"
            disabled={data.isSubmitting}
          >
            {data.isSubmitting ? "Sending..." : "Save"}
          </button>
        </div>
      </form>
      <ToastContainer />
    </section>
  );
};

export default CompleteProfile;
