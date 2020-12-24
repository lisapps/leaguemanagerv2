import React from "react";

const RegPlayersTab = () => {
  <ul className="l-tabcontainer">
    <li className="e-tabBtn" id="tabA">
      Teams
    </li>
    <li className={`e-tabBtn currentTab`} onclick="showTeamsTab(e)" id="tabB">
      Players
    </li>
  </ul>;
  // <Accordion
  //   activeEventKey={activeEventKey}
  //   onToggle={setActiveEventKey}
  // >
  //   {currentLeagueData.divisionsList.map((item) => (
  //     <RegTeamsAcc key={item.divisionId}>
  //       <Accordion.Toggle
  //         element={RegTeamsAcc.Header}
  //         eventKey={item.divisionId}
  //       >
  //         {item}
  //         {activeEventKey !== item.divisionId && ``}
  //         {activeEventKey === item.divisionId && `active`}
  //       </Accordion.Toggle>
  //       <Accordion.Collapse
  //         eventKey={item.divisionId}
  //         element={RegTeamsAcc.Body}
  //       >
  //         {item}
  //       </Accordion.Collapse>
  //     </RegTeamsAcc>
  //   ))}
  // </Accordion>
  <p>Players content here</p>;
};

export default RegPlayersTab;
