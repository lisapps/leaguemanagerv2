import React, {
  useState,
  useEffect,
  createContext,
  useReducer,
  useCallback,
} from "react";
import axios from "axios";
import { getCookie, setCookie } from "../libs/cookie";
import dotenv from "dotenv";

dotenv.config();
var server = process.env.API_URL;
let leaguearr = [];
export const LeaguesContext = createContext();

export const LeaguesProvider = ({ children }) => {
  const CHANGE_LEAGUE = "CHANGE_LEAGUE";
  const FROM_COOKIE = "FROM_COOKIE";

  const reducer = (selectedLeague, action) => {
    if (action.type === CHANGE_LEAGUE) {
      selectedLeague = action.payload.newLeague;
      setCookie("currentLid", selectedLeague[0].value, 1);
    }
    if (action.type === FROM_COOKIE) {
      selectedLeague = action.payload.newLeague;
    }

    return selectedLeague;
  };

  const [leagueData, setLeagueData] = useState(null);
  const [selectedLeague, dispatch] = useReducer(reducer, null);

  function getFromCookie(lId) {
    if (lId) {
      var lOjb = leagueData.find((x) => x.value === lId);
      var newLeague = [];
      newLeague.push(lOjb);
      // function from context
      dispatch({
        type: FROM_COOKIE,
        payload: { newLeague },
      });
    }
  }

  const changeLeague = useCallback((newLeague) => {
    dispatch({
      type: CHANGE_LEAGUE,
      payload: { newLeague },
    });
  }, []);

  useEffect(() => {
    axios(server + "/dashboard", {
      withCredentials: true,
    })
      .then((res) => {
        if (res.data.status == "Success") {
          const bes = "https://avp-backend.com/";
          let ldata = res.data.leaguesList;
          ldata = ldata.flat();

          ldata.map((item) => {
            const lgobj = {
              value: item.leagueId,
              content: item.leagueName,
              icon: bes + item.leagueIcon,
              leagueStatus: item.leagueStatus,
            };
            leaguearr.push(lgobj);
          });
          setLeagueData(leaguearr);
        } else {
          throw res;
        }
      })
      .catch((error) => {
        console.error("league state failed:", error);
      });
  }, []);

  useEffect(() => {
    if (leagueData && leagueData.length > 0) {
      var lId = getCookie("currentLid");

      lId ? getFromCookie(lId) : changeLeague([leaguearr[0]]);
    }
  }, [leagueData]);

  const value = { leagueData, selectedLeague, changeLeague };

  return (
    <LeaguesContext.Provider value={value}>{children}</LeaguesContext.Provider>
  );
};
