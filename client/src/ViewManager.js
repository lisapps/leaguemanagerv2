import React, { useState, useEffect } from "react";
import axios from "axios";
import useForm from "./components/forms/useForm";
import validate from "./components/forms/FormValidation";
import { ToastContainer, toast } from "react-toastify";
import { AuthContext } from "./App";
import "react-toastify/dist/ReactToastify.css";
import managerImg from "../public/images/icons/icons-photo-person.svg";
import { useHistory } from "react-router-dom";
import NumberFormat from "react-number-format";
import Dialog from "./components/Dialog";
import dotenv from "dotenv";
import Cookies from "universal-cookie";

dotenv.config();
var server = process.env.API_URL;

const ViewManager = () => {
  const { dispatch } = React.useContext(AuthContext);
  const cookies = new Cookies();
  var authcookie = cookies.get("lmtoken");

  if (authcookie == undefined)
    dispatch({
      type: "LOGOUT",
    });

  const [image, setImage] = useState({ preview: managerImg, raw: "" });
  const initialstate = {
    manager: [],
    isSubmitting: false,
    isLoading: true,
    errorMessage: null,
  };
  const [data, setData] = useState(initialstate);
  // toggles "edit" and "view" modes of team
  const [view, setView] = useState("view");
  //any validation and errors are form errors displayed in DOM from validate.js, not this state
  const {
    values,
    errors,
    handleChange,
    handleSubmit,
    resetForm,
    initVals,
    handleClear,
  } = useForm(sendForm, validate);

  let history = useHistory();

  useEffect(() => {
    axios(server + "/manager-edit", {
      withCredentials: true,
    })
      .then((res) => {
        if (res.data.status == "Success") {
          setData({
            // don't set manager data directly. share with form initvals
            manager: initValsFromAPI(res.data),
            isLoading: false,
            errorMessage: false,
          });
        } else {
          throw res;
        }
      })
      .catch((error) => {
        console.error("manager data failed:", error);
        setData({
          isLoading: false,
          errorMessage:
            (error.data
              ? error.data.status
              : "No manager was loaded to show. Please go back and try again.") ||
            error.statusText,
        });
        setTimeout(function () {
          history.push("/admin");
        }, 3000);
      });
  }, []);

  const initValsFromAPI = (data) => {
    if (data) {
      // sets values used in form state
      let vals = {
        firstName: data.firstName,
        lastName: data.lastName,
        emailId: data.email,
        contact: data.contact,
        zip: data.zip,
        password: "",
        passwordConfirm: "",
      };
      // fields will set the state data for prefilled form
      let fields = {
        profilePic: data.profilePic,
        firstName: data.firstName,
        lastName: data.lastName,
        emailId: data.email,
        contact: data.contact,
        zip: data.zip,
      };
      initVals(vals);
      return fields;
    }
  };

  const handleEdit = () => {
    setView("edit");
  };

  const [showDialog, setShowDialog] = useState(false);
  const handleDialogShow = () => setShowDialog(true);
  const handleDialogClose = () => setShowDialog(false);

  const handleDelete = () => {
    handleDialogShow();
  };

  const sendDelete = () => {

    handleDialogClose();

    axios(server + "/delete-manager", {
      withCredentials: true,
    })
      .then((res) => {

        if (res.data.status == "Success") {
          setData({
            ...data,
            isSubmitting: false,
          });
          notify("Manager deleted!");

          setTimeout(function () {
            history.push("/admin");
          }, 4200);
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

  const handleImageChange = (e) => {
    if (e.target.files.length) {
      if (e.target.files[0].size > 700000) {
        notify("Image too large! Must be less than 700k.");
      } else {
        setImage({
          preview: URL.createObjectURL(e.target.files[0]),
          raw: e.target.files[0],
        });
      }
    }
  };

  const handleCancel = (e) => {
    setView("view");
  };

  function sendForm(e) {
    var objVals;
    if (values.password !== "") {
      objVals = {
        firstName: values.firstName,
        lastName: values.lastName,
        contact: values.contact,
        emailId: values.emailId,
        zip: values.zip,
        password: values.password,
      };
    } else {
      objVals = {
        firstName: values.firstName,
        lastName: values.lastName,
        contact: values.contact,
        emailId: values.emailId,
        zip: values.zip,
      };
    }

    setData({
      ...data,
      isSubmitting: true,
    });

    const formData = new FormData();

    let _keys = Object.keys(objVals);
    let a = 0;

    for (a = _keys.length - 1; a >= 0; a--) {
      formData.set(_keys[a], objVals[_keys[a]]);
    }

    // only add image to formdata if added or changed
    // appending formData DOES NOT WORK. Must set.
    image.raw && formData.set("pic", image.raw);

    //axios stuff here
    axios({
      method: "post",
      url: server + "/manager-edit",
      data: formData,
      headers: {
        "content-type": "multipart/form-data",
      },
      withCredentials: true,
    })
      .then((res) => {
        if (res.data.status == "Success") {
          setData({
            ...data,
            isSubmitting: false,
          });
          notify("Profile updated!");

          setTimeout(function () {
            dispatch({
              type: "LOGOUT",
            });
            history.push("/");
          }, 4200);
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

  if (data.isLoading) return "Loading...";
  if (data.errorMessage) return `Something went wrong: ${data.errorMessage}`;
  if (data.manager && view == "view")
    return (
      <div className="l-main">
        <section className={`l-content c-viewForm u-mt40`}>
          <div id="c-viewForm">
            <div
              className={`l-content__flexContainer u-mb25 l-content__flexContainer--row`}
            >
              <div className={`l-content__flexContainer--column`}>
                <img
                  className="e-viewForm__imgUploadIcon"
                  src={
                    data.manager.profilePic
                      ? "https://avp-backend.com/" + data.manager.profilePic
                      : managerImg
                  }
                  height="200"
                  alt="Manager Image"
                />
              </div>
              <div className={`l-content__flexContainer--column`}>
                <div className={`e-viewForm__name e-viewForm__name--first`}>
                  {data.manager.firstName}
                </div>
                <div className={`e-viewForm__name e-viewForm__name--last`}>
                  {data.manager.lastName}
                </div>
              </div>
            </div>
          </div>
          <p className="u-component_labels">Contact</p>
          <div className={`l-content__flexContainer--left--SectionCard u-card`}>
            <li className="e-viewForm__liEntry">
              <label
                className={`e-viewForm__label e-viewForm__label--location`}
              >
                Zip
              </label>
              <div className="e-viewForm__text" id="e-viewForm__text--location">
                {data.manager.zip}
              </div>
            </li>
            <li className="e-viewForm__liEntry">
              <label className={`e-viewForm__label e-viewForm__label--phone`}>
                Phone
              </label>
              <div className="e-viewForm__text" id="e-viewForm__text--phone">
                {data.manager.contact}
              </div>
            </li>
            <li className="e-viewForm__liEntry">
              <label className={`e-viewForm__label e-viewForm__label--email`}>
                Email
              </label>
              <div className="e-viewForm__text" id="e-viewForm__text--email">
                {data.manager.emailId}
              </div>
            </li>
          </div>
          <div className={`l-content__flexContainer--right u-mt25`}>
            <button
              className="e-btn--small"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleEdit();
              }}
            >
              Edit
            </button>
            <button
              className="e-btn--small"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
            >
              {data.isSubmitting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </section>
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
                sendDelete();
              },
              type: "primary",
            },
          ]}
          heading={"Are you sure?"}
          content={"This will DELETE the manager completely."}
        />
      </div>
    );
  if (data.manager && view == "edit")
    return (
      <>
        <div
          className={`l-content__flexContainer l-content__flexContainer--row justify-space-between`}
        ></div>
        <section className="l-content c-createForm">
          <form id="c-createForm" onSubmit={handleSubmit}>
            <div
              className={`l-content__flexContainer u-mb25 l-content__flexContainer--row`}
            >
              <div className="l-content__flexContainer--column">
                <img
                  src={
                    data.manager.profilePic !== ""
                      ? "https://avp-backend.com/" + data.manager.profilePic
                      : image.preview
                  }
                  className="e-input__imgUploadIcon"
                  height="200"
                  alt="Image preview"
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
                  value={""}
                />
              </div>
              <div className="l-content__flexContainer--column">
                <div
                  className={`l-content__flexContainer l-content__flexContainer--row u-mt10`}
                >
                  <input
                    className={`e-input__name e-input__name--first`}
                    name="firstName"
                    id="e-createForm__firstName"
                    type="text"
                    placeholder="first name *"
                    required
                    onChange={handleChange}
                    value={values.firstName}
                  />
                  <button
                    className="e-close"
                    type="button"
                    onClick={() => {
                      handleClear("firstName");
                    }}
                  ></button>
                </div>
                <div
                  className={`l-content__flexContainer l-content__flexContainer--row u-mt10`}
                >
                  <input
                    className={`e-input__name e-input__name--last`}
                    name="lastName"
                    id="e-createForm__lastName"
                    type="text"
                    placeholder="last name"
                    required
                    onChange={handleChange}
                    value={values.lastName}
                  />
                  <button
                    className="e-close"
                    type="button"
                    onClick={() => {
                      handleClear("lastName");
                    }}
                  ></button>
                </div>
              </div>
            </div>
            <p className="u-component_labels">Contact</p>
            <div
              className={`l-content__flexContainer--left--SectionCard u-card`}
            >
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
                  value={values.zip}
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
                  className={`js-phone e-createForm__text`}
                  name="contact"
                  onChange={handleChange}
                  value={values.contact}
                />
              </li>
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
                  onChange={handleChange}
                  value={values.emailId}
                />
              </li>
            </div>
            <p className="u-component_labels">Change Password (optional)</p>
            <p>
              Choose at least 8 characters, with 1 uppercase letter which is not
              the first letter used, at least 1 special character, and at least
              1 number
            </p>
            <div
              className={`l-content__flexContainer--left--SectionCard u-card`}
            >
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
                  >
                    New Password
                  </label>
                  <input
                    className={`e-createForm__text`}
                    id="e-input__text--password"
                    type="password"
                    name="password"
                    title="Choose at least 8 characters, with 1 uppercase letter which is not the first letter, at least 1 special character, and at least 1 number."
                    name="password"
                    onChange={handleChange}
                    value={values.password}
                  />
                </li>
              </div>
              <div className="c-form__password">
                <li
                  className={`e-createForm__error--message u-align__text--right`}
                >
                  <div
                    className={`e-createForm__label e-createForm__label--error`}
                  ></div>
                </li>
                <li className="e-createForm__liEntry">
                  <label
                    className={`e-createForm__label e-createForm__label--passwordConfirm`}
                  >
                    Confirm Password
                  </label>
                  <input
                    className="e-createForm__text"
                    id="e-input__text--passwordConfirm"
                    type="password"
                    title="Confirm password."
                    name="passwordConfirm"
                    onChange={handleChange}
                    value={values.passwordConfirm}
                  />
                </li>
              </div>
            </div>
          </form>
          <ToastContainer />
        </section>

        {data.errorMessage && (
          <li className="e-createForm__error--message u-align__text--right">
            <div className="e-createForm__label.e-createForm__label--error">
              {data.errorMessage}
            </div>
          </li>
        )}
        <div className={`l-content__flexContainer--right u-sticky__bottomBtns`}>
          <button
            className={`e-btn--small e-btn--secondary`}
            onClick={handleCancel}
            type="button"
            disabled={data.isSubmitting}
          >
            cancel
          </button>
          <button
            className="e-btn--small"
            type="submit"
            form="c-createForm"
            disabled={data.isSubmitting}
          >
            {data.isSubmitting ? "Sending..." : "Save"}
          </button>
        </div>
      </>
    );
};

export default ViewManager;
