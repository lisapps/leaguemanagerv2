import React, { useState, useEffect } from "react";
import Dialog from "./Dialog";
import {
  genderitems,
  dayitems,
  matchformat,
  gametypeitems,
} from "./forms/divisionValues";
import lIcon from "../../public/images/icons/icons-photo-league.svg";
import dotenv from "dotenv";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

dotenv.config();
var server = process.env.API_URL;

const ViewDivision = ({ league, division, cancel, edit, refresh }) => {

let initialState = {
  isSubmitting: false,
  errorMessage: null,
}

const [divis, setDiv] = useState({});
const [data, setData] = useState(initialState);
const [showDialog, setShowDialog] = useState(false);
const handleDialogShow = () => setShowDialog(true);
const handleDialogClose = () => setShowDialog(false);

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
    if (time) {
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
  }

  const currentDiv = () => {
    let d = league.divisions;
    let cd = d.find(x => x.divisionId == division);
    return cd;
  }

  useEffect(()=>{
    setDiv(currentDiv)
  },[league,division])

  const handleDelete = () => {
    handleDialogShow();
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


  const divDelete = (d) => {
    setData({
      ...data,
      isSubmitting: true,
    })
    handleDialogClose();

    var objVals = { divisionId: division };
    const formData = new FormData();
    let _keys = Object.keys(objVals);
    let a = 0;

    for (a = _keys.length - 1; a >= 0; a--) {
      formData.set(_keys[a], objVals[_keys[a]]);
    }

    axios({
      method: "post",
      url: server + "/delete-division",
      data: formData,
      headers: {
        "content-type": "multipart/form-data",
      },
      withCredentials: true,
    })
      .then((res) => {
        if (res.data.status == "Success") {
          // setData({
          //   ...data,
          //   isSubmitting: false,
          // });
          notify("Division deleted!");
          setTimeout(function () {
            refresh();
            cancel();
          }, 3000);
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

  return (
    <section className={`l-content c-viewForm u-mt40`}>
      <div
        className={`l-content__flexContainer u-mb25 l-content__flexContainer--row`}
      >
        <img
          className="e-viewForm__imgUploadIcon"
          src={league.icon ? "https://avp-backend.com/" + league.icon : lIcon}
        />
        <div className="l-content__flexContainer--column">
          <div className={`e-viewForm__name e-viewForm__name`}>
            {league.name}
          </div>
          <div className={`e-viewForm__name e-viewForm__name--division`}>
            {divis.division + ` Division`}
          </div>
        </div>
      </div>
      <p className="u-component_labels">Settings</p>
      <div className={`l-content__flexContainer--left--SectionCard u-card`}>
        <li className="e-viewForm__liEntry">
          <label className={`e-viewForm__label e-viewForm__label--cost`}>
            Cost
          </label>
          <div className="e-viewForm__text">{`$` + divis.cost}</div>
        </li>
        <li className="e-viewForm__liEntry">
          <label className={`e-viewForm__label e-viewForm__label--gender`}>
            Gender
          </label>
          <div className="e-viewForm__text">
            {getTextItem(divis.gameType, gametypeitems)}
          </div>
        </li>
        <li className="e-viewForm__liEntry">
          <label className={`e-viewForm__label e-viewForm__label--day`}>
            Division Day
          </label>
          <div className="e-viewForm__text">
            {getTextItem(divis.divisionDay, dayitems)}
          </div>
        </li>
        <li className="e-viewForm__liEntry">
          <label className={`e-viewForm__label e-viewForm__label--time`}>
            Time
          </label>
          <div className="e-viewForm__text" id="e-viewForm__text--time">
            {convertTime(divis.time)}
          </div>
        </li>
        <li className="e-viewForm__liEntry">
          <label className={`e-viewForm__label e-viewForm__label--position`}>
            Match Format
          </label>
          <div className="e-viewForm__text">
            {getTextItem(divis.matchFormat, matchformat)}
          </div>
        </li>
        <li className="e-viewForm__liEntry">
          <label className={`e-viewForm__label e-viewForm__label--court`}>
            Courts Available
          </label>
          <div className="e-viewForm__text">{divis.courtsAvailable}</div>
        </li>
        <li className="e-viewForm__liEntry">
          <label className={`e-viewForm__label e-viewForm__label--court`}>
            Court Start Number
          </label>
          <div className="e-viewForm__text">{divis.courtStartNumber}</div>
        </li>
        <li className="e-viewForm__liEntry">
          <label className={`e-viewForm__label e-viewForm__label--maxplayers`}>
            Teams per Court
          </label>
          <div className="e-viewForm__text">{divis.teamsPerCourt}</div>
        </li>
        <li className="e-viewForm__liEntry">
          <label className={`e-viewForm__label e-viewForm__label--position`}>
            Matches per Court
          </label>
          <div className="e-viewForm__text">{divis.matchesPerCourt}</div>
        </li>
        <li className="e-viewForm__liEntry">
          <label className={`e-viewForm__label e-viewForm__label--whistle`}>
            Team Reffing
          </label>
          <div className="e-viewForm__text">
            {divis.teamReffing == 1 ? `Yes` : `No`}
          </div>
        </li>
        <li className="e-viewForm__liEntry">
          <label className={`e-viewForm__label e-viewForm__label--pencil`}>
            Score Tracking
          </label>
          <div className="e-viewForm__text">
            {divis.scoreTracking == 1 ? `Yes` : `No`}
          </div>
        </li>
      </div>
      <span className={`l-content__flexContainer--right u-sticky__bottomBtns`}>
        <button
          className={`e-btn--small e-btn--secondary`}
          onClick={cancel}
          type="button"
          disabled={data.isSubmitting}
        >
          cancel
        </button>
        <button className={`e-btn--small`} type="button" onClick={edit} disabled={data.isSubmitting}>
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
                divDelete();
              },
              type: "primary",
            },
          ]}
          heading={"Are you sure?"}
          content={"This will DELETE the divis."}
        />
        <ToastContainer />
    </section>
  );
};

export default ViewDivision;
