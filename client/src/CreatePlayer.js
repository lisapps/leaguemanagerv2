import React, { useState, useEffect, useCallback } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import LeagueSwitcher from "./components/LeagueSwitcher/LeagueSwitcher";
import { LeaguesContext } from "./hooks/LeaguesContext";
import useForm from "./components/forms/useForm";
import validate from "./components/forms/FormValidation";
import { setCookie } from "./libs/cookie";
import NumberFormat from "react-number-format";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import playerImg from "../public/images/icons/icons-photo-person.svg";
import {
  genderitems,
  sizeitems,
  sideitems,
  expitems,
  positems,
  domitems,
  heightitems,
} from "./components/forms/playerValues";
import DDmenu from "./components/DDmenu/DDmenu";
import dotenv from "dotenv";
import { AuthContext } from "./App";
import Cookies from "universal-cookie";

dotenv.config();
var server = process.env.API_URL;

const CreatePlayer = () => {
  const { dispatch } = React.useContext(AuthContext);
  const cookies = new Cookies();

  var authcookie = cookies.get("lmtoken");
  if (authcookie == undefined)
    dispatch({
      type: "LOGOUT",
    });

  const { selectedLeague } = React.useContext(LeaguesContext);

  //any validation and errors are local form errors, not this state
  const {
    values,
    errors,
    handleChange,
    handleDDChange,
    handleSubmit,
    resetForm,
    initVals,
    handleClear,
  } = useForm(sendForm, validate);

  //form response data
  const [image, setImage] = useState({ preview: playerImg, raw: "" });
  const initialstate = {
    isSubmitting: false,
    errorMessage: null,
  };

  const [data, setData] = useState(initialstate);

  // set init form vals for required field checking
  useEffect(() => {
    if (Object.entries(values).length === 0) {
      let fields = {
        firstName: "",
        lastName: "",
        emailId: "",
        contact: "",
        gender: "",
        dob: "",
        zip: "",
        education: "",
        medical: "",
        allergies: "",
        shirtSize: "",
        position: "",
        preferredSide: "",
        beachExperience: "",
        dominantHand: "",
        height: "",
      };
      initVals(fields);
    }
  }, [values]);

  const notify = () =>
    toast.dark("Image too large! Must be less than 700k.", {
      position: "top-center",
      autoClose: 4000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: false,
      progress: undefined,
    });

  const notifySuccess = () =>
    toast.dark("Player created.", {
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

  const setValFromDD = useCallback((field, val) => {
    handleDDChange(field, val);
  }, []);

  let history = useHistory();

  const handleCancel = (e) => {
    resetForm();
    history.push("/teams");
  };

  function sendForm(e) {

    setData({
      ...data,
      isSubmitting: true,
    });

    var fonString = values.contact;
    fonString = fonString.replace(/\D/g, "");

    function convertDate(date) {
      var _date_array = date.split("/");
      var _new_Date =
        _date_array[2] + "-" + _date_array[0] + "-" + _date_array[1];
      return _new_Date;
    }

    var objVals = {
      firstName: values.firstName,
      lastName: values.lastName,
      emailId: values.emailId,
      contact: fonString,
      gender: values.gender,
      dob: convertDate(values.dob),
      zip: values.zip,
      education: values.education,
      medical: values.medical,
      allergies: values.allergies,
      shirtSize: values.shirtSize,
      position: values.position,
      preferredSide: values.preferredSide,
      beachExperience: values.beachExperience,
      dominantHand: values.dominantHand,
      height: values.height,
      leagueId: selectedLeague[0].value,
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
      url: server + "/player-create",
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

          notifySuccess();
          setCookie("currentPid", res.data.avpId, 1);
          setTimeout(function () {
            history.push("/teams");
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

  // add loader
  if (!selectedLeague) return "..Loading";
  return (
    <>
      <div
        className={`l-content__flexContainer l-content__flexContainer--row justify-space-between`}
      >
        <LeagueSwitcher />
      </div>
      <section className="c-createForm">
        <form id="c-createForm" onSubmit={handleSubmit}>
          <div
            className={`l-content__flexContainer u-mb25 l-content__flexContainer--row`}
          >
            <div className="l-content__flexContainer--column">
              <img
                src={image.preview}
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
                value={values.profilePic}
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
                  value={values.firstName || ""}
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
                  value={values.lastName || ""}
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
          <p className="u-component_labels">General</p>
          <div className={`l-content__flexContainer--left--SectionCard u-card`}>
            {errors.dob && (
              <li className="e-createForm__error--message u-align__text--right">
                <div className="e-createForm__label.e-createForm__label--error">
                  {errors.dob}
                </div>
              </li>
            )}
            <li className="e-createForm__liEntry">
              <label className={`e-createForm__label e-createForm__label--dob`}>
                Date of Birth *
              </label>
              <NumberFormat
                format="##/##/####"
                type="text"
                placeholder="MM/DD/YY"
                mask="_"
                className={`e-createForm__text`}
                id="e-createForm__text--dob"
                name="dob"
                mask={["M", "M", "D", "D", "Y", "Y"]}
                onChange={handleChange}
                value={values.dob || ""}
              />
            </li>
            <DDmenu
              label={"Gender *"}
              modifier={"--gender"}
              name={"gender"}
              selCallBack={setValFromDD}
              items={genderitems}
            />
          </div>
          <p className="u-component_labels">Attributes</p>
          <div className={`l-content__flexContainer--left--SectionCard u-card`}>
            <DDmenu
              label={"Shirt Size"}
              modifier={"--shirt"}
              name={"shirtSize"}
              selCallBack={setValFromDD}
              items={sizeitems}
            />
            <DDmenu
              label={"Preferred Side"}
              modifier={"--side"}
              name={"preferredSide"}
              selCallBack={setValFromDD}
              items={sideitems}
            />
            {errors.beachExperience && (
              <li className="e-createForm__error--message u-align__text--right">
                <div className="e-createForm__label.e-createForm__label--error">
                  {errors.beachExperience}
                </div>
              </li>
            )}
            <DDmenu
              label={"Beach Experience *"}
              modifier={"--beach"}
              name={"beachExperience"}
              selCallBack={setValFromDD}
              items={expitems}
            />
            <DDmenu
              label={"Position"}
              modifier={"--position"}
              name={"position"}
              selCallBack={setValFromDD}
              items={positems}
            />
            <DDmenu
              label={"Dominant Hand"}
              modifier={"--hand"}
              name={"dominantHand"}
              selCallBack={setValFromDD}
              items={domitems}
            />
            <DDmenu
              label={"Height"}
              modifier={"--height"}
              name={"height"}
              selCallBack={setValFromDD}
              items={heightitems}
            />
          </div>
          <p className="u-component_labels">Education</p>
          <div className={`l-content__flexContainer--left--SectionCard u-card`}>
            <li className="e-createForm__liEntry">
              <label
                className={`e-createForm__label e-createForm__label--school`}
              >
                School
              </label>
              <input
                type="text"
                className={`e-createForm__text`}
                id="e-createForm__text--school"
                name="education"
                onChange={handleChange}
                value={values.education || ""}
              />
            </li>
          </div>
          <p className="u-component_labels">Health</p>
          <div className={`l-content__flexContainer--left--SectionCard u-card`}>
            <li className="e-createForm__liEntry">
              <label
                className={`e-createForm__label e-createForm__label--allergies`}
              >
                Allergies
              </label>
              <input
                type="text"
                className={`e-createForm__text`}
                id="e-createForm__text--allergies"
                name="allergies"
                onChange={handleChange}
                value={values.allergies || ""}
              />
            </li>
            <li className="e-createForm__liEntry">
              <label
                className={`e-createForm__label e-createForm__label--medical`}
              >
                Medical Issues
              </label>
              <input
                type="text"
                className={`e-createForm__text`}
                id="e-createForm__text--medical"
                name="medical"
                onChange={handleChange}
                value={values.medical || ""}
              />
            </li>
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
                className={`js-phone e-createForm__text`}
                name="contact"
                onChange={handleChange}
                value={values.contact || ""}
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
                value={values.emailId || ""}
              />
            </li>
          </div>
          <div className={`l-content__flexContainer--right u-mt25`}>
            {data.errorMessage && (
              <li className="e-createForm__error--message u-align__text--right">
                <div className="e-createForm__label.e-createForm__label--error">
                  {data.errorMessage}
                </div>
              </li>
            )}
          </div>
        </form>
        <ToastContainer />
      </section>
      <span className={`l-content__flexContainer--right u-sticky__bottomBtns`}>
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
      </span>
    </>
  );
};

export default CreatePlayer;
