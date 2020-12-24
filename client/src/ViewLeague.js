import React, { useState, useEffect, useCallback, useRef } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import Modal from "./components/Modal/Modal";
import useForm from "./components/forms/useForm";
import validate from "./components/forms/FormValidation";
import NumberFormat from "react-number-format";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { setCookie } from "./libs/cookie";
import Dialog from "./components/Dialog";
import DDmenu from "./components/DDmenu/DDmenu";
import leagueImg from "../public/images/icons/icons-photo-league.svg";
import CourtsModal from "./components/CourtsModal";
import ViewDivision from "./components/ViewDivision";
import EditDivision from "./components/EditDivision";
import CreateDivision from "./components/CreateDivision"
import CreateCourt from "./CreateCourt";
import lIcon from "../public/images/icons/icons-photo-league.svg";
import {
  genderitems,
  dayitems,
  durationitems,
  formatitems,
  typeitems,
  envitems,
  surfaceitems,
} from "./components/forms/leagueValues";
import dotenv from "dotenv";
import { AuthContext } from "./App";
import Cookies from "universal-cookie";



dotenv.config();
var server = process.env.API_URL;

const ViewLeague = () => {
  const { dispatch } = React.useContext(AuthContext);
  const cookies = new Cookies();

  var authcookie = cookies.get("lmtoken");
  if (authcookie == undefined)
    dispatch({
      type: "LOGOUT",
    });

  let history = useHistory();
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
  const [image, setImage] = useState({ preview: leagueImg, raw: "" });
  const [rulesdoc, setRulesdoc] = useState(null);
  const initialstate = {
    league: {},
    isLoading: true,
    isSubmitting: false,
    errorMessage: null,
  };

  //api data
  const [data, setData] = useState(initialstate);
  //modal stuff
  const [isShowing, setIsShowing] = useState(false);
  const [locationId, setLocationId] = useState(null);
  //create court form
  const [showCourtForm, setShowCourtForm] = useState(false);
  // toggles "edit" and "view" modes of league
  const [view, setView] = useState("view");
  const [lStatus, changeLStatus] = useState(false);
  const [updated, setUpdated] = useState(false);
  //keep current division state separate so it can update on data change
  const [currDivId, setCurrDivId] = useState("");

  // const leagueSubmit = handleSubmit;
  let vals, fields, divis;
  var league = data.league;

  //show court modal
  const handleShow = () => {
    setIsShowing(true);
  };
  //close court modal
  const handleClose = () => {
    setIsShowing(false);
  };
  //add court to edit form
  const onAdd = (court) => {
    setLocationId(court);
    values.courtId = court.courtId;
  };
  //show create court form
  const handleShowCF = () => {
    setShowCourtForm(!showCourtForm);
  };

  const [showDialog, setShowDialog] = useState(false);
  const handleDialogShow = () => setShowDialog(true);
  const handleDialogClose = () => setShowDialog(false);

  //delete league
  const handleDelete = () => {
    handleDialogShow();
  };
  // send delete request to api
  const sendDelete = () => {
    handleDialogClose();

    axios(server + "/delete-league", {
      withCredentials: true,
    })
      .then((res) => {
        if (res.data.status == "Success") {
          setData({
            ...data,
            isSubmitting: false,
          });
          notify("League deleted!");
          setCookie("currentLid", undefined, 0);
          setTimeout(function () {
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
  };

  // set init form vals for required field checking and showing view
  useEffect(() => {
    axios(server + "/view-league", {
      withCredentials: true,
    })
      .then((res) => {
        if (res.data.status == "Success") {
          setData({
            ...data,
            league: initValsFromAPI(res.data),
            isLoading: false,
            errorMessage: false,
          });
        } else {
          throw res;
        }
      })
      .catch((error) => {
        setData({
          ...data,
          isLoading: false,
          errorMessage:
            (error.data
              ? error.data.status
              : "No league was loaded. Please go back and try again.") ||
            error.statusText,
        });
        setTimeout(function () {
          history.push("/admin");
        }, 3000);
      });
  }, [lStatus, updated]);

  const initValsFromAPI = (data) => {
    if (data) {
      //form values saved in form state
      vals = {
        leagueIcon: data.leagueIcon,
        leagueName: data.leagueName,
        streetAddress: data.streetAddress,
        city: data.city,
        state_code: data.state_code,
        country: data.country,
        zip: data.zip,
        type: data.type,
        gender: data.gender,
        leagueStatus: data.leagueStatus,
        leagueCost: data.leagueCost,
        registrationDeadlineEdit: data.registrationDeadline,
        startDateEdit: data.startDate,
        format: data.format,
        leagueDay: data.leagueDay,
        preferredSurface: data.preferredSurface,
        environment: data.environment,
        time: data.time,
        duration: data.duration,
        maxTeams: data.maxTeams,
        rulesDoc: data.rulesDoc,
        divisionInfo: data.divisionInfo,
        courtId: data.courtInfo[0].courtId,
      };
      // to be returned to display state bc data must be converted to displayable value. Not all are used
      fields = {
        icon: data.leagueIcon,
        name: data.leagueName,
        address: data.streetAddress,
        city: data.city,
        state: data.state_code,
        country: data.country,
        zip: data.zip,
        type: getTextItem(data.type, typeitems),
        gender: getTextItem(data.gender, genderitems),
        leagueStatus: data.leagueStatus,
        leagueCost: data.leagueCost,
        reg: data.registrationDeadline,
        start: data.startDate,
        format: getTextItem(data.format, formatitems),
        leagueDay: getTextItem(data.leagueDay, dayitems),
        surface: getTextItem(data.preferredSurface, surfaceitems),
        env: getTextItem(data.environment, envitems),
        time: convertTime(data.time),
        duration: data.duration,
        maxTeams: data.maxTeams,
        rulesDoc: data.rulesDoc,
        docName: data.rulesDoc.replace("../../document/", ""),
        divisions: data.divisionInfo,
        courtInfo: data.courtInfo,
      };
      initVals(vals);
      setLocationId(fields.courtInfo[0]);
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

  function convertTime(time) {
    var _hours = Number(time.match(/^(\d+)/)[1]);
    var _mins = Number(time.match(/:(\d+)/)[1]);
    var _meridiam;

    if (_hours > 12) {
      _meridiam = "PM";
      _hours = _hours - 12;
    } else if (_hours == 12) {
      _meridiam = "PM";
    } else {
      _meridiam = "AM";
    }

    if (_hours == 0 && _meridiam == "AM") _hours = 12;

    var sHours = _hours.toString();
    var sMins = _mins.toString();

    if (_mins < 10) sMins = "0" + sMins;
    return sHours + ":" + sMins + " " + _meridiam;
  }

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

  //league image
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

  const handleRules = (e) => {
    if (e.target.files.length) {
      if (e.target.files[0].size > 10000000) {
        notify("Rules file too large! Must be less than 10mb.");
      } else {
        setRulesdoc({ rules: e.target.files[0] });
      }
    }
  };

  const setValFromDD = (field, val) => {
    handleDDChange(field, val);
  };

  //sends registration open/close
  const handleRegStatus = (num) => {

    setData({ ...data, isSubmitting: true });

    axios({
      method: "post",
      url: server + "/league-status",
      data: {
        status: num,
      },
      withCredentials: true,
    })
      .then((res) => {
        if (res.data.status == "Success") {
          notify("League status changed.");
          setTimeout(function () {
            setData({ ...data, isSubmitting: false });
            changeLStatus(true);
          }, 3000);
        } else {
          throw res;
        }
      })
      .catch((error) => {
        setData({ ...data, isSubmitting: false });
      });
  };

  const handleContentUpdated = () => {
    setUpdated(!updated);
  };

  const setCurrDiv = (d) => {
    setCurrDivId(d);
  };

  const handleViewDiv = (d) => {
    setCurrDiv(d);
    setView("division");
  };

  const handleEditDiv = (d) => {
    setView("editDiv");
  };

  const handleCreateDiv = () => {
    setView("createDiv");
  };

  const handleBacktoView = () => {
    setView("view");
  };

  const handleBacktoDiv = () => {
    setView("division");
  };

  //sends league edits
  function sendForm(e) {
    setData({
      ...data,
      isSubmitting: true,
    });

    function convertDate(date) {
      if (date !== "") {
        var _date_array = date.split("/");
        var _new_Date =
          _date_array[2] + "-" + _date_array[0] + "-" + _date_array[1];
        return _new_Date;
      }
    }

    function convertCost(cost) {
      return cost.replace(/[^0-9.]/g, "");
    }

    // values.time = convertTime(values.time);
    let startDateEdit = convertDate(values.startDateEdit);
    let registrationDeadlineEdit = convertDate(values.registrationDeadlineEdit);

    var objVals = {
      leagueName: values.leagueName,
      leagueTypeGender: values.gender,
      leagueCost: convertCost(values.leagueCost),
      dayOfLeague: values.leagueDay,
      time: values.time,
      startDate: startDateEdit,
      duration: values.duration,
      registrationDeadline: registrationDeadlineEdit,
      format: values.format,
      leagueType: values.type,
      environment: values.environment,
      maxTeams: values.maxTeams,
      preferredSurface: values.preferredSurface,
      courtId: values.courtId,
    };

    const formData = new FormData();

    let _keys = Object.keys(objVals);
    let a = 0;

    for (a = _keys.length - 1; a >= 0; a--) {
      formData.set(_keys[a], objVals[_keys[a]]);
    }

    // appending formData DOES NOT WORK. Must set.
    image.raw ? formData.set("pic", image.raw) : formData.set("pic", "");
    rulesdoc
      ? formData.set("rules", rulesdoc.rules)
      : formData.set("rules", "");

    //axios stuff here
    axios({
      method: "post",
      url: server + "/edit-league",
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
          notify("League updated.");

          setTimeout(function () {
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

  // add loader
  if (data.isLoading) return "Loading...";
  if (data.errorMessage)
    return `Something went wrong in View League: ${data.errorMessage}`;
  if (league && view == "view") {
    return (
      <>
        <div
          className={`l-content__flexContainer l-content__flexContainer--right`}
        >
          {league.leagueStatus == "1" ? (
            <button
              className={`e-btn e-btn--finalize e-btn--secondary`}
              onClick={() => handleRegStatus("2")}
            >
              {data.isSubmitting ? "updating status" : "open  registration"}
            </button>
          ) : league.leagueStatus == "2" ? (
            <button
              className={`e-btn e-btn--finalize e-btn--secondary`}
              onClick={() => handleRegStatus("3")}
            >
              {data.isSubmitting ? "updating status" : "close registration"}
            </button>
          ) : (
            <button className={`e-btn e-btn--finalize e-btn--secondary`}>
              league closed
            </button>
          )}
        </div>
        <section className={`l-content c-viewForm`}>
          <div
            className={`l-content__flexContainer u-mb25 l-content__flexContainer--row`}
          >
            <img
              className={`e-viewForm__imgUploadIcon`}
              src={
                league.icon
                  ? "https://avp-backend.com/" + league.icon
                  : leagueImg
              }
            />
            <div className={`l-content__flexContainer--column`} />
            <div
              className={`e-viewForm__name e-viewForm__name`}
              id="e-viewForm__firstName"
            >
              {league.name}
            </div>
          </div>
          <p className={`u-component_labels`}>Location</p>
          <div className={`l-content__flexContainer--left--SectionCard u-card`}>
            <li className={`e-viewForm__liEntry`}>
              <label
                className={`e-viewForm__label e-viewForm__label--location`}
              >
                {`${league.courtInfo[0].courtName} court`}
              </label>
              <div className={`e-viewForm__text--address`}>
                {`${league.city}, ${league.state}, ${league.zip}`}
              </div>
            </li>
          </div>
          <p className={`u-component_labels`}>General</p>
          <div className={`l-content__flexContainer--left--SectionCard u-card`}>
            <li className={`e-viewForm__liEntry`}>
              <label className={`e-viewForm__label e-viewForm__label--cost`}>
                Cost
              </label>
              <div
                className={`e-viewForm__text`}
                id="e-viewForm__text--location"
              >
                {`$${league.leagueCost}`}
              </div>
            </li>
            <li className={`e-viewForm__liEntry`}>
              <label className={`e-viewForm__label e-viewForm__label--day`}>
                Day of League
              </label>
              <div
                className={`e-viewForm__text`}
                id="e-viewForm__text--location"
              >
                {league.leagueDay}
              </div>
            </li>
            <li className={`e-viewForm__liEntry`}>
              <label className={`e-viewForm__label e-viewForm__label--time`}>
                Time
              </label>
              <div className={`e-viewForm__text`} id="e-viewForm__text--time">
                {league.time}
              </div>
            </li>
            <li className={`e-viewForm__liEntry`}>
              <label
                className={`e-viewForm__label e-viewForm__label--duration`}
              >
                Duration
              </label>
              <div
                className={`e-viewForm__text`}
                id="e-viewForm__text--duration"
              >
                {league.duration} Weeks
              </div>
            </li>
            <li className={`e-viewForm__liEntry`}>
              <label
                className={`e-viewForm__label e-viewForm__label--duration`}
              >
                Registration Deadline
              </label>
              <div
                className={`e-viewForm__text`}
                id="e-viewForm__text--deadline"
              >
                {league.reg}
              </div>
            </li>
            <li className={`e-viewForm__liEntry`}>
              <label
                className={`e-viewForm__label e-viewForm__label--duration`}
              >
                League Start Date
              </label>
              <div className={`e-viewForm__text`} id="e-viewForm__text--start">
                {league.start}
              </div>
            </li>
          </div>
          <p className={`u-component_labels`}>Settings</p>
          <div className={`l-content__flexContainer--left--SectionCard u-card`}>
            <li className={`e-viewForm__liEntry`}>
              <label className={`e-viewForm__label e-viewForm__label--format`}>
                Format
              </label>
              <div className={`e-viewForm__text`} id="e-viewForm__text--format">
                {league.format}
              </div>
            </li>
            <li className={`e-viewForm__liEntry`}>
              <label className={`e-viewForm__label e-viewForm__label--type`}>
                Type
              </label>
              <div className={`e-viewForm__text`} id="e-viewForm__text--type">
                {league.type}
              </div>
            </li>
            <li className={`e-viewForm__liEntry`}>
              <label className={`e-viewForm__label e-viewForm__label--gender`}>
                Gender
              </label>
              <div className={`e-viewForm__text`} id="e-viewForm__text--gender">
                {league.gender}
              </div>
            </li>
            <li className={`e-viewForm__liEntry`}>
              <label className={`e-viewForm__label e-viewForm__label--teams`}>
                Maximum Teams
              </label>
              <div
                className={`e-viewForm__text`}
                id="e-viewForm__text--maxTeams"
              >
                {league.maxTeams}
              </div>
            </li>
            <li className={`e-viewForm__liEntry`}>
              <label
                className={`e-viewForm__label e-viewForm__label--environment`}
              >
                Environment
              </label>
              <div
                className={`e-viewForm__text`}
                id="e-viewForm__text--location"
              >
                {league.env}
              </div>
            </li>
            <li className={`e-viewForm__liEntry`}>
              <label className={`e-viewForm__label e-viewForm__label--surface`}>
                Surface
              </label>
              <div
                className={`e-viewForm__text`}
                id="e-viewForm__text--surface"
              >
                {league.surface}
              </div>
            </li>
          </div>
          <div
            className={`l-content__flexContainer l-content__flexContainer--row justify-space-between`}
          >
            <p className={`u-component_labels`}>Divisions</p>
            <a
              className={`e-divisionLink`}
              onClick={(e) => {
                e.preventDefault();
                handleCreateDiv();
              }}
            >
              <span className={`e-btn__plus e-btn__plus--greyBtn`}>
                + Add Division
              </span>
            </a>
          </div>
          <div className={`l-content__flexContainer--left--SectionCard u-card`}>
            <div className={`c-divisions`}>
              {league.divisions.length == 0 ? (
                <li
                  className={`e-createForm__liEntry e-viewForm__liEntry--divisions`}
                >
                  <label className="e-createForm__label">No Divisions</label>
                </li>
              ) : (
                league.divisions.map((dvn) => (
                  <li
                    className={`e-viewForm__liEntry e-viewForm__liEntry--divisions`}
                    key={dvn.divisionId}
                  >
                    <label className={`e-viewForm__label`}></label>
                    <div
                      className={`e-viewForm__text e-viewForm__text--division e-viewForm__text--left`}
                      id="e-viewForm__text--div25"
                    >
                      {dvn.division + ` Division`}
                    </div>
                    <button
                      className={`e-btn--small`}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleViewDiv(dvn.divisionId);
                      }}
                    >
                      View
                    </button>
                  </li>
                ))
              )}
            </div>
          </div>
          <p className={`u-component_labels`}>Rules (optional)</p>
          <div className={`l-content__flexContainer--left--SectionCard u-card`}>
            <li className={`e-viewForm__liEntry`}>
              <label className={`e-viewForm__label e-viewForm__label--rules`}>
                Document
              </label>
              <span id="js-filename">{league.docName}</span>
              <div className={`e-viewForm__text`} id="e-viewForm__text--rules">
                <a
                  href={`https://avp-backend.com/ ${league.rulesDoc}`}
                  target="_blank"
                >
                  Rules
                </a>
              </div>
            </li>
          </div>
        </section>
        <span
          className={`l-content__flexContainer--right u-sticky__bottomBtns`}
        >
          <button
            className={`e-btn--small`}
            type="button"
            onClick={() => setView("edit")}
          >
            edit
          </button>
          <button
            className={`e-btn--small`}
            type="button"
            onClick={() => {
              handleDelete();
            }}
            disabled={data.isSubmitting}
          >
            {data.isSubmitting ? "Deleting..." : "Delete"}
          </button>
        </span>
        <ToastContainer />
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
          content={"This will DELETE the league completely."}
        />
      </>
    );
  }
  if (league && view == "edit")
    return (
      <>
        <div
          className={`l-content--column ${
            showCourtForm == true ? "u-hide" : ""
          }`}
        >
          <section className="c-createForm">
            <form id="c-createForm" onSubmit={handleSubmit}>
              <div
                className={`l-content__flexContainer u-mb25 l-content__flexContainer--row`}
              >
                <div className="l-content__flexContainer--column">
                  <img
                    src={
                      league.icon !== ""
                        ? "https://avp-backend.com/" + league.icon
                        : lIcon
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
                      className={`e-input__name e-input__name--league`}
                      name="leagueName"
                      id="e-createForm__leagueName"
                      type="text"
                      placeholder="league name *"
                      required
                      onChange={handleChange}
                      value={values.leagueName || ""}
                    />
                    <button
                      className="e-close"
                      type="button"
                      onClick={() => {
                        handleClear("leagueName");
                      }}
                    ></button>
                  </div>
                </div>
              </div>
              <p className="u-component_labels">Location</p>
              <div
                className={`l-content__flexContainer--left--SectionCard u-card`}
              >
                {!locationId ? (
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
                ) : (
                  <li className="e-createForm__liEntry">
                    <label
                      className={`e-createForm__label e-createForm__label--location`}
                    >
                      {locationId.courtName + " "}
                    </label>
                    <div className={`e-viewForm__text`}>
                      {`${locationId.city}, ${locationId.stateCode}, ${locationId.zip}`}
                    </div>
                    <input
                      type="hidden"
                      name="courtId"
                      value={values.courtId || locationId.courtId}
                    />
                  </li>
                )}
              </div>
              <div className={`l-content__flexContainer--right u-mt15`}>
                <button
                  className="e-btn--small u-op50"
                  type="button"
                  onClick={handleShow}
                >
                  search
                </button>
                <Modal
                  mtype={"c-addCourtModal"}
                  value={isShowing}
                  onClose={handleClose}
                >
                  <CourtsModal
                    zip={values.zip}
                    onConfirm={handleClose}
                    onSelect={onAdd}
                    onCreate={handleShowCF}
                  />
                </Modal>
              </div>
              <p>
                *some fields may not be editable depending on registration
                status.
              </p>
              <p className="u-component_labels">General</p>
              <div
                className={`l-content__flexContainer--left--SectionCard u-card`}
              >
                {errors.leagueCost && (
                  <li className="e-createForm__error--message u-align__text--right">
                    <div className="e-createForm__label.e-createForm__label--error">
                      {errors.leagueCost}
                    </div>
                  </li>
                )}
                <li className={`e-createForm__liEntry`}>
                  <label
                    className={`e-createForm__label e-createForm__label--cost ${
                      (values.courtId == "" || league.leagueStatus !== "1") &&
                      "disabled"
                    }`}
                  >
                    Cost
                  </label>
                  <NumberFormat
                    displayType="input"
                    disabled={league.leagueStatus !== "1"}
                    thousandSeparator={true}
                    prefix={"$"}
                    className={`e-createForm__text  e-createForm__text--small ${
                      values.courtId == "" && "disabled"
                    }`}
                    name="leagueCost"
                    onChange={handleChange}
                    value={values.leagueCost || ""}
                  />
                </li>
                {errors.dayOfLeague && (
                  <li className="e-createForm__error--message u-align__text--right">
                    <div className="e-createForm__label.e-createForm__label--error">
                      {errors.dayOfLeague}
                    </div>
                  </li>
                )}
                <DDmenu
                  label={"Day of League"}
                  modifier={"--day"}
                  name={"dayOfLeague"}
                  selCallBack={setValFromDD}
                  selected={league.leagueDay}
                  items={dayitems}
                  disabled={
                    values.courtId == "" || league.leagueStatus !== "1"
                      ? "disabled"
                      : ""
                  }
                />
                {errors.time && (
                  <li className="e-createForm__error--message u-align__text--right">
                    <div className="e-createForm__label.e-createForm__label--error">
                      {errors.time}
                    </div>
                  </li>
                )}
                <li className="e-createForm__liEntry">
                  <label
                    className={`e-createForm__label e-createForm__label--time ${
                      values.courtId == "" && "disabled"
                    }`}
                  >
                    Time
                  </label>
                  <input
                    className={`e-createForm__text  ${
                      values.courtId == "" && "disabled"
                    }`}
                    id="e-createForm__text--time"
                    type="time"
                    name="time"
                    required
                    onChange={handleChange}
                    value={values.time || "12:00"}
                    disabled={values.courtId == ""}
                  />
                </li>
                {errors.duration && (
                  <li className="e-createForm__error--message u-align__text--right">
                    <div className="e-createForm__label.e-createForm__label--error">
                      {errors.duration}
                    </div>
                  </li>
                )}
                <DDmenu
                  label={"Duration"}
                  modifier={"--duration"}
                  name={"duration"}
                  selCallBack={setValFromDD}
                  selected={`${league.duration} Weeks`}
                  items={durationitems}
                  disabled={values.courtId == "" && "disabled"}
                />
                {errors.registrationDeadlineEdit && (
                  <li className="e-createForm__error--message u-align__text--right">
                    <div className="e-createForm__label.e-createForm__label--error">
                      {errors.registrationDeadlineEdit}
                    </div>
                  </li>
                )}
                <li className="e-createForm__liEntry">
                  <label
                    className={`e-createForm__label e-createForm__label--registration ${
                      (values.courtId == "" || league.leagueStatus == "3") &&
                      "disabled"
                    }`}
                  >
                    Registration Deadline
                  </label>
                  <NumberFormat
                    format="##/##/####"
                    type="text"
                    placeholder="MM/DD/YY"
                    mask="_"
                    className={`e-createForm__text ${
                      values.courtId == "" && "disabled"
                    }`}
                    id="e-createForm__text--registration"
                    name="registrationDeadlineEdit"
                    mask={["M", "M", "D", "D", "Y", "Y"]}
                    onChange={handleChange}
                    disabled={league.leagueStatus == "3"}
                    value={values.registrationDeadlineEdit || ""}
                  />
                </li>
                {errors.startDateEdit && (
                  <li className="e-createForm__error--message u-align__text--right">
                    <div className="e-createForm__label.e-createForm__label--error">
                      {errors.startDateEdit}
                    </div>
                  </li>
                )}
                <li className="e-createForm__liEntry">
                  <label
                    className={`e-createForm__label e-createForm__label--registration ${
                      (values.courtId == "" || league.leagueStatus == "3") &&
                      "disabled"
                    }`}
                  >
                    League Start Date
                  </label>
                  <NumberFormat
                    format="##/##/####"
                    type="text"
                    placeholder="MM/DD/YY"
                    mask="_"
                    className={`e-createForm__text  ${
                      values.courtId == "" && "disabled"
                    }`}
                    disabled={league.leagueStatus == "3"}
                    id="e-createForm__text--registration"
                    name="startDateEdit"
                    mask={["M", "M", "D", "D", "Y", "Y"]}
                    onChange={handleChange}
                    value={values.startDateEdit || ""}
                  />
                </li>
              </div>
              <p className="u-component_labels">Settings</p>
              <div
                className={`l-content__flexContainer--left--SectionCard u-card`}
              >
                {errors.format && (
                  <li className="e-createForm__error--message u-align__text--right">
                    <div className="e-createForm__label.e-createForm__label--error">
                      {errors.format}
                    </div>
                  </li>
                )}
                <DDmenu
                  label={"Format"}
                  modifier={"--format"}
                  name={"format"}
                  selCallBack={setValFromDD}
                  selected={league.format}
                  items={formatitems}
                  disabled={
                    values.courtId == "" || league.leagueStatus == "3"
                      ? "disabled"
                      : ""
                  }
                />
                {errors.type && (
                  <li className="e-createForm__error--message u-align__text--right">
                    <div className="e-createForm__label.e-createForm__label--error">
                      {errors.type}
                    </div>
                  </li>
                )}
                <DDmenu
                  label={"Type"}
                  modifier={"--type"}
                  name={"type"}
                  selCallBack={setValFromDD}
                  selected={league.type}
                  items={typeitems}
                  disabled={
                    values.courtId == "" || league.leagueStatus !== "1"
                      ? "disabled"
                      : ""
                  }
                />
                {errors.gender && (
                  <li className="e-createForm__error--message u-align__text--right">
                    <div className="e-createForm__label.e-createForm__label--error">
                      {errors.gender}
                    </div>
                  </li>
                )}
                <DDmenu
                  label={"Gender"}
                  modifier={"--gender"}
                  name={"gender"}
                  selCallBack={setValFromDD}
                  selected={league.gender}
                  items={genderitems}
                  disabled={
                    values.courtId == "" || league.leagueStatus !== "1"
                      ? "disabled"
                      : ""
                  }
                />
                {errors.maxTeams && (
                  <li className="e-createForm__error--message u-align__text--right">
                    <div className="e-createForm__label.e-createForm__label--error">
                      {errors.maxTeams}
                    </div>
                  </li>
                )}
                <li className="e-createForm__liEntry">
                  <label
                    className={`e-createForm__label e-createForm__label--maxPlayers ${
                      values.courtId == "" && "disabled"
                    }`}
                  >
                    Maximum Teams
                  </label>
                  <input
                    type="text"
                    className={`e-createForm__text e-createForm__text--small  ${
                      values.courtId == "" && "disabled"
                    }`}
                    name="maxTeams"
                    onChange={handleChange}
                    value={values.maxTeams || ""}
                  />
                </li>
                {errors.environment && (
                  <li className="e-createForm__error--message u-align__text--right">
                    <div className="e-createForm__label.e-createForm__label--error">
                      {errors.environment}
                    </div>
                  </li>
                )}
                <DDmenu
                  label={"Environment"}
                  modifier={"--environment"}
                  name={"environment"}
                  selCallBack={setValFromDD}
                  selected={league.env}
                  items={envitems}
                  disabled={values.courtId == "" && "disabled"}
                />
                {errors.preferredSurface && (
                  <li className="e-createForm__error--message u-align__text--right">
                    <div className="e-createForm__label.e-createForm__label--error">
                      {errors.preferredSurface}
                    </div>
                  </li>
                )}
                <DDmenu
                  label={"Preferred Surface"}
                  modifier={"--surface"}
                  name={"preferredSurface"}
                  selCallBack={setValFromDD}
                  selected={league.surface}
                  items={surfaceitems}
                  disabled={values.courtId == "" && "disabled"}
                />
              </div>
              <div
                className={`l-content__flexContainer l-content__flexContainer--row justify-space-between`}
              >
                <p className={`u-component_labels`}>Divisions</p>
                <a
                  className={`e-divisionLink`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleCreateDiv();
                  }}
                >
                  <span className={`e-btn__plus e-btn__plus--greyBtn`}>
                    + Add Division
                  </span>
                </a>
              </div>
              <div
                className={`l-content__flexContainer--left--SectionCard u-card`}
              >
                <div className={`c-divisions`}>
                  {league.divisions.map((dvn) => (
                    <li
                      className={`e-viewForm__liEntry e-viewForm__liEntry--divisions`}
                      key={dvn.divisionId}
                    >
                      <label className={`e-viewForm__label`}>Division</label>
                      <div
                        className={`e-viewForm__text e-viewForm__text--btn e-viewForm__text--left`}
                      >
                        {dvn.division}
                      </div>
                      <button
                        className={`e-btn--small`}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          handleEditDiv(dvn.divisionId);
                        }}
                      >
                        Edit
                      </button>
                    </li>
                  ))}
                  <span className="u-small_body_text">
                    (Timed or Sets game play is set in each division.)
                  </span>
                </div>
              </div>
              <p className="u-component_labels">Rules (Optional)</p>
              <div
                className={`l-content__flexContainer--left--SectionCard u-card`}
              >
                <li className="e-createForm__liEntry">
                  <label
                    className={`e-createForm__label e-createForm__label--rules ${
                      values.courtId == "" && "disabled"
                    }`}
                  >
                    Rules Document
                  </label>
                  <span id="js-filename">
                    {rulesdoc && rulesdoc.rules.name}
                  </span>
                  <input
                    id="e-input__rulesUpload"
                    type="file"
                    onChange={handleRules}
                  />
                  <label htmlFor="e-input__rulesUpload"></label>
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
          <span
            className={`l-content__flexContainer--right u-sticky__bottomBtns`}
          >
            <button
              className={`e-btn--small e-btn--secondary`}
              onClick={() => setView("view")}
              type="button"
            >
              cancel
            </button>
            <button
              className="e-btn--small"
              form="c-createForm"
              disabled={data.isSubmitting}
            >
              {data.isSubmitting ? "Sending..." : "Update"}
            </button>
          </span>
        </div>
        <CreateCourt show={showCourtForm} onCreate={handleShowCF} />
      </>
    );
  if (view == "division")
    return (
      <>
        <ViewDivision
          league={league}
          division={currDivId}
          cancel={handleBacktoView}
          edit={handleEditDiv}
          refresh={handleContentUpdated}
        />
        <ToastContainer />
      </>
    );
  if (view == "editDiv")
    return (
      <>
        <EditDivision
          league={league}
          divId={currDivId}
          cancel={handleBacktoDiv}
          refresh={handleContentUpdated}
        />
      </>
    );
  if (view == "createDiv")
    return (
      <>
        <CreateDivision
          cancel={handleBacktoView}
          refresh={handleContentUpdated}
        />
      </>
    );
};;

export default ViewLeague;
