import React, { useState, useEffect } from "react";
import DDmenu from "./DDmenu/DDmenu";
import axios from "axios";
import useForm from "./forms/useForm";
import validate from "./forms/FormValidation";
import NumberFormat from "react-number-format";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  dayitems,
  matchformat,
  gametypeitems,
  reffingitems,
  scoringitems
} from "./forms/divisionValues";
import lIcon from "../../public/images/icons/icons-photo-league.svg";
import dotenv from "dotenv";

dotenv.config();
var server = process.env.API_URL;

const EditDivision = ({ league, divId, cancel, refresh }) => {
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

  const initialstate = {
    //league and division values in ld
    ld: {},
    isLoading: true,
    isSubmitting: false,
    errorMessage: null,
  };

  //from props/parent data
  const [data, setData] = useState(initialstate);

  let vals, fields;

  const initValsFromAPI = (league, division) => {
    if ((league, division)) {
      //form values saved in form state
      vals = {
        leagueIcon: league.icon,
        leagueName: league.name,
        divisionName: division.division,
        divisionCost: division.cost,
        courtsAvailable: division.courtsAvailable,
        courtStartNumber: division.courtStartNumber,
        teamsPerCourt: division.teamsPerCourt,
        matchesPerCourt: division.matchesPerCourt,
        gameType: division.gameType,
        divisionDay: division.divisionDay,
        divTime: division.time,
        matchFormat: division.matchFormat,
        teamReffing: division.teamReffing,
        scoreTracking: division.scoreTracking,
        divisionId: division.divisionId,
      };
      //display state bc data must be converted to displayable value. Not all are used.
      fields = {
        icon: league.icon,
        name: league.name,
        divName: division.division,
        cost: division.cost,
        courtsAvailable: division.courtsAvailable,
        courtStartNumber: division.courtStartNumber,
        teamsPerCourt: division.teamsPerCourt,
        matchesPerCourt: division.matchesPerCourt,
        gameType: getTextItem(division.gameType, gametypeitems),
        divisionDay: getTextItem(division.divisionDay, dayitems),
        divTime: convertTime(division.time),
        matchFormat: getTextItem(division.matchFormat, matchformat),
        teamReffing: getTextItem(division.teamReffing, reffingitems),
        scoreTracking: getTextItem(division.scoreTracking, scoringitems),
        divisionId: division.divisionId,
      };

      initVals(vals);
      return fields;
    }
  };

  function currentDiv() {
    let divis = league.divisions;
    let cd = divis.find((div) => div.divisionId == divId);
    return cd;
  }

  useEffect(() => {
    let divData = currentDiv();
    setData({
      ...data,
      ld: initValsFromAPI(league, divData),
      isLoading: false,
    });
  }, []);

  function getTextItem(num, items) {
    if (num) {
      num = parseInt(num);
      let obj, text;
      if (items) obj = items.find((o) => o.value === num);
      if (obj) text = obj.text;
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

  const setValFromDD = (field, val) => {
    handleDDChange(field, val);
  };

  function sendForm(e) {
    setData({
      ...data,
      isSubmitting: true,
    });

    function convertCost(cost) {
      return cost.replace(/[^0-9.]/g, "");
    }

    var objVals = {
      divisionName: values.divisionName,
      divisionCost: convertCost(values.divisionCost),
      courtsAvailable: values.courtsAvailable,
      courtStartNumber: values.courtStartNumber,
      teamsPerCourt: values.teamsPerCourt,
      matchesPerCourt: values.matchesPerCourt,
      gameType: values.gameType,
      divisionDay: values.divisionDay,
      time: values.divTime,
      matchFormat: values.matchFormat,
      teamReffing: values.teamReffing,
      scoreTracking: values.scoreTracking,
      divisionId: values.divisionId,
    };

    const formData = new FormData();

    let _keys = Object.keys(objVals);
    let a = 0;

    for (a = _keys.length - 1; a >= 0; a--) {
      formData.set(_keys[a], objVals[_keys[a]]);
    }

    // axios stuff here
    axios({
      method: "post",
      url: server + "/edit-division",
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
          notify("Division updated.");

          setTimeout(function () {
            refresh();
            cancel();
          }, 3200);
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

  let ld = data.ld;
  if (data.isLoading || !data.ld) return "Loading...";
  return (
    <div className="l-content__column">
      <section className="c-createForm u-mt40">
        <form id="c-createForm" onSubmit={handleSubmit}>
          <div className="l-content__flexContainer--column">
            <div
              className={`l-content__flexContainer u-mb40 l-content__flexContainer--row`}
            >
              <div className="l-content__flexContainer--column">
                <img
                  src={
                    ld.icon !== ""
                      ? "https://avp-backend.com/" + ld.icon
                      : lIcon
                  }
                  className="e-input__imgUploadIcon"
                  height="200"
                  alt="Image preview"
                />
              </div>
              <div className="l-content__flexContainer--column">
                <div className="e-input__name">{ld.name}</div>
                <div
                  className={`l-content__flexContainer u-mb25 l-content__flexContainer--row`}
                >
                  <label className="e-input__label"></label>
                  <input
                    className={`e-input__name e-input__name--division`}
                    type="text"
                    name="divisionName"
                    required
                    onChange={handleChange}
                    value={values.divisionName || ""}
                  />
                  <button
                    className={`e-close u-mt35`}
                    type="button"
                    onClick={() => {
                      handleClear("divisionName");
                    }}
                  ></button>
                </div>
              </div>
            </div>
          </div>
          <p>
            *some fields may not be editable depending on registration status.
          </p>
          <p className="u-component_labels">
            Settings <span className="u-small_body_text">(all required)</span>
          </p>
          <div
            className={`l-content__flexContainer--left--SectionCard u-card u-mb35`}
          >
            {errors.divisionCost && (
              <li className="e-createForm__error--message u-align__text--right">
                <div className="e-createForm__label.e-createForm__label--error">
                  {errors.divisionCost}
                </div>
              </li>
            )}
            <li className={`e-createForm__liEntry`}>
              <label
                className={`e-createForm__label e-createForm__label--cost  ${
                  league.leagueStatus !== "1" && "disabled"
                }`}
              >
                Cost
              </label>
              <NumberFormat
                displayType="input"
                thousandSeparator={true}
                disabled={league.leagueStatus !== "1"}
                prefix={"$"}
                className={`e-createForm__text  e-createForm__text--small ${
                  league.leagueStatus !== "1" && "disabled"
                }`}
                name="divisionCost"
                onChange={handleChange}
                value={values.divisionCost || ""}
              />
            </li>

            {errors.gameType && (
              <li className="e-createForm__error--message u-align__text--right">
                <div className="e-createForm__label.e-createForm__label--error">
                  {errors.gameType}
                </div>
              </li>
            )}
            <DDmenu
              label={"Gender"}
              modifier={"--gender"}
              name={"gameType"}
              selCallBack={setValFromDD}
              selected={ld.gameType}
              items={gametypeitems}
              disabled={league.leagueStatus !== "1" ? "disabled" : ""}
            />

            {errors.divisionDay && (
              <li className="e-createForm__error--message u-align__text--right">
                <div className="e-createForm__label.e-createForm__label--error">
                  {errors.divisionDay}
                </div>
              </li>
            )}
            <DDmenu
              label={"Day of League"}
              modifier={"--day"}
              name={"divisionDay"}
              selCallBack={setValFromDD}
              selected={ld.divisionDay}
              items={dayitems}
              disabled={league.leagueStatus !== "1" ? "disabled" : ""}
            />

            {errors.divTime && (
              <li className="e-createForm__error--message u-align__text--right">
                <div className="e-createForm__label.e-createForm__label--error">
                  {errors.divTime}
                </div>
              </li>
            )}
            <li className="e-createForm__liEntry">
              <label
                className={`e-createForm__label e-createForm__label--time`}
              >
                Time
              </label>
              <input
                className={`e-createForm__text`}
                id="e-createForm__text--time"
                type="time"
                name="divTime"
                placeholder="12:00"
                required
                onChange={handleChange}
                value={values.divTime || ""}
              />
            </li>

            {errors.matchFormat && (
              <li className="e-createForm__error--message u-align__text--right">
                <div className="e-createForm__label.e-createForm__label--error">
                  {errors.matchFormat}
                </div>
              </li>
            )}
            <DDmenu
              label={"Match Format"}
              modifier={"--position"}
              name={"matchFormat"}
              selCallBack={setValFromDD}
              selected={ld.matchFormat}
              items={matchformat}
            />

            {errors.courtsAvailable && (
              <li className="e-createForm__error--message u-align__text--right">
                <div className="e-createForm__label.e-createForm__label--error">
                  {errors.courtsAvailable}
                </div>
              </li>
            )}
            <li className="e-createForm__liEntry">
              <label
                className={`e-createForm__label e-createForm__label--courts`}
              >
                Courts Available
              </label>
              <input
                className={`e-createForm__text e-createForm__text--small`}
                name="courtsAvailable"
                onChange={handleChange}
                value={values.courtsAvailable || ""}
              />
            </li>

            {errors.courtStartNumber && (
              <li className="e-createForm__error--message u-align__text--right">
                <div className="e-createForm__label.e-createForm__label--error">
                  {errors.courtStartNumber}
                </div>
              </li>
            )}
            <li className="e-createForm__liEntry">
              <label
                className={`e-createForm__label e-createForm__label--courts`}
              >
                Courts Start Number
              </label>
              <input
                className={`e-createForm__text e-createForm__text--small`}
                name="courtStartNumber"
                onChange={handleChange}
                value={values.courtStartNumber || ""}
              />
            </li>

            {errors.teamsPerCourt && (
              <li className="e-createForm__error--message u-align__text--right">
                <div className="e-createForm__label.e-createForm__label--error">
                  {errors.teamsPerCourt}
                </div>
              </li>
            )}
            <li className="e-createForm__liEntry">
              <label
                className={`e-createForm__label e-createForm__label--maxPlayers`}
              >
                Teams Per Court
              </label>
              <input
                className={`e-createForm__text e-createForm__text--small`}
                name="teamsPerCourt"
                onChange={handleChange}
                value={values.teamsPerCourt || ""}
              />
            </li>

            {errors.matchesPerCourt && (
              <li className="e-createForm__error--message u-align__text--right">
                <div className="e-createForm__label.e-createForm__label--error">
                  {errors.matchesPerCourt}
                </div>
              </li>
            )}
            <li className="e-createForm__liEntry">
              <label
                className={`e-createForm__label e-createForm__label--position`}
              >
                Matches Per Court
              </label>
              <input
                className={`e-createForm__text e-createForm__text--small`}
                name="matchesPerCourt"
                onChange={handleChange}
                value={values.matchesPerCourt || ""}
              />
            </li>

            {errors.teamReffing && (
              <li className="e-createForm__error--message u-align__text--right">
                <div className="e-createForm__label.e-createForm__label--error">
                  {errors.teamReffing}
                </div>
              </li>
            )}
            <DDmenu
              label={"Team Reffing"}
              modifier={"--pencil"}
              name={"teamReffing"}
              selCallBack={setValFromDD}
              selected={ld.teamReffing}
              items={reffingitems}
            />

            {errors.scoreTracking && (
              <li className="e-createForm__error--message u-align__text--right">
                <div className="e-createForm__label.e-createForm__label--error">
                  {errors.scoreTracking}
                </div>
              </li>
            )}
            <DDmenu
              label={"Score Tracking"}
              modifier={"--score"}
              name={"scoreTracking"}
              selCallBack={setValFromDD}
              selected={ld.scoreTracking}
              items={scoringitems}
            />
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
          <span
            className={`l-content__flexContainer--right u-sticky__bottomBtns u-mt50`}
          >
            <button
              className={`e-btn--small e-btn--secondary`}
              onClick={cancel}
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
        </form>
      </section>
      <ToastContainer />
    </div>
  );
};

export default EditDivision;
