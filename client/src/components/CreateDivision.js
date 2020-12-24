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
  scoringitems,
} from "./forms/divisionValues";
import dotenv from "dotenv";

dotenv.config();
var server = process.env.API_URL;

const CreateDivision = ({ cancel, refresh }) => {
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
    isLoading: true,
    isSubmitting: false,
    errorMessage: null,
  };

  const [data, setData] = useState(initialstate);

  useEffect(() => {
    if (Object.entries(values).length === 0) {
      let fields = {
        divisionName: "",
        divisionCost: "",
        courtsAvailable: "",
        courtStartNumber: "",
        teamsPerCourt: "",
        matchesPerCourt: "",
        gameType: "",
        divisionDay: "",
        divTime: "12:00",
        matchFormat: "",
        teamReffing: "",
        scoreTracking: "",
      };
      initVals(fields);
    }
  }, [values]);

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

  function getTextItem(num, items) {
    if (num) {
      num = parseInt(num);
      let obj, text;
      if (items) obj = items.find((o) => o.value === num);
      if (obj) text = obj.text;
      return text;
    }
  }

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
    };

    const formData = new FormData();

    let _keys = Object.keys(objVals);
    let a = 0;

    for (a = _keys.length - 1; a >= 0; a--) {
      formData.set(_keys[a], objVals[_keys[a]]);
    }

    //axios stuff here
    axios({
      method: "post",
      url: server + "/create-division",
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
          notify("Divsion Created");

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

  return (
    <div className="l-main">
      <section className={`c-createForm`}>
        <form id="c-createForm" onSubmit={handleSubmit}>
          <div className={`l-content__flexContainer--column u-mt40`}>
            <div
              className={`l-content__flexContainer u-mb25 l-content__flexContainer--row justify-center`}
            >
              <input
                className={`e-input__name e-input__name--division`}
                type="text"
                name="divisionName"
                required
                onChange={handleChange}
                value={values.divisionName || ""}
                placeholder="division name"
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
          <p className="u-component_labels">
            Settings <span className="u-small_body_text">(all required)</span>
          </p>
          <div
            className={`l-content__flexContainer--left--SectionCard u-card u-mb35`}
          >
            {errors.divisionCost && (
              <li
                className={`e-createForm__error--message u-align__text--right`}
              >
                <div
                  className={`e-createForm__label.e-createForm__label--error`}
                >
                  {errors.divisionCost}
                </div>
              </li>
            )}
            <li className={`e-createForm__liEntry`}>
              <label
                className={`e-createForm__label e-createForm__label--cost`}
              >
                Cost
              </label>
              <NumberFormat
                displayType="input"
                thousandSeparator={true}
                prefix={"$"}
                className={`e-createForm__text  e-createForm__text--small`}
                name="divisionCost"
                onChange={handleChange}
                value={values.divisionCost || ""}
              />
            </li>

            {errors.gameType && (
              <li
                className={`e-createForm__error--message u-align__text--right`}
              >
                <div
                  className={`e-createForm__label.e-createForm__label--error`}
                >
                  {errors.gameType}
                </div>
              </li>
            )}
            <DDmenu
              label={"Gender"}
              modifier={"--gender"}
              name={"gameType"}
              selCallBack={setValFromDD}
              items={gametypeitems}
            />

            {errors.divisionDay && (
              <li
                className={`e-createForm__error--message u-align__text--right`}
              >
                <div
                  className={`e-createForm__label.e-createForm__label--error`}
                >
                  {errors.divisionDay}
                </div>
              </li>
            )}
            <DDmenu
              label={"Day of League"}
              modifier={"--day"}
              name={"divisionDay"}
              selCallBack={setValFromDD}
              items={dayitems}
            />

            {errors.time && (
              <li
                className={`e-createForm__error--message u-align__text--right`}
              >
                <div
                  className={`e-createForm__label.e-createForm__label--error`}
                >
                  {errors.time}
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
                required
                onChange={handleChange}
                value={values.divTime || "12:00"}
              />
            </li>

            {errors.matchFormat && (
              <li
                className={`e-createForm__error--message u-align__text--right`}
              >
                <div
                  className={`e-createForm__label.e-createForm__label--error`}
                >
                  {errors.matchFormat}
                </div>
              </li>
            )}
            <DDmenu
              label={"Match Format"}
              modifier={"--position"}
              name={"matchFormat"}
              selCallBack={setValFromDD}
              items={matchformat}
            />

            {errors.courtsAvailable && (
              <li
                className={`e-createForm__error--message u-align__text--right`}
              >
                <div
                  className={`e-createForm__label.e-createForm__label--error`}
                >
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
              <li
                className={`e-createForm__error--message u-align__text--right`}
              >
                <div
                  className={`e-createForm__label.e-createForm__label--error`}
                >
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
              <li
                className={`e-createForm__error--message u-align__text--right`}
              >
                <div
                  className={`e-createForm__label.e-createForm__label--error`}
                >
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
              <li
                className={`e-createForm__error--message u-align__text--right`}
              >
                <div
                  className={`e-createForm__label.e-createForm__label--error`}
                >
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
              <li
                className={`e-createForm__error--message u-align__text--right`}
              >
                <div
                  className={`e-createForm__label.e-createForm__label--error`}
                >
                  {errors.teamReffing}
                </div>
              </li>
            )}
            <DDmenu
              label={"Team Reffing"}
              modifier={"--pencil"}
              name={"teamReffing"}
              selCallBack={setValFromDD}
              items={reffingitems}
            />

            {errors.scoreTracking && (
              <li
                className={`e-createForm__error--message u-align__text--right`}
              >
                <div
                  className={`e-createForm__label.e-createForm__label--error`}
                >
                  {errors.scoreTracking}
                </div>
              </li>
            )}
            <DDmenu
              label={"Score Tracking"}
              modifier={"--score"}
              name={"scoreTracking"}
              selCallBack={setValFromDD}
              items={scoringitems}
            />
          </div>
          <div className={`l-content__flexContainer--right u-mt25`}>
            {data.errorMessage && (
              <li
                className={`e-createForm__error--message u-align__text--right`}
              >
                <div
                  className={`e-createForm__label.e-createForm__label--error`}
                >
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
              disabled={data.isSubmitting}
            >
              cancel
            </button>
            <button
              className="e-btn--small"
              form="c-createForm"
              disabled={data.isSubmitting}
            >
              {data.isSubmitting ? "Sending..." : "Create"}
            </button>
          </span>
        </form>
      </section>
      <ToastContainer />
    </div>
  );
};

export default CreateDivision;
