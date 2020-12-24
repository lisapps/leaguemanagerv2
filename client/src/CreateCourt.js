import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import useForm from "./components/forms/useForm";
import validate from "./components/forms/FormValidation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import courtImg from "../public/images/icons/icons-photo-team.svg";
import {
  lineitems,
  antennaitems,
  heightitems,
  restroomitems,
  parkingitems,
} from "./components/forms/courtValues";
import DDmenu from "./components/DDmenu/DDmenu";
import dotenv from "dotenv";
import { AuthContext } from "./App";
import Cookies from "universal-cookie";

dotenv.config();
var server = process.env.API_URL;

const CreateCourt = ({ show, onCreate, ...props }) => {
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
    setValues,
    errors,
    handleChange,
    handleDDChange,
    handleSubmit,
    resetForm,
    initVals,
    handleClear,
  } = useForm(sendForm, validate);

  //form response data
  const [courtImage, setCourtImage] = useState({ preview: courtImg, raw: "" });
  const initialState = {
    isSubmitting: false,
    errorMessage: null,
  };
  const [data, setData] = useState(initialState);

  // set init form vals for required field checking. Causes re-render of form.
  useEffect(() => {
    if (Object.entries(values).length === 0) {
      let fields = {
        courtName: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        zip: "",
        overallRating: "",
        sandRating: "",
        netRating: "",
        noOfCourts: "",
        line: null,
        antenna: null,
        adjustableHeight: null,
        publicRestroom: null,
        parking: null,
      };
      initVals(fields);
    }
  }, []);

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
    toast.dark("Court created.", {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: false,
      progress: undefined,
    });

  const handleCourtImageChange = (e) => {
    if (e.target.files.length) {
      if (e.target.files[0].size > 700000) {
        notify();
      } else {
        setCourtImage({
          preview: URL.createObjectURL(e.target.files[0]),
          raw: e.target.files[0],
        });
      }
    }
  };

  const handleCancel = (e) => {
    resetForm();
    onCreate();
  };

  const setValFromDD = useCallback((field, val) => {
    handleDDChange(field, val);
  }, []);

  function sendForm(e) {

    setData({
      ...data,
      isSubmitting: true,
    });

    var objVals = {
      courtName: values.courtName,
      addressLine1: values.addressLine1,
      addressLine2: values.addressLine2,
      city: values.city,
      state: values.state,
      zip: values.zip,
      overallRating: values.overallRating,
      sandRating: values.sandRating == "" ? "1" : values.sandRating,
      netRating: values.netRating == "" ? "1" : values.netRating,
      noOfCourts: values.noOfCourts,
      line: values.line,
      antenna: values.antenna,
      adjustableHeight: values.adjustableHeight,
      publicRestroom: values.publicRestroom,
      parking: values.parking,
    };

    const formData = new FormData();

    let _keys = Object.keys(objVals);
    let a = 0;

    for (a = _keys.length - 1; a >= 0; a--) {
      formData.set(_keys[a], objVals[_keys[a]]);
    }

    // appending formData DOES NOT WORK. Must set.
    courtImage.raw
      ? formData.set("pic", courtImage.raw)
      : formData.set("pic", "");

    //axios stuff here
    axios({
      method: "post",
      url: server + "/create-court",
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
          document.getElementById("c-createForm--court").reset();
          setTimeout(function () {
            onCreate();
          }, 4200);
          setValues({});
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
        setTimeout(function () {
          onCreate();
          setValues({});
        }, 4200);
      });
  }

  if (show) {
    return (
      <>
        <div className={`l-main ${show == false ? "u-hide" : ""}`}>
          <section className={`c-createForm u-mt40`}>
            <form id="c-createForm--court" onSubmit={handleSubmit}>
              <div
                className={`l-content__flexContainer u-mb25 l-content__flexContainer--row`}
              >
                <div className="l-content__flexContainer--column">
                  <img
                    src={courtImage.preview}
                    className="e-input__imgUploadIcon"
                    height="200"
                    alt="Image preview"
                    onClick={() => {
                      document
                        .getElementById("e-input__fileUpload--court")
                        .click();
                    }}
                  />

                  <label
                    htmlFor="Upload"
                    className="e-input__imgLabel"
                    onClick={() => {
                      document
                        .getElementById("e-input__fileUpload--court")
                        .click();
                    }}
                  >
                    Upload Photo
                  </label>
                  <input
                    id="e-input__fileUpload--court"
                    name="courtImage"
                    type="file"
                    accept="image/*"
                    onChange={handleCourtImageChange}
                    value={values.courtImage}
                  />
                </div>
                <div className="l-content__flexContainer--column">
                  <div
                    className={`l-content__flexContainer l-content__flexContainer--row u-mt30`}
                  >
                    <input
                      className={`e-input__courtName`}
                      name="courtName"
                      id="e-createForm__teamName"
                      type="text"
                      placeholder="ENTER COURT NAME"
                      required
                      onChange={handleChange}
                      value={values.courtName || ""}
                    />
                    <button
                      className={`e-close e-close--columnClose`}
                      type="button"
                      onClick={() => {
                        handleClear("courtName");
                      }}
                    ></button>
                  </div>

                  <div
                    className={`l-content__flexContainer l-content__flexContainer--row`}
                  >
                    <input
                      className="e-input__address1"
                      name="addressLine1"
                      type="text"
                      placeholder="address line 1"
                      required
                      onChange={handleChange}
                      value={values.addressLine1 || ""}
                    />
                    <button
                      className={`e-close e-close--columnClose`}
                      type="button"
                      onClick={() => {
                        handleClear("addressLine1");
                      }}
                    ></button>
                  </div>

                  <div
                    className={`l-content__flexContainer l-content__flexContainer--row`}
                  >
                    <input
                      className="e-input__address2"
                      name="addressLine2"
                      type="text"
                      placeholder="address line 2"
                      onChange={handleChange}
                      value={values.addressLine2 || ""}
                    />
                    <button
                      className={`e-close e-close--columnClose`}
                      type="button"
                      onClick={() => {
                        handleClear("addressLine2");
                      }}
                    ></button>
                  </div>

                  <div
                    className={`l-content__flexContainer l-content__flexContainer--row`}
                  >
                    <input
                      className="e-input__city"
                      name="city"
                      type="text"
                      placeholder="city"
                      required
                      onChange={handleChange}
                      value={values.city || ""}
                    />
                    <button
                      className={`e-close e-close--columnClose`}
                      type="button"
                      onClick={() => {
                        handleClear("city");
                      }}
                    ></button>
                  </div>

                  <div
                    className={`l-content__flexContainer l-content__flexContainer--row`}
                  >
                    <input
                      className="e-input__state"
                      name="state"
                      type="text"
                      placeholder="state"
                      required
                      onChange={handleChange}
                      value={values.state || ""}
                    />
                    <button
                      className={`e-close e-close--columnClose`}
                      type="button"
                      onClick={() => {
                        handleClear("state");
                      }}
                    ></button>
                  </div>

                  <div
                    className={`l-content__flexContainer l-content__flexContainer--row`}
                  >
                    <input
                      className="e-input__zip"
                      name="zip"
                      type="text"
                      placeholder="zip"
                      required
                      onChange={handleChange}
                      value={values.zip || ""}
                    />
                    <button
                      className={`e-close e-close--columnClose`}
                      type="button"
                      onClick={() => {
                        handleClear("zip");
                      }}
                    ></button>
                  </div>
                </div>
              </div>
              <p className="u-component_labels">Information</p>
              <div
                className={`l-content__flexContainer--left--SectionCard u-card`}
              >
                {errors.overallRating && (
                  <li className="e-createForm__error--message u-align__text--right">
                    <div className="e-createForm__label.e-createForm__label--error">
                      {errors.overallRating}
                    </div>
                  </li>
                )}
                <li className="e-createForm__liEntry">
                  <label
                    className={`e-createForm__label e-createForm__label--overall`}
                  >
                    Overall Rating
                  </label>
                  <div className="c-rating">
                    <input
                      className={`e-input__radio hide`}
                      id="overall5"
                      name="overallRating"
                      type="radio"
                      value="5"
                      onChange={handleChange}
                    />
                    <label htmlFor="overall5"></label>
                    <input
                      className={`e-input__radio hide`}
                      id="overall4"
                      name="overallRating"
                      type="radio"
                      value="4"
                      onChange={handleChange}
                    />
                    <label htmlFor="overall4"></label>
                    <input
                      className={`e-input__radio hide`}
                      id="overall3"
                      name="overallRating"
                      type="radio"
                      value="3"
                      onChange={handleChange}
                    />
                    <label htmlFor="overall3"></label>
                    <input
                      className={`e-input__radio hide`}
                      id="overall2"
                      name="overallRating"
                      type="radio"
                      value="2"
                      onChange={handleChange}
                    />
                    <label htmlFor="overall2"></label>
                    <input
                      className={`e-input__radio hide`}
                      id="overall1"
                      name="overallRating"
                      type="radio"
                      value="1"
                      onChange={handleChange}
                    />
                    <label htmlFor="overall1"></label>
                  </div>
                </li>
                <li className="e-createForm__liEntry">
                  <label
                    className={`e-createForm__label e-createForm__label--sand`}
                  >
                    Sand Rating
                  </label>
                  <div className="c-rating">
                    <input
                      className={`e-input__radio hide`}
                      id="sand5"
                      name="sandRating"
                      type="radio"
                      value="5"
                      onChange={handleChange}
                    />
                    <label htmlFor="sand5"></label>
                    <input
                      className={`e-input__radio hide`}
                      id="sand4"
                      name="sandRating"
                      type="radio"
                      value="4"
                      onChange={handleChange}
                    />
                    <label htmlFor="sand4"></label>
                    <input
                      className={`e-input__radio hide`}
                      id="sand3"
                      name="sandRating"
                      type="radio"
                      value="3"
                      onChange={handleChange}
                    />
                    <label htmlFor="sand3"></label>
                    <input
                      className={`e-input__radio hide`}
                      id="sand2"
                      name="sandRating"
                      type="radio"
                      value="2"
                      onChange={handleChange}
                    />
                    <label htmlFor="sand2"></label>
                    <input
                      className={`e-input__radio hide`}
                      id="sand1"
                      name="sandRating"
                      type="radio"
                      value="1"
                      onChange={handleChange}
                    />
                    <label htmlFor="sand1"></label>
                  </div>
                </li>
                {errors.netRating && (
                  <li className="e-createForm__error--message u-align__text--right">
                    <div className="e-createForm__label.e-createForm__label--error">
                      {errors.netRating}
                    </div>
                  </li>
                )}
                <li className="e-createForm__liEntry">
                  <label
                    className={`e-createForm__label e-createForm__label--net`}
                  >
                    Net Rating
                  </label>
                  <div className="c-rating">
                    <input
                      className={`e-input__radio hide`}
                      id="net5"
                      name="netRating"
                      type="radio"
                      value="5"
                      onChange={handleChange}
                    />
                    <label htmlFor="net5"></label>
                    <input
                      className={`e-input__radio hide`}
                      id="net4"
                      name="netRating"
                      type="radio"
                      value="4"
                      onChange={handleChange}
                    />
                    <label htmlFor="net4"></label>
                    <input
                      className={`e-input__radio hide`}
                      id="net3"
                      name="netRating"
                      type="radio"
                      value="3"
                      onChange={handleChange}
                    />
                    <label htmlFor="net3"></label>
                    <input
                      className={`e-input__radio hide`}
                      id="net2"
                      name="netRating"
                      type="radio"
                      value="2"
                      onChange={handleChange}
                    />
                    <label htmlFor="net2"></label>
                    <input
                      className={`e-input__radio hide`}
                      id="net1"
                      name="netRating"
                      type="radio"
                      value="1"
                      onChange={handleChange}
                    />
                    <label htmlFor="net1"></label>
                  </div>
                </li>
                {errors.noOfCourts && (
                  <li className="e-createForm__error--message u-align__text--right">
                    <div className="e-createForm__label.e-createForm__label--error">
                      {errors.noOfCourts}
                    </div>
                  </li>
                )}
                <li className="e-createForm__liEntry">
                  <label
                    className={`e-createForm__label e-createForm__label--courts`}
                  >
                    Number of Courts
                  </label>
                  <input
                    type="text"
                    className={`e-createForm__text e-createForm__text--small`}
                    name="noOfCourts"
                    onChange={handleChange}
                    value={values.noOfCourts || ""}
                  />
                </li>
                {errors.line && (
                  <li className="e-createForm__error--message u-align__text--right">
                    <div className="e-createForm__label.e-createForm__label--error">
                      {errors.line}
                    </div>
                  </li>
                )}
                <DDmenu
                  label={"Lines"}
                  modifier={"--lines"}
                  name={"line"}
                  selCallBack={setValFromDD}
                  items={lineitems}
                />
                {errors.antenna && (
                  <li className="e-createForm__error--message u-align__text--right">
                    <div className="e-createForm__label.e-createForm__label--error">
                      {errors.antenna}
                    </div>
                  </li>
                )}
                <DDmenu
                  label={"Antennas"}
                  modifier={"--antennas"}
                  name={"antenna"}
                  selCallBack={setValFromDD}
                  items={antennaitems}
                />
                {errors.adjustableHeight && (
                  <li className="e-createForm__error--message u-align__text--right">
                    <div className="e-createForm__label.e-createForm__label--error">
                      {errors.adjustableHeight}
                    </div>
                  </li>
                )}
                <DDmenu
                  label={"Adjustable Height"}
                  modifier={"--adjust"}
                  name={"adjustableHeight"}
                  selCallBack={setValFromDD}
                  items={heightitems}
                />
                {errors.publicRestroom && (
                  <li className="e-createForm__error--message u-align__text--right">
                    <div className="e-createForm__label.e-createForm__label--error">
                      {errors.publicRestroom}
                    </div>
                  </li>
                )}
                <DDmenu
                  label={"Public Restrooms"}
                  modifier={"--position"}
                  name={"publicRestroom"}
                  selCallBack={setValFromDD}
                  items={restroomitems}
                />
                {errors.parking && (
                  <li className="e-createForm__error--message u-align__text--right">
                    <div className="e-createForm__label.e-createForm__label--error">
                      {errors.parking}
                    </div>
                  </li>
                )}
                <DDmenu
                  label={"Free Parking"}
                  modifier={"--gender"}
                  name={"parking"}
                  selCallBack={setValFromDD}
                  items={parkingitems}
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
                <button
                  type="button"
                  className={`e-btn--small e-btn--secondary`}
                  onClick={handleCancel}
                  disabled={data.isSubmitting}
                >
                  cancel
                </button>
                <button
                  className="e-btn--small"
                  type="submit"
                  disabled={data.isSubmitting}
                >
                  {data.isSubmitting ? "Sending..." : "Create"}
                </button>
              </div>
            </form>
            <ToastContainer />
          </section>
        </div>
      </>
    );
  }
  if (!show) return null;
};

export default CreateCourt;
