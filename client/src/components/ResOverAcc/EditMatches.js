import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import teamImg from "../../../public/images/icons/icons-photo-team.svg";
import dotenv from "dotenv";

dotenv.config();
var server = process.env.API_URL;

const EditMatches = ({
  matchData,
  handleDupe,
  update,
  confirm,
  notify,
  sent,
  changeView
}) => {
  const initialstate = {
    editedMatches: [],
    isLoading: true,
    isSubmitting: false,
    errorMessage: null,
  };

  //-- form values --//
  const [values, setValues] = useState([]);
  //-- component loading and updated matches values --//
  const [data, setData] = useState(initialstate);

  //-- data from api as initial form values --//
  

  const initVals = (vals) => {
    setValues((values) => [...values, ...vals]);
  };

  

  const initValsFromAPI = (matchData) => {

    let vals = [];

    if (matchData) {
      //form values saved in form state
      matchData.map((match, index) => {
        let m = {
          matchId: match.leagueMatchId,
          [`setA1`]: match.setWiseScore[0] ? match.setWiseScore[0][0] : "",
          [`setA2`]: match.setWiseScore[1] ? match.setWiseScore[1][0] : "",
          [`setA3`]: match.setWiseScore[2] ? match.setWiseScore[2][0] : "",
          [`setA4`]: match.setWiseScore[3] ? match.setWiseScore[3][0] : "",
          [`setA5`]: match.setWiseScore[4] ? match.setWiseScore[4][0] : "",
          [`setB1`]: match.setWiseScore[0] ? match.setWiseScore[0][1] : "",
          [`setB2`]: match.setWiseScore[1] ? match.setWiseScore[1][1] : "",
          [`setB3`]: match.setWiseScore[2] ? match.setWiseScore[2][1] : "",
          [`setB4`]: match.setWiseScore[3] ? match.setWiseScore[3][1] : "",
          [`setB5`]: match.setWiseScore[4] ? match.setWiseScore[4][1] : "",
        };

        vals.push(m);
      });
      initVals(vals);
    }
  };

  const handleChange = (event, index, id) => {
    let mid = parseInt(id);
    let arr = data.editedMatches;

    event.persist && event.persist();

    //if the match id isn't already there, add to editedMatches
    var exists = arr.includes(mid);
    if (!exists) {
      setData({
        ...data,
        editedMatches: [...data.editedMatches, mid],
      });
    }

    //add updated scores to values state onchange
    let newArr = [...values];
    let name = event.target.name;
    newArr[index][name] = event.target.value;
    setValues(newArr);
  };;

  useEffect(() => {
    initValsFromAPI(matchData);
    setData({
      ...data,
      isLoading: false,
    });
  }, []);


  function sendForm() {
    let arrA = [];
    let arrB = [];
    let matchTempArr = [];
    let matchString = "";

    if (data.editedMatches.length < 1) {
      notify("No matches were edited.");
      sent();
      return;
    } else {
      matchString = data.editedMatches.join();
      data.editedMatches.map((id) => {
        // find edited matches from state
        let match = values.filter((item) => item.matchId == id);
        // keep them in temp arr for sorting
        match && matchTempArr.push(...match);
      });
    }

    if (matchTempArr.length > 0) {
      let len = matchTempArr.length;
      for (let i = 0; i < len; i++) {
        let m = matchTempArr[i];
        // teamA scores
        let tasArr = [];
        // teamB scores
        let tbsArr = [];

        // prevent error if user deletes one of 2 required scores
        m.setA1 == "" && m.setA2 !== "" ? tasArr.push("0", m.setA2)
          : m.setA1 !== "" && m.setA2 == "" ? tasArr.push(m.setA1, "0")
          : tasArr.push(m.setA1, m.setA2);
          // tasArr.push(m.setA1, m.setA2);
        // add rest of teamA scores to send data if any
        m.setA3 !== "" && tasArr.push(m.setA3);
        m.setA4 !== "" && tasArr.push(m.setA4);
        m.setA5 !== "" && tasArr.push(m.setA5);

        m.setB1 == "" && m.setB1 == "0";
        m.setB2 == "" && m.setB2 == "0";
        // prevent error if user deletes one of 2 required scores
        m.setB1 == "" && m.setB2 !== "" ? tbsArr.push("0", m.setB2)
          : m.setB1 !== "" && m.setB2 == "" ? tbsArr.push(m.setB1, "0")
          : tbsArr.push(m.setB1, m.setB2);
          // tbsArr.push(m.setB1, m.setB2);
          // add rest of teamB scores to send data if any
        m.setB3 !== "" && tbsArr.push(m.setB3);
        m.setB4 !== "" && tbsArr.push(m.setB4);
        m.setB5 !== "" && tbsArr.push(m.setB5);

        arrA.push(tasArr);
        arrB.push(tbsArr);
      }
    }

    // axios stuff here
    axios({
      method: "post",
      url: server + "/edit-results",
      data: {
        mids: matchString,
        ta: arrA,
        tb: arrB,
      },
      withCredentials: true,
    })
      .then((res) => {
        if (res.data.status == "Success") {
          notify("Results updated.");
          setTimeout(function () {
            sent();
            update();
            changeView();
          }, 3200);
        } else {
          throw res;
        }
      })
      .catch((error) => {
        notify(error.statusText);
        sent();
      });
    
  }

  //-- listens for confirm button click in parent  --//
  confirm && sendForm(); 

  if (data.isLoading) return "Loading...";
  return (
    <form>
      <div
        className={`c-accordion__panel c-teamTable u-animated u-animated--faster a-fadeIn`}
      >
        {matchData.map((match, index) => (
          <div key={match.leagueMatchId}>
            <div
              className={`l-content__flexContainer l-content__flexContainer--row justify-space-between`}
            >
              <div className="c-match__date">{match.leagueMatchDate}</div>
              <span className={`js-addMatch e-btn__plus`}>
                <span
                  className={`e-plus tooltip--top`}
                  aria-label="Add a match with these teams."
                  onClick={() => handleDupe(match.leagueMatchId)}
                >
                  + Add Match
                </span>
              </span>
            </div>

            <div
              className={`l-content__flexContainer l-content__flexContainer--row u-mb15`}
            >
              <div
                className={
                  `c-match__results c-match__results--scores c-card` +
                  (match.disputed == 1 ? `c-match__results--disputed` : "")
                }
                aria-label="Saving changes to a disputed match closes the dispute."
              >
                <div className={`e-match__overview e-match__overview--edit`}>
                  <div className="e-score__cell">
                    <img
                      className="u-img-rounded"
                      src={
                        match.teamAProfilePicture
                          ? "https://avp-backend.com/" +
                            match.teamAProfilePicture
                          : teamImg
                      }
                    />
                    <span className="e-match__teamName">{match.teamAName}</span>
                  </div>

                  {/* start sets */}
                  <div className="e-match__score">
                    <input
                      type="number"
                      name={`setA1`}
                      value={values[index].setA1 || ""}
                      min="0"
                      max="99"
                      onChange={(e) =>
                        handleChange(e, index, match.leagueMatchId)
                      }
                    />
                  </div>
                  <div className="e-match__score">
                    <input
                      type="number"
                      name={`setA2`}
                      value={values[index].setA2}
                      min="0"
                      max="99"
                      onChange={(e) =>
                        handleChange(e, index, match.leagueMatchId)
                      }
                    />
                  </div>
                  <div className="e-match__score">
                    <input
                      type="number"
                      name={`setA3`}
                      value={values[index].setA3}
                      min="0"
                      max="99"
                      onChange={(e) =>
                        handleChange(e, index, match.leagueMatchId)
                      }
                    />
                  </div>
                  <div className="e-match__score">
                    <input
                      type="number"
                      name={`setA4`}
                      value={values[index].setA4}
                      min="0"
                      max="99"
                      onChange={(e) =>
                        handleChange(e, index, match.leagueMatchId)
                      }
                    />
                  </div>
                  <div className="e-match__score">
                    <input
                      type="number"
                      name={`setA5`}
                      value={values[index].setA5}
                      min="0"
                      max="99"
                      onChange={(e) =>
                        handleChange(e, index, match.leagueMatchId)
                      }
                    />
                  </div>
                  <div className="e-match__center">VS</div>
                  <div className="e-match__score">
                    <input
                      type="number"
                      name="setB1"
                      value={values[index].setB1}
                      min="0"
                      max="99"
                      onChange={(e) =>
                        handleChange(e, index, match.leagueMatchId)
                      }
                    />
                  </div>
                  <div className="e-match__score">
                    <input
                      type="number"
                      name="setB2"
                      value={values[index].setB2}
                      min="0"
                      max="99"
                      onChange={(e) =>
                        handleChange(e, index, match.leagueMatchId)
                      }
                    />
                  </div>
                  <div className="e-match__score">
                    <input
                      type="number"
                      name="setB3"
                      value={values[index].setB3}
                      min="0"
                      max="99"
                      onChange={(e) =>
                        handleChange(e, index, match.leagueMatchId)
                      }
                    />
                  </div>
                  <div className="e-match__score">
                    <input
                      type="number"
                      name="setB4"
                      value={values[index].setB4}
                      min="0"
                      max="99"
                      onChange={(e) =>
                        handleChange(e, index, match.leagueMatchId)
                      }
                    />
                  </div>
                  <div className="e-match__score">
                    <input
                      type="number"
                      name="setB5"
                      value={values[index].setB5}
                      min="0"
                      max="99"
                      onChange={(e) =>
                        handleChange(e, index, match.leagueMatchId)
                      }
                    />
                  </div>
                  {/* end sets */}

                  <div className={`e-score__cell e-score__cell--end`}>
                    <span
                      className={`e-match__teamName e-match__teamName--right`}
                    >
                      {match.teamBName}
                    </span>
                    <img
                      className="u-img-rounded"
                      src={
                        match.teamBSProfilePicture
                          ? "https://avp-backend.com/" +
                            match.teamBProfilePicture
                          : teamImg
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <ToastContainer />
    </form>
  );
};

export default EditMatches;
