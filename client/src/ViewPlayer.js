import React, { useState, useEffect, useCallback } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import useForm from "./components/forms/useForm";
import validate from "./components/forms/FormValidation";
import PPAcc from "./components/PPAcc";
import Accordion from "./components/Accordion";
import { getCookie } from "./libs/cookie";
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

const ViewPlayer = () => {
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
    isLoading: true,
    errorMessage: null,
  };

  const [activeEventKey, setActiveEventKey] = useState(0);
  const [playerData, setPlayerData] = useState(initialstate);
  const [playerPartData, setPlayerPartData] = useState(null);
  const [playerView, setPlayerView] = useState("view");
  const [currentTab, setCurrentTab] = useState("tabA");
  const [formSubmitted, setFormSubmitted] = useState(false);

  // set init form vals for required field checking
  useEffect(() => {
    axios(server + "/view-player", {
      withCredentials: true,
    })
      .then((res) => {
        if (res.data.status == "Success") {
          setPlayerData({
            // don't set player data directly. share with form initvals
            player: initValsFromAPI(res.data),
            isLoading: false,
            errorMessage: false,
          });
        } else {
          throw res;
        }
      })
      .catch((error) => {
        console.error("player data failed:", error);
        setPlayerData({
          isLoading: false,
          errorMessage:
            (error.data
              ? error.data.status
              : "No player was loaded to show. Please go back and try again.") ||
            error.statusText,
        });
        setTimeout(function () {
          history.push("/teams");
        }, 3000);
      });
  }, [formSubmitted]);

  const loadPlayerParticipation = () => {
    axios(server + "/playerParticipation", {
      withCredentials: true,
    })
      .then((res) => {
        if (res.data.status == "Success") {
          setPlayerPartData({
            pp: res.data.playerParticipationList,
            isLoading: false,
            errorMessage: false,
          });
        } else {
          throw res;
        }
      })
      .catch((error) => {
        console.error("registration failed:", error);
        setPlayerPartData({
          isLoading: false,
          errorMessage:
            (error.data
              ? error.data.status
              : "No data loaded. Try logging in again.") || error.statusText,
        });
      });
  };

  const initValsFromAPI = (data) => {
    if (data) {
      //form values saved in form state
      let vals = {
        profilePic: data.profilePic,
        firstName: data.firstName,
        lastName: data.lastName,
        age: data.age,
        emailId: data.emailId,
        contact: data.contact,
        gender: data.gender,
        dob: data.dob,
        zip: data.zip,
        education: data.education,
        medical: data.medical,
        allergies: data.allergies,
        shirtSize: data.shirtSize,
        position: data.position,
        preferredSide: data.preferredSide,
        beachExperience: data.beachExperience,
        dominantHand: data.dominantHand,
        height: data.height,
      };
      //for display state bc data must be converted to displayable value. Not all are used.
      let fields = {
        profilePic: data.profilePic,
        firstName: data.firstName,
        lastName: data.lastName,
        age: data.age,
        emailId: data.emailId,
        contact: data.contact,
        gender: getTextItem(data.gender, genderitems),
        dob: data.dob,
        zip: data.zip,
        education: data.education,
        medical: data.medical,
        allergies: data.allergies,
        shirtSize: getTextItem(data.shirtSize, sizeitems),
        position: getTextItem(data.position, positems),
        preferredSide: getTextItem(data.preferredSide, sideitems),
        beachExperience: getTextItem(data.beachExperience, expitems),
        dominantHand: getTextItem(data.dominantHand, domitems),
        height: getTextItem(data.height, heightitems),
      };
      initVals(vals);
      return fields;
    }
  };

  function getTextItem(num, items) {
    if (num) {
      num = parseInt(num);
      let obj = items.find((o) => o.value === num);
      let text = obj.text;
      return text;
    }
  }

  const handleTabClick = () => {
    if (currentTab == "tabA") {
      setCurrentTab("tabB");
      if (playerPartData == null) loadPlayerParticipation();
    } else {
      setCurrentTab("tabA");
    }
  };

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
    toast.dark("Player updated.", {
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

  const handleEdit = () => {
    setPlayerView("edit");
  };

  const handleCancel = (e) => {
    setPlayerView("view");
  };

  function sendForm(e) {

    setPlayerData({
      ...playerData,
      isSubmitting: true,
    });

    var fonString = values.contact;
    fonString ? (fonString = fonString.replace(/\D/g, "")) : fonString == "";

    function convertDate(date) {
      if (date) {
        var _date_array = date.split("/");
        var _new_Date =
          _date_array[2] + "-" + _date_array[0] + "-" + _date_array[1];
        return _new_Date;
      }
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
      avpId: getCookie("currentPid"),
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
      url: server + "/player-edit",
      data: formData,
      headers: {
        "content-type": "multipart/form-data",
      },
      withCredentials: true,
    })
      .then((res) => {
        if (res.data.status == "Success") {
          setPlayerData({
            ...playerData,
            isSubmitting: false,
          });
          notifySuccess();
          setTimeout(function () {
            setFormSubmitted(!formSubmitted);
            setCurrentTab("tabA");
            setPlayerView("view");
          }, 4200);
        } else {
          throw res;
        }
      })
      .catch((error) => {
        setPlayerData({
          ...playerData,
          isSubmitting: false,
          errorMessage:
            (error.data ? error.data.message : null) || error.statusText,
        });
      });
  }

  // add loader
  if (playerData.isLoading) return "Loading...";
  if (playerData.errorMessage)
    return `Something went wrong in View Player: ${playerData.errorMessage}`;
  if (playerData.player && playerView == "view") {
    var player = playerData.player;
    return (
      <>
        <section className="l-content">
          <ul className="l-tabcontainer">
            <li
              className={
                currentTab == "tabA" ? `e-tabBtn currentTab` : "e-tabBtn"
              }
              name="tabA"
              onClick={handleTabClick}
            >
              Profile
            </li>
            <li
              className={
                currentTab == "tabB" ? `e-tabBtn currentTab` : "e-tabBtn"
              }
              name="tabB"
              onClick={handleTabClick}
            >
              Participation
            </li>
          </ul>
        </section>
        <div
          className={`tab ${currentTab == "tabA" ? "u-show" : "u-hide"}`}
          id="c-profileTab"
        >
          {/* PROFILE TAB */}
          <section className={`l-content c-viewForm`}>
            <div id="c-viewForm">
              <div
                className={`l-content__flexContainer u-mb25 l-content__flexContainer--row`}
              >
                <div className={`l-content__flexContainer--column`}>
                  <img
                    className="e-viewForm__imgUploadIcon"
                    src={
                      player.profilePic !== ""
                        ? "https://avp-backend.com/" + player.profilePic
                        : playerImg
                    }
                    height="200"
                    alt="Player Image"
                  />
                </div>
                <div className={`l-content__flexContainer--column`}>
                  <div
                    className={`l-content__flexContainer l-content__flexContainer--row`}
                  >
                    <div
                      className={`e-viewForm__name e-viewForm__name--first`}
                      id="e-viewForm__firstName"
                    >
                      {player.firstName}
                    </div>
                  </div>
                  <div
                    className={`l-content__flexContainer l-content__flexContainer--row`}
                  >
                    <div
                      className={`e-viewForm__name e-viewForm__name--last`}
                      id="e-viewForm__lastName"
                    >
                      {player.lastName}
                    </div>
                  </div>
                </div>
              </div>
              <p className="u-component_labels">General</p>
              <div
                className={`l-content__flexContainer--left--SectionCard u-card`}
              >
                <li className="e-viewForm__liEntry">
                  <div className={`e-viewForm__label e-viewForm__label--dob`}>
                    Date of Birth
                  </div>
                  <div
                    className={`e-viewForm__text e-viewForm__text--noborder`}
                  >
                    {player.dob}
                  </div>
                </li>
                <li className="e-viewForm__liEntry">
                  <div
                    className={`e-viewForm__label e-viewForm__label--gender`}
                  >
                    Gender
                  </div>
                  <div
                    className={`e-viewForm__text e-viewForm__text--noborder`}
                  >
                    {player.gender == 1 ? "Male" : "Female"}
                  </div>
                </li>
              </div>
              <p className="u-component_labels">Attributes</p>
              <div
                className={`l-content__flexContainer--left--SectionCard u-card`}
              >
                <li className="e-viewForm__liEntry">
                  <div className={`e-viewForm__label e-viewForm__label--shirt`}>
                    Shirt Size
                  </div>
                  <div
                    className={`e-viewForm__text e-viewForm__text--noborder`}
                  >
                    {player.shirtSize}
                  </div>
                </li>
                <li className="e-viewForm__liEntry">
                  <div className={`e-viewForm__label e-viewForm__label--side`}>
                    Preferred Side
                  </div>
                  <div
                    className={`e-viewForm__text e-viewForm__text--noborder`}
                  >
                    {player.preferredSide}
                  </div>
                </li>
                <li className="e-viewForm__liEntry">
                  <div className={`e-viewForm__label e-viewForm__label--beach`}>
                    Beach Experience
                  </div>
                  <div
                    className={`e-viewForm__text e-viewForm__text--noborder`}
                  >
                    {player.beachExperience}
                  </div>
                </li>
                <li className="e-viewForm__liEntry">
                  <div
                    className={`e-viewForm__label e-viewForm__label--position`}
                  >
                    Position
                  </div>
                  <div
                    className={`e-viewForm__text e-viewForm__text--noborder`}
                  >
                    {player.position}
                  </div>
                </li>
                <li className="e-viewForm__liEntry">
                  <div className={`e-viewForm__label e-viewForm__label--hand`}>
                    Dominant Hand
                  </div>
                  <div
                    className={`e-viewForm__text e-viewForm__text--noborder`}
                  >
                    {player.dominantHand}
                  </div>
                </li>
                <li className="e-viewForm__liEntry">
                  <div
                    className={`e-viewForm__label e-viewForm__label--height`}
                  >
                    Height
                  </div>
                  <div
                    className={`e-viewForm__text e-viewForm__text--noborder`}
                  >
                    {player.height}
                  </div>
                </li>
              </div>
              <p className="u-component_labels">Education</p>
              <div
                className={`l-content__flexContainer--left--SectionCard u-card`}
              >
                <li className="e-viewForm__liEntry">
                  <div
                    className={`e-viewForm__label e-viewForm__label--school`}
                  >
                    School
                  </div>
                  <div
                    className={`e-viewForm__text e-viewForm__text--noborder`}
                  >
                    {player.education}
                  </div>
                </li>
              </div>
              <p className="u-component_labels">Health</p>
              <div
                className={`l-content__flexContainer--left--SectionCard u-card`}
              >
                <li className="e-viewForm__liEntry">
                  <div
                    className={`e-viewForm__label e-viewForm__label--allergies`}
                  >
                    Allergies
                  </div>
                  <div
                    className={`e-viewForm__text e-viewForm__text--noborder`}
                  >
                    {player.allergies}
                  </div>
                </li>
                <li className="e-viewForm__liEntry">
                  <div
                    className={`e-viewForm__label e-viewForm__label--medical`}
                  >
                    Medical Issues
                  </div>
                  <div
                    className={`e-viewForm__text e-viewForm__text--noborder`}
                  >
                    {player.medical}
                  </div>
                </li>
              </div>
              <p className="u-component_labels">Contact</p>
              <div
                className={`l-content__flexContainer--left--SectionCard u-card`}
              >
                <li className="e-viewForm__liEntry">
                  <div
                    className={`e-viewForm__label e-viewForm__label--location`}
                  >
                    Zip
                  </div>
                  <div
                    className={`e-viewForm__text e-viewForm__text--noborder`}
                  >
                    {player.zip}
                  </div>
                </li>
                <li className="e-viewForm__liEntry">
                  <div className={`e-viewForm__label e-viewForm__label--phone`}>
                    Phone
                  </div>
                  <div
                    className={`e-viewForm__text e-viewForm__text--noborder`}
                    id="e-viewForm__text--phone"
                  >
                    <NumberFormat
                      format="(###) ###-####"
                      type="tel"
                      mask="_"
                      className={`js-phone e-createForm__text`}
                      name="contact"
                      onChange={handleChange}
                      value={values.contact || ""}
                    />
                  </div>
                </li>
                <li className="e-viewForm__liEntry">
                  <div
                    className={`e-viewForm__label e-viewForm__label--location`}
                  >
                    Email
                  </div>
                  <div
                    className={`e-viewForm__text`}
                    id="e-viewForm__email--zip"
                  >
                    {player.emailId}
                  </div>
                </li>
              </div>
            </div>
          </section>
          <span
            className={`l-content__flexContainer--right u-sticky__bottomBtns`}
          >
            <button className="e-btn--small" type="button" onClick={handleEdit}>
              Edit
            </button>
          </span>
        </div>
        {/* PARTICIPATION TAB */}
        <div
          className={`tab ${currentTab == "tabB" ? "u-show" : "u-hide"}`}
          id="c-participationTab"
        >
          <section className={`l-content c-viewForm`}>
            <div className="u-mb40" id="c-viewForm">
              <div
                className={`l-content__flexContainer u-mb25 l-content__flexContainer--row`}
              >
                <div className="l-content__flexContainer--column">
                  <img
                    className="e-viewForm__imgUploadIcon"
                    src={
                      "https://avp-backend.com/" + player.profilePic ||
                      playerImg
                    }
                    height="200"
                    alt="Player Image"
                  />
                </div>
              </div>
              <div className={`l-content__flexContainer--column`}>
                <div
                  className={`l-content__flexContainer l-content__flexContainer--row`}
                >
                  <div
                    className={`e-viewForm__name e-viewForm__name--first`}
                    id="e-viewForm__firstName"
                  >
                    {player.firstName}
                  </div>
                </div>
                <div
                  className={`l-content__flexContainer l-content__flexContainer--row`}
                >
                  <div
                    className={`e-viewForm__name e-viewForm__name--last`}
                    id="e-viewForm__lastName"
                  >
                    {player.lastName}
                  </div>
                </div>
                <div
                  className={`l-content__flexContainer l-content__flexContainer--row`}
                >
                  <div
                    className={`e-viewForm__age e-viewForm__age" id="e-viewForm__age`}
                  >
                    {player.age}
                  </div>
                </div>
              </div>
              <div className="u-pt40" id="js-partContainer">
                {/* accordions */}
                {playerPartData ? (
                  <Accordion
                    activeEventKey={activeEventKey}
                    onToggle={setActiveEventKey}
                  >
                    {playerPartData.pp.map((league) => (
                      <PPAcc key={league.leagueId}>
                        <Accordion.Toggle
                          element={PPAcc.Header}
                          eventKey={league.leagueId}
                        >
                          {league}
                          {activeEventKey !== league.leagueId && ``}
                          {activeEventKey === league.leagueId && `active`}
                        </Accordion.Toggle>
                        <Accordion.Collapse
                          eventKey={league.leagueId}
                          element={PPAcc.Body}
                        >
                          {league}
                        </Accordion.Collapse>
                      </PPAcc>
                    ))}
                  </Accordion>
                ) : (
                  <p>Loading...</p>
                )}
              </div>
            </div>
          </section>
        </div>
      </>
    );
  }
  if (playerView == "edit")
    return (
      <>
        <div
          className={`l-content__flexContainer l-content__flexContainer--row justify-space-between`}
        ></div>
        <section className="c-createForm">
          <form id="c-createForm" onSubmit={handleSubmit}>
            <div
              className={`l-content__flexContainer u-mb25 l-content__flexContainer--row`}
            >
              <div className="l-content__flexContainer--column">
                <img
                  src={
                    playerData.player.profilePic !== ""
                      ? "https://avp-backend.com/" +
                        playerData.player.profilePic
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
                    value={playerData.player.firstName}
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
                    value={playerData.player.lastName}
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
            <div
              className={`l-content__flexContainer--left--SectionCard u-card`}
            >
              {errors.dob && (
                <li className="e-createForm__error--message u-align__text--right">
                  <div className="e-createForm__label.e-createForm__label--error">
                    {errors.dob}
                  </div>
                </li>
              )}
              <li className="e-createForm__liEntry">
                <label
                  className={`e-createForm__label e-createForm__label--dob`}
                >
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
                  value={playerData.player.dob}
                />
              </li>
              <DDmenu
                label={"Gender *"}
                modifier={"--gender"}
                name={"gender"}
                selCallBack={setValFromDD}
                selected={playerData.player.gender}
                items={genderitems}
              />
            </div>
            <p className="u-component_labels">Attributes</p>
            <div
              className={`l-content__flexContainer--left--SectionCard u-card`}
            >
              <DDmenu
                label={"Shirt Size"}
                modifier={"--shirt"}
                name={"shirtSize"}
                selCallBack={setValFromDD}
                selected={playerData.player.shirtSize}
                items={sizeitems}
              />
              <DDmenu
                label={"Preferred Side"}
                modifier={"--side"}
                name={"preferredSide"}
                selCallBack={setValFromDD}
                selected={playerData.player.preferredSide}
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
                selected={playerData.player.beachExperience}
                items={expitems}
              />
              <DDmenu
                label={"Position"}
                modifier={"--position"}
                name={"position"}
                selCallBack={setValFromDD}
                selected={playerData.player.position}
                items={positems}
              />
              <DDmenu
                label={"Dominant Hand"}
                modifier={"--hand"}
                name={"dominantHand"}
                selCallBack={setValFromDD}
                selected={playerData.player.dominantHand}
                items={domitems}
              />
              <DDmenu
                label={"Height"}
                modifier={"--height"}
                name={"height"}
                selCallBack={setValFromDD}
                selected={playerData.player.height}
                items={heightitems}
              />
            </div>
            <p className="u-component_labels">Education</p>
            <div
              className={`l-content__flexContainer--left--SectionCard u-card`}
            >
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
                  value={values.education}
                />
              </li>
            </div>
            <p className="u-component_labels">Health</p>
            <div
              className={`l-content__flexContainer--left--SectionCard u-card`}
            >
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
                  value={values.allergies}
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
                  value={values.medical}
                />
              </li>
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
          </form>
          <ToastContainer />
        </section>

        {playerData.errorMessage && (
          <li className="e-createForm__error--message u-align__text--right">
            <div className="e-createForm__label.e-createForm__label--error">
              {playerData.errorMessage}
            </div>
          </li>
        )}
        <div className={`l-content__flexContainer--right u-sticky__bottomBtns`}>
          <button
            className={`e-btn--small e-btn--secondary`}
            onClick={handleCancel}
            type="button"
            disabled={playerData.isSubmitting}
          >
            cancel
          </button>
          <button
            className="e-btn--small"
            type="submit"
            form="c-createForm"
            disabled={playerData.isSubmitting}
          >
            {playerData.isSubmitting ? "Sending..." : "Save"}
          </button>
        </div>
      </>
    );
};

export default ViewPlayer;
