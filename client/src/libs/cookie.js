/* ======================================== */
/* =                                      = */
/*   cookie functions for whole site	    */
/* =                                      = */
/* ======================================== */

// ~~~~~~~~~~~~~~~~~~~~~
// ### SET COOKIES ###
//
// Cookie (cname), the value of the cookie (cvalue), and the number of
// days until the cookie should expire (exdays).
const setCookie = (cname, cvalue, exdays) => {
  var d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  var expires = "expires=" + d.toUTCString();
  return (document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/");
};

// ~~~~~~~~~~~~~~~~~~~~~
// ### GET COOKIES ###
//
// returns the value of a specified cookie by cname
const getCookie = (cname) => {
  var varId = cname + "=";
  var ca = document.cookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(varId) == 0) {
      return c.substring(varId.length, c.length);
    }
  }
  return "";
};

export { setCookie, getCookie };
