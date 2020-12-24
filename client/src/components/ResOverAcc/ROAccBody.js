import React, { useState } from "react";
import axios from "axios";
import { useAccordionContext } from "../Accordion/hooks";
import ViewMatchOverview from "./ViewMatchOverview";
import EditMatches from "./EditMatches";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import teamImg from "../../../public/images/icons/icons-photo-team.svg";
import dotenv from "dotenv";

dotenv.config();
var server = process.env.API_URL;

const ROBody = ({ children, confirm, sent, setViewEdit, ...props }) => {
  // this is confusing but the match results from the api are called result
  let data = children.result;
  const { updateCollapse, onChangeBody, removeBtn } = useAccordionContext();

  const useUpdateCollapse = (s) => {
    //onChangeBody is just setUpDateCollapse, which triggers data update from api for this component from its parent Result.js.
    //not calling setupdatecollapse directly prevents unnecessary re-renders, and avoids using dispatch
    onChangeBody(s);
  };

  function removeMatch(id) {
    
    axios({
      method: "post",
      url: server + "/delete-match",
      data: {
        matchIds: id,
      },
      withCredentials: true,
    })
      .then((res) => {

        if (res.data.status == "Success") {
          notify("Match was removed.");
          onChangeBody(!updateCollapse);
        } else {
          throw res;
        }
      })
      .catch((error) => {
        console.error("removing match failed:", error);
        notify("Match was not removed.");
      });
  }

  function dupeMatch(id) {
    axios({
      method: "post",
      url: server + "/dupe-match",
      data: {
        matchId: id,
      },
      withCredentials: true,
    })
      .then((res) => {

        if (res.data.status == "Success") {
          notify("Match was added.");
          onChangeBody(!updateCollapse);
        } else {
          throw res;
        }
      })
      .catch((error) => {
        console.error("removing match failed:", error);
        notify("Match was not added.");
      });
  }

  const handleRemove = (mid) => {
    removeMatch(mid);
    useUpdateCollapse(false);
  };

  const handleDupe = (mid) => {
    dupeMatch(mid);
    useUpdateCollapse(false);
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

  if (data.length == 0 && !props.viewEdit)
    return (
      <div
        className={`l-content__flexContainer--center u-h3_inactive c-accordion__panel--empty`}
      >
        No matches found.
      </div>
    );
  if (data !== [] && !props.viewEdit)
    return (
      <>
        <ViewMatchOverview
          data={data}
          removeBtn={removeBtn}
          handleRemove={handleRemove}
        />
      </>
    );
  if (data.length == 0 && props.viewEdit)
    return (
      <div
        className={`l-content__flexContainer--center u-h3_inactive c-accordion__panel--empty`}
      >
        No matches found.
      </div>
    );
  if (data !== [] && props.viewEdit)
    return (
      <>
        <EditMatches
          matchData={data}
          handleDupe={handleDupe}
          update={() => useUpdateCollapse(true)}
          confirm={confirm}
          notify={notify}
          sent={sent}
          changeView={setViewEdit}
        />
        <ToastContainer />
      </>
    );
};

export default ROBody;
