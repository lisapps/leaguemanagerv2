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
import { getCookie } from "./libs/cookie";
import Dialog from "./components/Dialog";
import dotenv from "dotenv";
import { AuthContext } from "./App";
import Cookies from "universal-cookie";

dotenv.config();
var server = process.env.API_URL;

const ViewTeam = () => {
  const { dispatch } = React.useContext(AuthContext);
  const cookies = new Cookies();

  var authcookie = cookies.get("lmtoken"); 

  if (authcookie == undefined)
    dispatch({
      type: "LOGOUT",
    });

  const { selectedLeague } = React.useContext(LeaguesContext);
  const [image, setImage] = useState({ preview: teamImg, raw: "" });
  const initialstate = {
    team: [],
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
    let teaminfo = getCookie("currentTeam");

    if (teaminfo) {
      teaminfo = JSON.parse(teaminfo);
      setData({
        ...data,
        team: initValsFromCookie(teaminfo),
        isLoading: false,
        errorMessage: false,
      });
    } else {
      setData({
        ...data,
        isLoading: false,
        errorMessage: "We're having trouble loading that team.",
      });
      setTimeout(function () {
        history.push("/teams");
      }, 3000);
    }
  }, []);

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

    axios(server + "/team-delete", {
      withCredentials: true,
    })
      .then((res) => {
        if (res.data.status == "Success") {
          setData({
            ...data,
            isSubmitting: false,
          });
          notify("Team deleted!");
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
  };

  let vals = {};

  const initValsFromCookie = (td) => {
    if (td) {
      vals = {
        teamName: td[2],
        teamId: td[0],
      };
      let fields = {
        name: td[2],
        icon: td[1],
        id: td[0],
      };
      initVals(vals);
      return fields;
    }
  };

  // Need way to remove image in API. Setting to "" isn't working.

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

  function sendForm(e) {
    var objVals = {
      teamName: values.teamName,
      teamId: values.teamId,
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
      url: server + "/teams-update",
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
          notify("Team updated!");

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

  if (data.isLoading) return "Loading...";
  if (data.errorMessage) return `Something went wrong: ${data.errorMessage}`;
  if (data.team && view == "view")
    return (
      <div className="l-main">
        <div
          className={`l-content__flexContainer l-content__flexContainer--row justify-space-between`}
        >
          <LeagueSwitcher />
        </div>
        <section className={`l-content c-viewForm`}>
          <div id="c-viewForm">
            <div
              className={`l-content__flexContainer u-mb25 l-content__flexContainer--row`}
            >
              <div className={`l-content__flexContainer--column`}>
                <img
                  className="e-viewForm__imgUploadIcon"
                  src={
                    data.team.icon
                      ? "https://avp-backend.com/" + data.team.icon
                      : teamImg
                  }
                  height="200"
                  alt="Team Image"
                />
              </div>
              <div className={`l-content__flexContainer--column`}>
                <div className={`e-viewForm__name`}>{data.team.name}</div>
              </div>
            </div>
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
          content={"This will DELETE the team completely."}
        />
      </div>
    );
  if (data.team && view == "edit")
    return (
      <>
        <div className="l-main">
          <div
            className={`l-content__flexContainer l-content__flexContainer--row justify-space-between`}
          >
            <LeagueSwitcher />
          </div>
          {/* {`Testing view team`} */}
          <section className="c-createForm">
            <form id="c-createForm" onSubmit={handleSubmit}>
              <div
                className={`l-content__flexContainer u-mb25 l-content__flexContainer--row`}
              >
                <div className="l-content__flexContainer--column">
                  {/* <span className="e-input__imgLabel" onClick={rmImg}>
                    Remove
                  </span> */}
                  <img
                    src={
                      data.team.icon !== ""
                        ? "https://avp-backend.com/" + data.team.icon
                        : teamImg
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
                <button
                  className={`e-btn--small e-btn--secondary`}
                  onClick={() => setView("view")}
                  disabled={data.isSubmitting}
                >
                  cancel
                </button>
                <button
                  className="e-btn--small"
                  type="button"
                  form="c-createForm"
                  onClick={sendForm}
                >
                  {data.isSubmitting ? "Sending..." : "Save"}
                </button>
              </div>
            </form>
            <ToastContainer />
          </section>
        </div>
      </>
    );
};

export default ViewTeam;
