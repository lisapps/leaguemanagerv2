import React, { useState, useEffect } from "react";

import { useAccordionContext } from "../Accordion/hooks";

const PPAccBody = ({ children, ...props }) => {
  if (children)
    return (
      <>
        <div
          className={`c-accordion__panel c-leagueParticipation u-animated u-animated--faster a-fadeIn`}
          key={children.leagueId}
          {...props}
        >
          {children.leagueTeamsList.map((team) => (
            <>
              <p className="u-component_labels">{team.teamName}</p>
              <div
                className={`l-content__flexContainer--left--SectionCard u-card`}
              >
                <li className={`e-viewForm__liEntry`}>
                  <div className={`e-viewForm__label e-viewForm__label--day`}>
                    Date
                  </div>
                  <div
                    className={`e-viewForm__text e-viewForm__text--noborder`}
                  >
                    {team.teamDate}
                  </div>
                </li>
                <li className={`e-viewForm__liEntry`}>
                  <div
                    className={`e-viewForm__label e-viewForm__label--division`}
                  >
                    Division
                  </div>
                  <div
                    className={`e-viewForm__text e-viewForm__text--noborder`}
                  >
                    {team.division}
                  </div>
                </li>
                <li className={`e-viewForm__liEntry`}>
                  <div className={`e-viewForm__label e-viewForm__label--cost`}>
                    Cost
                  </div>
                  <div
                    className={`e-viewForm__text e-viewForm__text--noborder`}
                  >
                    {team.teamCost}
                  </div>
                </li>
              </div>
            </>
          ))}
        </div>
      </>
    );
};

export default PPAccBody;
