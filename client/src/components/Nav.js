import React, { useState } from "react";
import { AuthContext } from "../App";
import { Link, useLocation } from "react-router-dom";
import jumpman from "../../public/images/icons/jumpman.svg";
import meter from "../../public/images/icons/meter.svg";
import doc from "../../public/images/icons/document.svg";
import ball from "../../public/images/icons/ball.svg";
import suitcase from "../../public/images/icons/suitcase.svg";
import cal from "../../public/images/icons/date.svg";
import rslt from "../../public/images/icons/results.svg";
import broadcast from "../../public/images/icons/broadcast.svg";
import refunds from "../../public/images/icons/refunds.svg";

const Nav = () => {
  let location = useLocation();
  const { loginState, dispatch } = React.useContext(AuthContext);
  const initialstate = {
    links: [
      {
        path:
          "/" /* path is used as id to check which NavItem is active basically */,
        name: "Dashboard",
        css: "title--home",
        image: meter,
        key: 1,
      },
      {
        path: "/registration",
        name: "Registration",
        css: "title--registration",
        image: doc,
        key: 2,
      },
      {
        path: "/teams",
        name: "Teams",
        css: "title--teams",
        image: ball,
        key: 3,
      },
      {
        path: "/admin",
        name: "Admin",
        css: "title--admin",
        image: suitcase,
        key: 4,
      },
      {
        path: "/schedule",
        name: "Schedule",
        css: "title--schedule",
        image: cal,
        key: 5,
      },
      {
        path: "/results",
        name: "Results",
        css: "title--results",
        image: rslt,
        key: 6,
      },
      {
        path: "/communication",
        name: "Communication",
        css: "title--communication",
        image: broadcast,
        key: 7,
      },
      {
        path: "/finance",
        name: "Finance",
        css: "title--finance",
        image: refunds,
        key: 8,
      },
    ],
  };
  const [navState, setNavState] = useState(initialstate);

  const [currPath, setCurrPath] = useState({ activePath: location.pathname });

  const handleClick = (path) => {
    if (currPath.activePath !== path) setCurrPath({ activePath: path });
  };

  //test to find if each path in nav is current url.
  const testPath = (str) => {
    if (currPath.activePath !== "/") {
      if (str !== "/" && currPath.activePath.indexOf(str) != -1) return true;
      return false;
    } else {
      //sep test for home page bc all have start with a slash
      if (currPath.activePath == str) return true;
      return false;
    }
  };

  const { links, activePath } = navState;

  return (
    <nav aria-label="primary">
      <div className="l-content__flexContainer--column--menu">
        <Link to="/">
          <div className="c-branding">
            <img className="logo" src={jumpman} alt="AVP" />
          </div>
        </Link>
        <nav className="c-nav">
          <ul className="c-nav__list">
            {navState.links.map((item) => {
              return (
                <li
                  className={
                    testPath(item.path)
                      ? "c-nav__list__item--active"
                      : "c-nav__list__item"
                  }
                  key={item.key}
                >
                  <Link to={item.path} onClick={() => handleClick(item.path)}>
                    <img src={item.image} />
                    <span className={item.css}>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="c-logout">
            <img
              src={require("../../public/images/icons/exit.svg")}
              onClick={() =>
                dispatch({
                  type: "LOGOUT",
                })
              }
            />
            <span
              onClick={() =>
                dispatch({
                  type: "LOGOUT",
                })
              }
            >
              Log out
            </span>
          </div>
        </nav>
      </div>
    </nav>
  );
};

// const RouterSideNav = withRouter(Nav);

export default Nav;
