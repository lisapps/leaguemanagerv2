import React, { useState, useRef, useEffect } from "react";
import { LeaguesContext } from "../../hooks/LeaguesContext";
import { getCookie, setCookie } from "../../libs/cookie";
import lIcon from "../../../public/images/icons/icons-photo-league.svg";
import OuterClick from "../../libs/OuterClick";

const LeagueSwitcher = () => {
  const { leagueData, selectedLeague, changeLeague } = React.useContext(
    LeaguesContext
  );
  const [showDD, setShowDD] = useState(false);

  const refDropdown = useRef(null);
  const refButton = useRef(null);

  useEffect(() => {
    if (showDD) {
      document.addEventListener("click", handleClick);
      return () => {
        document.removeEventListener("click", handleClick);
      };
    }
  }, [showDD]);

  const handleClick = (e) => {
    if (
      refDropdown &&
      refDropdown.current &&
      refDropdown.current.contains(e.target)
    ) {
      return;
    }
    setShowDD(false);
  };

  const toggleDD = (e) => {
    setShowDD(() => !showDD);
  };

  //uses OuterClick to close clicks outside of ddmenu
  const innerRef = OuterClick((e) => {
    //this is what's in the callback
    var ddContainer = document.getElementById("l-league__dropdown__container");
    if (ddContainer && ddContainer.classList.contains("show"))
      ddContainer.classList.remove("show");

    var dd = document.getElementById("e-league__dropdown");
    if (dd && dd.classList.contains("show")) dd.classList.remove("show");
  });

  //initial selectedLeague
  const DD = () => {
    function changeSelected(id) {
      var newLeague = leagueData.find((x) => x.value === id);
      // function from context
      changeLeague([newLeague]);
    }
    return (
      <div id="l-league__dropdown__container">
        <ul className={`c-ddMenu`} id="e-league__dropdown">
          {leagueData.map((league) => (
            <li
              key={league.value}
              className={`e-leagueSelector__option ${
                selectedLeague[0].value == league.value ? "selected" : ""
              }`}
              onClick={() => changeSelected(league.value)}
            >
              {league.content}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  if (!leagueData) return <div className="u-large_body">Loading...</div>;
  if (leagueData && leagueData.length < 1)
    return (
      <div className="u-large_body">
        No Leagues. Set up a league to see some options.
      </div>
    );
  if (selectedLeague)
    return (
      <div className="s-leagueChooser" ref={innerRef}>
        <div className="e-leagueImage">
          <img
            src={
              selectedLeague[0].icon &&
              selectedLeague[0].icon !== "https://avp-backend.com/"
                ? selectedLeague[0].icon
                : lIcon
            }
          />
          <span id="e-btn__league" onClick={toggleDD} ref={refButton}>
            {selectedLeague[0].content}
          </span>
        </div>

        {showDD ? <DD selectedLeague={selectedLeague} /> : null}
      </div>
    );
  return (
    <>
      <p>selectedLeague is not rendering</p>
    </>
  );
};

export default LeagueSwitcher;
