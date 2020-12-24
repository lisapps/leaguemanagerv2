import React, { useState, useEffect } from "react";
import axios from "axios";
import LeagueSwitcher from "./components/LeagueSwitcher/LeagueSwitcher";
import { LeaguesContext } from "./hooks/LeaguesContext";
import useForm from "./components/forms/useForm";
import validate from "./components/forms/FormValidation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import teamImg from "../public/images/icons/icons-photo-team.svg";
import { useHistory } from "react-router-dom";
import dotenv from "dotenv";
import { AuthContext } from "./App";
import Cookies from "universal-cookie";

dotenv.config();
var server = process.env.API_URL;

const CreateTeam = () => {
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
    handleSubmit,
    resetForm,
    handleClear,
  } = useForm(sendForm, validate);

  //form response data
  const [image, setImage] = useState({ preview: teamImg, raw: "" });
  const initialstate = {
    isSubmitting: false,
    errorMessage: null,
  };
  const [data, setData] = useState(initialstate);

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
    toast.dark("Team created.", {
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

  let history = useHistory();

  function sendForm(e) {    var objVals = {
      teamName: values.teamName,
      leagueId: selectedLeague[0].value,
    };

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

    // appending formData DOES NOT WORK. Must set.
    image.raw && formData.set("pic", image.raw);

    //axios stuff here
    axios({
      method: "post",
      url: server + "/teams-create",
      data: formData,
      headers: {
        "content-type": "multipart/form-data",
      },
      withCredentials: true,
    })
      .then((res) => {
        if (res.data.status == "Success") {
          notifySuccess();
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

  return (
    <>
      <div className="l-main">
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
              <div
                className={`l-content__flexContainer l-content__flexContainer--row u-mt30`}
              >
                <input
                  className={`e-input__name e-input__name--team`}
                  name="teamName"
                  id="e-createForm__teamName"
                  type="text"
                  placeholder="name"
                  required
                  onChange={handleChange}
                  value={values.teamName || ""}
                />
                <button
                  className="e-close"
                  type="button"
                  onClick={() => {
                    handleClear("teamName");
                  }}
                ></button>
              </div>
            </div>

            <div className={`l-content__flexContainer--right u-mt25`}>
              {data.errorMessage && (
                <li className="e-createForm__error--message u-align__text--right">
                  <div className="e-createForm__label.e-createForm__label--error">
                    {data.errorMessage}
                  </div>
                </li>
              )}
              <span
                className={`l-content__flexContainer--right u-sticky__bottomBtns`}
              >
                <button
                  className={`e-btn--small e-btn--secondary`}
                  onClick={(e) => {
                    e.preventDefault();
                    resetForm();
                  }}
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
            </div>
          </form>
          <ToastContainer />
        </section>
      </div>
    </>
  );
};

export default CreateTeam;
