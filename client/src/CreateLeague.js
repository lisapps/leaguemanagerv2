import React, { useState, useEffect, useCallback, useRef } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import Modal from "./components/Modal/Modal";
import useForm from "./components/forms/useForm";
import validate from "./components/forms/FormValidation";
import NumberFormat from "react-number-format";
import { ToastContainer, toast } from "react-toastify";
import { setCookie } from "./libs/cookie";
import "react-toastify/dist/ReactToastify.css";
import leagueImg from "../public/images/icons/icons-photo-league.svg";
import CreateCourt from "./CreateCourt";
import {
  genderitems,
  dayitems,
  durationitems,
  formatitems,
  typeitems,
  envitems,
  surfaceitems,
} from "./components/forms/leagueValues";
import DDmenu from "./components/DDmenu/DDmenu";
import CourtsModal from "./components/CourtsModal";
import dotenv from "dotenv";
import { AuthContext } from "./App";
import Cookies from "universal-cookie";

dotenv.config();
var server = process.env.API_URL;

const CreateLeague = () => {
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
  const [image, setImage] = useState({ preview: leagueImg, raw: "" });
  const [rulesdoc, setRulesdoc] = useState(null);
  const initialstate = {
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

  const leagueSubmit = handleSubmit;

  const handleShow = () => {
    values.zip !== ""
      ? setIsShowing(true)
      : notify("Please enter a zip code first.");
  };
  const handleClose = () => {
    setIsShowing(false);
  };
  const onAdd = (court) => {
    setLocationId(court);
    values.courtId = court.courtId;
  };
  const handleShowCF = () => {
    setShowCourtForm(!showCourtForm);
  };

  // set init form vals for required field checking. Causes re-render of form.
  useEffect(() => {
    if (Object.entries(values).length === 0) {
      let fields = {
        zip: "",
        courtId: "",
        leagueName: "",
        leagueCost: "",
        dayOfLeague: "",
        time: "12:00",
        startDate: "",
        duration: "",
        registrationDeadline: "",
        format: "",
        type: "",
        gender: "",
        environment: "",
        maxTeams: "",
        preferredSurface: "",
        noofDivisions: "",
      };
      initVals(fields);
    }
  }, [values]);

  const notify = (txt) =>
    toast.dark(txt, {
      position: "top-center",
      autoClose: 3000,
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

  let history = useHistory();

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
    let startDate = convertDate(values.startDate);
    let registrationDeadline = convertDate(values.registrationDeadline);

    var objVals = {
      leagueName: values.leagueName,
      gender: values.gender,
      leagueCost: convertCost(values.leagueCost),
      zip: values.zip,
      dayOfLeague: values.dayOfLeague,
      time: values.time,
      startDate: startDate,
      duration: values.duration,
      registrationDeadline: registrationDeadline,
      format: values.format,
      type: values.type,
      environment: values.environment,
      maxTeams: values.maxTeams,
      preferredSurface: values.preferredSurface,
      noofDivisions: values.noofDivisions,
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
      url: server + "/league-create",
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
          notify("League created.");
          setCookie("currentLid", res.data.leagueId, 1);
          setTimeout(function () {
            history.push("/admin/view-league");
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
        notify("Creating League Failed. Try again later.");
      });
  }

  return (
    <>
      <div
        className={`l-content--column ${showCourtForm == true ? "u-hide" : ""}`}
      >
        <section className="c-createForm">
          <form id="c-createForm" onSubmit={leagueSubmit}>
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
                  <div className="e-viewForm__text">
                    {" "}
                    {locationId.address +
                      " " +
                      locationId.city +
                      " " +
                      locationId.zip}
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
                    values.courtId == "" && "disabled"
                  }`}
                >
                  Cost
                </label>
                <NumberFormat
                  displayType="input"
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
                items={dayitems}
                disabled={values.courtId == "" && "disabled"}
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
                items={durationitems}
                disabled={values.courtId == "" && "disabled"}
              />
              {errors.registrationDeadline && (
                <li className="e-createForm__error--message u-align__text--right">
                  <div className="e-createForm__label.e-createForm__label--error">
                    {errors.registrationDeadline}
                  </div>
                </li>
              )}
              <li className="e-createForm__liEntry">
                <label
                  className={`e-createForm__label e-createForm__label--registration ${
                    values.courtId == "" && "disabled"
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
                  name="registrationDeadline"
                  mask={["M", "M", "D", "D", "Y", "Y"]}
                  onChange={handleChange}
                  value={values.registrationDeadline || ""}
                />
              </li>
              {errors.startDate && (
                <li className="e-createForm__error--message u-align__text--right">
                  <div className="e-createForm__label.e-createForm__label--error">
                    {errors.startDate}
                  </div>
                </li>
              )}
              <li className="e-createForm__liEntry">
                <label
                  className={`e-createForm__label e-createForm__label--registration ${
                    values.courtId == "" && "disabled"
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
                  id="e-createForm__text--registration"
                  name="startDate"
                  mask={["M", "M", "D", "D", "Y", "Y"]}
                  onChange={handleChange}
                  value={values.startDate || ""}
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
                items={formatitems}
                disabled={values.courtId == "" && "disabled"}
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
                items={typeitems}
                disabled={values.courtId == "" && "disabled"}
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
                items={genderitems}
                disabled={values.courtId == "" && "disabled"}
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
                items={surfaceitems}
                disabled={values.courtId == "" && "disabled"}
              />
            </div>
            <p className="u-component_labels">Divisions</p>
            <div
              className={`l-content__flexContainer--left--SectionCard u-card`}
            >
              {errors.noofDivisions && (
                <li className="e-createForm__error--message u-align__text--right">
                  <div className="e-createForm__label.e-createForm__label--error">
                    {errors.noofDivisions}
                  </div>
                </li>
              )}
              <li className="e-createForm__liEntry">
                <label
                  className={`e-createForm__label e-createForm__label--divisions ${
                    values.courtId == "" && "disabled"
                  }`}
                >
                  Divisions
                </label>
                <input
                  type="text"
                  className={`e-createForm__text e-createForm__text--small  ${
                    values.courtId == "" && "disabled"
                  }`}
                  id="e-createForm__text--divisions"
                  name="noofDivisions"
                  onChange={handleChange}
                  value={values.noofDivisions || ""}
                />
              </li>
              <span className="u-small_body_text">
                (Timed or Sets game play is set at the division level after
                divisions are created.)
              </span>
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
                <span id="js-filename">{rulesdoc && rulesdoc.rules.name}</span>
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
            onClick={resetForm}
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
            {data.isSubmitting ? "Sending..." : "Create"}
          </button>
        </span>
      </div>
      <CreateCourt show={showCourtForm} onCreate={handleShowCF} />
    </>
  );
};

export default CreateLeague;
