import React, { useState, useEffect } from "react";
import Cookies from "universal-cookie";
import { AuthContext } from "../App";
import { useHistory } from "react-router-dom";
import mgrImg from "../../public/images/icons/icons-photo-person.svg";

const Header = () => {
  const { loginState, dispatch } = React.useContext(AuthContext);
  const [iconState, setIcon] = useState(mgrImg);
  const [nameState, setName] = useState(null);

  const bes = "https://avp-backend.com/";
  let history = useHistory();
  const cookies = new Cookies();

  let user = cookies.get("user");

  function handleViewProfile(id) {
    if (id) {
      history.push("/admin/view-manager");
    }
  }

  // useEffect to change icon to user's icon if it's not "", and user name
  useEffect(() => {
    
    if (loginState.pic !== "") {
      setIcon(loginState.pic);
    }
    if (loginState.pic == undefined) {
      
      if   (user && user[4] !== "") setIcon(user[4]);
    }
    if (user !== undefined) {
      
      if   (user) setName(user[2]);
    }
  }, [loginState]);

  return (
    <section className="c-header">
      <div className="c-header__right">
        <div className="c-account">
          <div className="c-login">
            <img
              className="u-img-rounded"
              src={iconState}
              onClick={handleViewProfile}
            />
            <span onClick={handleViewProfile}>
              {loginState.firstName
                ? `Hi, ` + loginState.firstName
                : nameState
                ? `Hi, ` + nameState
                : `Hi, User`}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Header;
