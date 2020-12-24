import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import dotenv from "dotenv";

dotenv.config();
var server = process.env.API_URL;

const RemindPlauyerButton = (props) => {
  //move this and toast to reg state and use context
  const [sent, setSent] = useState(null);

  const notifySuccess = () =>
    toast.dark("Reminder sent.", {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: false,
      progress: undefined,
    });

  const notifyFail = () =>
    toast.dark(
      "There was a problem. Either contact the team captain directly or AVP for more information.",
      {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: false,
        progress: undefined,
      }
    );

  const handleClick = (e, id) => {
    setSent("sending");
  };

  if (props.paid == "Not Paid")
    return (
      <>
        <button
          className={sent == null ? "e-btn" : "e-btn--secondary"}
          onClick={(e) => handleClick(e, props.id)}
        >
          {sent == null ? "remind" : sent == "sending" ? "Sending" : ""}
        </button>
        <ToastContainer />
      </>
    );
  if (props.paid == "Paid")
    return <button className="e-btn--secondary"></button>;
  return <span>no data</span>;
};

export default RemindPlauyerButton;
