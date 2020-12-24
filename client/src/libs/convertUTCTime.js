const convertUTCTime = (time) => {
  var _hours = Number(time.match(/^(\d+)/)[1]);
  var _mins = Number(time.match(/:(\d+)/)[1]);
  var _meridiam;

  if (_hours > 12) {
    _meridiam = "PM";
    _hours = _hours - 12;
  } else {
    _meridiam = "AM";
  }

  var sHours = _hours.toString();
  var sMins = _mins.toString();

  if (_mins < 10) sMins = "0" + sMins;
  return sHours + ":" + sMins + " " + _meridiam;
};

export default convertUTCTime;
