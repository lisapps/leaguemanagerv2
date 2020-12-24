import React from "react";
import { AuthContext } from "./App";
import Cookies from "universal-cookie";

const Comm = () => {
  const { dispatch } = React.useContext(AuthContext);
  const cookies = new Cookies();

  var authcookie = cookies.get("lmtoken");
  if (authcookie == undefined)
    dispatch({
      type: "LOGOUT",
    });

  return (
    <div className="l-main">
      <section className="l-content">
        <div className={`u-mt40 u-mb45`}>
          <div className={`u-large_body u-text--center`}>
            Communication Center Coming Soon.
          </div>
        </div>
      </section>
    </div>
  );
};

export default Comm;
