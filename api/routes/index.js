var express = require("express");
var router = express.Router();
const fs = require("fs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const secret = process.env.SECRET_KEY;
const API = process.env.API_URL;
const algorithm = "aes-256-cbc";
const key = "LM@098765_AVPAppLM@098765_AVPApp";
const iv = "e95a3d73fe601926";
const cookieParser = require("cookie-parser");
const multer = require("multer");
const upload = multer();
const request = require("request");
var rp = require("request-promise");
var winston = require("../winston");

/*
    ### encryption function ###
*/

function encrypt(text) {
  let _cipher = crypto.createCipheriv(algorithm, key, iv);
  let _encrypted = _cipher.update(text, "utf8", "base64");
  _encrypted += _cipher.final("base64");
  return _encrypted.toString("base64");
}

function decrypt(text) {
  var _encrypted;
  if (text) _encrypted = Buffer.from(text, "base64");
  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(key),
    Buffer.from(iv)
  );

  decipher.setAutoPadding(true);
  let decrypt = decipher.update(_encrypted, "base64");
  decrypt += decipher.final();
  return decrypt;
}

function convertDate(date) {
  var _date_array = date.split("/");
  var _new_Date = _date_array[2] + "-" + _date_array[0] + "-" + _date_array[1];
  return _new_Date;
}

function revertDate(date) {
  var _date_array = date.split("-");
  var _new_Date = _date_array[1] + "/" + _date_array[2] + "/" + _date_array[0];
  return _new_Date;
}

// BEGIN ROUTES
// Login and home page

router.route("/signin").post((req, res) => {
  var email = req.body.username;
  var pword = String(req.body.password);
  var pass = encrypt(pword);

  var options = {
    method: "POST",
    url: "https://avp-backend.com/devApi/backend/login.php",
    headers: {
      "content-type": "multipart/form-data",
    },
    formData: {
      emailId: email,
      password: pass,
    }
  };

  request(options, (error, response, body) => {
      // POST succeeded...
    var sCode = response.statusCode;
    var _resData = response.body ? JSON.parse(body) : null;
    var result = sCode == "404" ? (_resData = "undefined") : _resData;

    if (result && result.status == "Success") {
      var _tkn = result.jwt;
      var _decoded = jwt.verify(_tkn, secret);
      var userid = _decoded.data.userId;

      userid = JSON.parse(userid)
      result.userId = userid;
      res.send(result);

      } else {
        res.send(result);
      }
      if (error) {
        console.error("form post failed:", error);
        return res.status(444).json({ error: "no data returned." });
      }
    })
});

router.route("/forgotpass").post((req, res) => {
  var data = req.body.emailId;

  var options = {
    method: "POST",
    uri: "https://avp-backend.com/api/backend/forgotPassword.php",
    formData: {
      emailId: data,
    },
    json: true, // Automatically stringifies the body to JSON
  };

  rp(options)
    .then(function (parsedBody) {
      res.send(parsedBody);
    })

    .catch(function (err) { 
      res.send(err);
      if (err.code === "ETIMEDOUT") { 
        process.exit(0);
      }
    });
});

router.route("/complete-profile").post(upload.single("pic"), (req, res) => {

  var hasAuth = req.cookies.lmtoken;
  var data = req.body;

  var phone = encrypt(data.contact);
  var pass = encrypt(data.password);
  var img;
  if (req.file !== undefined) img = req.file.buffer;

  data.jwt = hasAuth;
  data.contact = phone;
  data.password = pass;
  data = JSON.parse(JSON.stringify(data));
  if (img) {
    data.profilePic = {
      value: img,
      options: {
        filename: req.file.originalname,
        contentType: null,
      },
    };
  } else {
    data.profilePic = "";
  }
  var options = {
    method: "POST",
    url: "https://avp-backend.com/api/backend/completeProfile.php",
    headers: {
      "Content-Type": "multipart/form-data",
    },
    formData: data,
  };

  request(options, (error, response, body) => {
    var sCode = response.statusCode;
    var _resData = JSON.parse(body);

    let result = sCode == "404" ? (_resData = "undefined") : _resData;

    if (result.status == "Success") { 
      res.send(result);
    } else {
      res.send(result);
    }
    if (error) {
      res.send(result); 
    }
  });
});

router.route("/dashboard").get((req, res) => {
  var hasAuth = req.cookies.lmtoken;

  var options = {
    method: "POST",
    url: "https://avp-backend.com/api/backend/dashboard.php",
    headers: {
      "content-type": "multipart/form-data",
    },
    formData: {
      jwt: hasAuth,
      flag: "1",
    },
  };

  request(options, (error, response, body) => {
    var sCode = response.statusCode;
    var _resData = response.body ? JSON.parse(body) : null;
    var result = sCode == "404" ? (_resData = "undefined") : _resData;

    if (result && result.status == "Success") {
      res.send(result);
    } else {
      res.send(result);
    }
    if (error) {
      console.error("form post failed:", error);
      return res.status(444).json({ error: "no data returned." });
    }
  });
});

// Registration

router.route("/loadRegTeams").post((req, res) => {
  var hasAuth = req.cookies.lmtoken;
  var dId = req.body.divisionId;
  var options = {
    method: "POST",
    url: "https://avp-backend.com/api/backend/leagueTeamsList.php",
    headers: {
      "content-type": "multipart/form-data",
    },
    formData: { jwt: hasAuth, divisionId: dId },
  };

  request(options, (error, response, body) => {
    var sCode = response.statusCode;
    var _resData = response.body ? JSON.parse(body) : null;
    var result = sCode == "404" ? (_resData = "undefined") : _resData;

    if (result && result.status == "Success") {
      res.send(result);
    } else {
      res.send(result);
    }
    if (error) {
      return res.status(444).json({ error: "no data returned." });
    }
  });
});

router.route("/loadRegTeamsPlayerTab").post((req, res) => {
  var hasAuth = req.cookies.lmtoken;
  var lId = req.body.lId;
  var options = {
    method: "POST",
    url: "https://avp-backend.com/api/backend/leagueTeamsList.php",
    headers: {
      "content-type": "multipart/form-data",
    },
    formData: { jwt: hasAuth, leagueId: lId },
  };

  request(options, (error, response, body) => {
    var sCode = response.statusCode;
    var _resData = response.body ? JSON.parse(body) : null;
    var result = sCode == "404" ? (_resData = "undefined") : _resData;
    

    if (result && result.status == "Success") {
      res.send(result);
    } else {
      res.send(result);
    }
    if (error) {
      return res.status(444).json({ error: "no data returned." });
    }
  });
});

router.route("/loadRegPlayers").post((req, res) => {
  var hasAuth = req.cookies.lmtoken;
  var tId = req.body.teamId;
  var options = {
    method: "POST",
    url: "https://avp-backend.com/api/backend/leagueTeamPlayersList.php",
    headers: {
      "content-type": "multipart/form-data",
    },
    formData: { jwt: hasAuth, teamId: tId },
  };

  request(options, (error, response, body) => {
    var sCode = response.statusCode;
    var _resData = response.body ? JSON.parse(body) : null;
    var result = sCode == "404" ? (_resData = "undefined") : _resData;
    
    if (result && result.status == "Success") {
      res.send(result);
    } else {
      res.send(result);
    }
    if (error) {
      return res.status(444).json({ error: "no data returned." });
    }
  });
});

router.route("/remindTeam").post((req, res) => {
  var hasAuth = req.cookies.lmtoken;
  var tId = req.body.tId;
  var options = {
    method: "POST",
    url: "https://avp-backend.com/api/backend/sendPaymentReminder.php",
    headers: {
      "content-type": "multipart/form-data",
    },
    formData: { jwt: hasAuth, teamId: tId },
  };

  request(options, (error, response, body) => {
    var sCode = response.statusCode;
    var _resData = response.body ? JSON.parse(body) : null;
    var result = sCode == "404" ? (_resData = "undefined") : _resData;
    

    if (result && result.status == "Success") {
      res.send(result);
    } else {
      res.send(result);
    }
    if (error) {
      return res.status(444).json({ error: "no data returned." });
    }
  });
});

// Teams

router.route("/teams-create").post(upload.single("pic"), (req, res) => {
  var hasAuth = req.cookies.lmtoken;
  var data = req.body;
  var img;
  if (req.file !== undefined) img = req.file.buffer;

  data.jwt = hasAuth;
  data = JSON.parse(JSON.stringify(data));
  if (img) {
    data.leagueTeamIcon = {
      value: img,
      options: {
        filename: req.file.originalname,
        contentType: null,
      },
    };
  } else {
    data.leagueTeamIcon = "";
  }
  var options = {
    method: "POST",
    url: "https://avp-backend.com/api/backend/createLeagueTeam.php",
    headers: {
      "content-type": "multipart/form-data",
    },
    formData: data,
  };

  request(options, (error, response, body) => {
    var sCode = response.statusCode;
    var _resData = JSON.parse(body);
    let result = sCode == "404" ? (_resData = "undefined") : _resData;

    if (result.status == "Success") {
      res.send(result);
    } else {
      res.send(result);
    }
    if (error) {
      res.send(result);
    }
  });
});

router.route("/teams-update").post(upload.single("pic"), (req, res) => {
  var hasAuth = req.cookies.lmtoken;
  var data = req.body;
  var img;
  if (req.file !== undefined) img = req.file.buffer;

  data.jwt = hasAuth;
  data = JSON.parse(JSON.stringify(data));
  if (img) {
    data.leagueTeamIcon = {
      value: img,
      options: {
        filename: req.file.originalname,
        contentType: null,
      },
    };
  } else {
    data.leagueTeamIcon = "";
  }
  var options = {
    method: "POST",
    url: "https://avp-backend.com/api/backend/updateTeam.php",
    headers: {
      "content-type": "multipart/form-data",
    },
    formData: data,
  };

  request(options, (error, response, body) => {
    var sCode = response.statusCode;
    var _resData = JSON.parse(body);

    let result = sCode == "404" ? (_resData = "undefined") : _resData;

    if (result.status == "Success") {
      res.send(result);
    } else {
      res.send(result);
    }
    if (error) {
      res.send(result);
    }
  });
});

router.route("/team-delete").get((req, res) => {
  var hasAuth = req.cookies.lmtoken;
  var team = JSON.parse(req.cookies.currentTeam);
  var id = team[0];
  var data = {};
  data.jwt = hasAuth;
  data.teamId = id;
  data = JSON.parse(JSON.stringify(data));
  var options = {
    method: "POST",
    url: "https://avp-backend.com/api/backend/deleteTeam.php",
    headers: {
      "content-type": "multipart/form-data",
    },
    formData: data,
  };

  request(options, (error, response, body) => {
    var sCode = response.statusCode;
    var _resData = JSON.parse(body);

    let result = sCode == "404" ? (_resData = "undefined") : _resData;

    if (result.status == "Success") { 
      res.send(result);
    } else {
      res.send(result);
    }
    if (error) {
      res.send(result);
    }
  });
});

router.route("/getTeamPlayers").post((req, res) => {
  var hasAuth = req.cookies.lmtoken;
  var tId = req.body.tId;
  var options = {
    method: "POST",
    url: "https://avp-backend.com/api/backend/leagueTeamPlayersList.php",
    headers: {
      "content-type": "multipart/form-data",
    },
    formData: { jwt: hasAuth, teamId: tId },
  };

  request(options, (error, response, body) => {
    var sCode = response.statusCode;
    var _resData = response.body ? JSON.parse(body) : null;
    var result = sCode == "404" ? (_resData = "undefined") : _resData;
    

    if (result && result.status == "Success") {
      res.send(result);
    } else {
      res.send(result);
    }
    if (error) {
      return res.status(444).json({ error: "no data returned." });
    }
  });
});

router.route("/loadMergeTeamsTab").post((req, res) => {
  var hasAuth = req.cookies.lmtoken;
  var lId = req.body.lId;
  
  var options = {
    method: "POST",
    url: "https://avp-backend.com/api/backend/leagueTeamsList.php",
    headers: {
      "content-type": "multipart/form-data",
    },
    formData: { jwt: hasAuth, leagueId: lId },
  };

  request(options, (error, response, body) => {
    var sCode = response.statusCode;
    var _resData = response.body ? JSON.parse(body) : null;

    var result = sCode == "404" ? (_resData = "undefined") : _resData;

    if (result && result.status == "Success") { 
      res.send(result);
    } else {
      res.send(result);
    }
    if (error) {
      return res.status(444).json({ error: "no data returned." });
    }
  });
});

router.route("/loadTeamsSetup").post((req, res) => {
  var hasAuth = req.cookies.lmtoken;
  var dId = req.body.divisionId;
  
  var options = {
    method: "POST",
    url: "https://avp-backend.com/api/backend/leagueTeamsList.php",
    headers: {
      "content-type": "multipart/form-data",
    },
    formData: { jwt: hasAuth, divisionId: dId },
  };

  request(options, (error, response, body) => {
    var sCode = response.statusCode;
    var _resData = response.body ? JSON.parse(body) : null;

    var result = sCode == "404" ? (_resData = "undefined") : _resData;

    if (result && result.status == "Success") { 
      res.send(result);
    } else {
      res.send(result);
    }
    if (error) {
      return res.status(444).json({ error: "no data returned." });
    }
  });
});

router.route("/player-create").post(upload.single("pic"), (req, res) => {
  var hasAuth = req.cookies.lmtoken;
  var data = req.body;
  var newDob = encrypt(data.dob);
  var med = encrypt(data.medical);
  var allg = encrypt(data.allergies);
  var phone = encrypt(data.contact);

  data.dob = newDob;
  data.medical = med;
  data.allergies = allg;
  data.contact = phone;
  data.jwt = hasAuth;

  var img;
  if (req.file !== undefined) img = req.file.buffer;

  data = JSON.parse(JSON.stringify(data));

  if (img) {
    data.profilePic = {
      value: img,
      options: {
        filename: req.file.originalname,
        contentType: null,
      },
    };
  } else {
    data.profilePic = "";
  }

  var options = {
    method: "POST",
    url: "https://avp-backend.com/api/backend/createAvpPlayer.php",
    headers: {
      "content-type": "multipart/form-data",
    },
    formData: data,
  };

  request(options, (error, response, body) => {
    var sCode = response.statusCode;
    var _resData = JSON.parse(body);

    let result = sCode == "404" ? (_resData = "undefined") : _resData;

    if (result.status == "Success") { 
      res.send(result);
    } else {
      res.send(result);
    }
    if (error) {
      res.send(result);
    }
  });
});

router.route("/view-player").get((req, res) => {
  var hasAuth = req.cookies.lmtoken;
  var pid = req.cookies.currentPid;
  if (pid) {
    var options = {
      method: "POST",
      url: "https://avp-backend.com/api/backend/getPlayerProfileInfo.php",
      headers: {
        "content-type": "multipart/form-data",
      },
      formData: { jwt: hasAuth, avpId: pid },
    };
  }
  request(options, (error, response, body) => {
    var sCode = response.statusCode;
    var _resData = response.body ? JSON.parse(body) : null;
    var result = sCode == "404" ? (_resData = "undefined") : _resData;
    

    if (result && result.status == "Success") { 
      var dob = decrypt(result.dob);
      result.dob && (result.dob = revertDate(dob));
      result.medical && (result.medical = decrypt(result.medical));
      result.allergies && (result.allergies = decrypt(result.allergies));
      result.contact && (result.contact = decrypt(result.contact)); 
      res.send(result);
    } else {
      res.send(result);
    }
    if (error) {
      return res.status(444).json({ error: "no data returned." });
    }
  });
});

router.route("/player-edit").post(upload.single("pic"), (req, res) => {
  var hasAuth = req.cookies.lmtoken;
  var data = req.body;
  var newDob = encrypt(data.dob);
  var med = encrypt(data.medical);
  var allg = encrypt(data.allergies);
  var phone = encrypt(data.contact);

  data.dob = newDob;
  data.medical = med;
  data.allergies = allg;
  data.contact = phone;
  data.jwt = hasAuth;

  var img;
  if (req.file !== undefined) img = req.file.buffer;

  data = JSON.parse(JSON.stringify(data));
  if (img) {
    data.profilePic = {
      value: img,
      options: {
        filename: req.file.originalname,
        contentType: null,
      },
    };
  } else {
    data.profilePic = "";
  }

  var options = {
    method: "POST",
    url: "https://avp-backend.com/api/backend/updatePlayerProfile.php",
    headers: {
      "content-type": "multipart/form-data",
    },
    formData: data,
  };

  request(options, (error, response, body) => {
    var sCode = response.statusCode; 
    var _resData = JSON.parse(body);
    let result = sCode == "404" ? (_resData = "undefined") : _resData;

    if (result.status == "Success") {
      res.send(result);
    } else {
      res.send(result);
    }
    if (error) {
      res.send(result);
    }
  });
});

router.route("/playerParticipation").get((req, res) => {
  var hasAuth = req.cookies.lmtoken;
  var pid = req.cookies.currentPid;
  if (pid) {
    var options = {
      method: "POST",
      url: "https://avp-backend.com/api/backend/getPlayerParticipation.php",
      headers: {
        "content-type": "multipart/form-data",
      },
      formData: { jwt: hasAuth, avpId: pid },
    };
  }
  request(options, (error, response, body) => {
    var sCode = response.statusCode;
    var _resData = response.body ? JSON.parse(body) : null;
    var result = sCode == "404" ? (_resData = "undefined") : _resData;
    

    if (result && result.status == "Success") { 
      res.send(result);
    } else {
      res.send(result);
    }
    if (error) {
      return res.status(444).json({ error: "no data returned." });
    }
  });
});

router.route("/loadTeamsModal").post((req, res) => {
  var hasAuth = req.cookies.lmtoken;
  var dId = req.body.divisionId;
  var options = {
    method: "POST",
    url: "https://avp-backend.com/api/backend/addPoolTeamsList.php",
    headers: {
      "content-type": "multipart/form-data",
    },
    formData: { jwt: hasAuth, divisionId: dId },
  };

  request(options, (error, response, body) => {
    var sCode = response.statusCode;
    var _resData = response.body ? JSON.parse(body) : null;
    var result = sCode == "404" ? (_resData = "undefined") : _resData;
    

    if (result && result.status == "Success") { 
      res.send(result);
    } else {
      res.send(result);
    }
    if (error) {
      return res.status(444).json({ error: "no data returned." });
    }
  });
});

router.route("/addTeams").post((req, res) => {
  var hasAuth = req.cookies.lmtoken;
  var teamArr = req.body.teams;
  var dId = req.body.dId;
  var tId = teamArr.toString();
  var options = {
    method: "POST",
    url: "https://avp-backend.com/api/backend/confirmAddPoolTeams.php",
    headers: {
      "content-type": "multipart/form-data",
    },
    formData: { jwt: hasAuth, divisionId: dId, selectedPoolTeams: tId },
  };

  request(options, (error, response, body) => {
    var sCode = response.statusCode;
    var _resData = response.body ? JSON.parse(body) : null;
    var result = sCode == "404" ? (_resData = "undefined") : _resData;

    if (result && result.status == "Success") {
      res.send(result);
    } else {
      res.send(result);
    }
    if (error) {
      return res.status(444).json({ error: "no data returned." });
    }
  });
});

router.route("/removeTeams").post((req, res) => {
  var hasAuth = req.cookies.lmtoken;
  var tId = req.body.tId;
  var options = {
    method: "POST",
    url: "https://avp-backend.com/api/backend/removeTeam.php",
    headers: {
      "content-type": "multipart/form-data",
    },
    formData: { jwt: hasAuth, teamId: tId },
  };

  request(options, (error, response, body) => {
    var sCode = response.statusCode;
    var _resData = response.body ? JSON.parse(body) : null;
    var result = sCode == "404" ? (_resData = "undefined") : _resData;
    

    if (result && result.status == "Success") { 
      res.send(result);
    } else { 
      return res.status(444).json({ error: "no data returned." });
    }
    if (error) {
      return res.status(444).json({ error: "no data returned." });
      console.error("form post failed:", error);
    }
  });
});

router.route("/loadMergeModal").get((req, res) => {
  var hasAuth = req.cookies.lmtoken;
  var lid = req.cookies.currentLid;

  if (lid) {
    var options = {
      method: "POST",
      url: "https://avp-backend.com/api/backend/leagueTeamsList.php",
      headers: {
        "content-type": "multipart/form-data",
      },
      formData: { jwt: hasAuth, leagueId: lid },
    };
  }
  request(options, (error, response, body) => {
    var sCode = response.statusCode;
    var _resData = response.body ? JSON.parse(body) : null;
    var result = sCode == "404" ? (_resData = "undefined") : _resData;
    

    if (result && result.status == "Success") { 
      res.send(result);
    } else { 
      res.send(result);
    }
    if (error) {
      console.error("form post failed:", error);
      return res.status(444).json({ error: "no data returned." });
    }
  });
});

router.route("/mergeTeams").post((req, res) => {
  var hasAuth = req.cookies.lmtoken;
  let teamArr = req.body.teams;
  let parent = teamArr[0];
  let child = teamArr[1];

  var options = {
    method: "POST",
    url: "https://avp-backend.com/devApi/backend/confirmTeamsMerge.php",
    headers: {
      "content-type": "multipart/form-data",
    },
    formData: { jwt: hasAuth, parentTeamId: parent, childTeamId: child },
  };

  request(options, (error, response, body) => {
    var sCode = response.statusCode;
    var _resData = response.body ? JSON.parse(body) : null;
    var result = sCode == "404" ? (_resData = "undefined") : _resData;
    

    if (result && result.status == "Success") { 
      res.send(result);
    } else { 
      res.send(result);
    }
    if (error) {
      console.error("form post failed:", error);
      return res.status(444).json({ error: "no data returned." });
    }
  });
});

router.route("/setTeamCaptain").post((req, res) => {
  var hasAuth = req.cookies.lmtoken;
  var tId = req.body.tId;
  var pId = req.body.pId;
  var options = {
    method: "POST",
    url: "https://avp-backend.com/api/backend/setTeamCaptain.php",
    headers: {
      "content-type": "multipart/form-data",
    },
    formData: { jwt: hasAuth, teamId: tId, avpId: pId },
  };

  request(options, (error, response, body) => {
    var sCode = response.statusCode;
    var _resData = response.body ? JSON.parse(body) : null;
    var result = sCode == "404" ? (_resData = "undefined") : _resData;

    if (result && result.status == "Success") { 
      res.send(result);
    } else { 
      return res.status(444).json({ error: "no data returned." });
    }
    if (error) {
      return res.status(444).json({ error: "no data returned." });
      console.error("form post failed:", error);
    }
  });
});

router.route("/loadPlayerModal").post((req, res) => {
  var hasAuth = req.cookies.lmtoken;
  var tId = req.body.tId;
  var options = {
    method: "POST",
    url: "https://avp-backend.com/api/backend/addPoolPlayersList.php",
    headers: {
      "content-type": "multipart/form-data",
    },
    formData: { jwt: hasAuth, teamId: tId },
  };

  request(options, (error, response, body) => {
    var sCode = response.statusCode;
    var _resData = response.body ? JSON.parse(body) : null;
    var result = sCode == "404" ? (_resData = "undefined") : _resData;

    if (result && result.status == "Success") { 
      res.send(result);
    } else { 
      return res.status(444).json({ error: "no data returned." });
    }
    if (error) {
      return res.status(444).json({ error: "no data returned." });
      console.error("form post failed:", error);
    }
  });
});

router.route("/addPlayer").post((req, res) => {
  var hasAuth = req.cookies.lmtoken;
  var tId = req.body.tId;
  var pId = req.body.pId;
  var options = {
    method: "POST",
    url: "https://avp-backend.com/api/backend/confirmAddPoolPlayers.php",
    headers: {
      "content-type": "multipart/form-data",
    },
    formData: { jwt: hasAuth, teamId: tId, selectedPoolPlayers: pId },
  };

  request(options, (error, response, body) => {
    var sCode = response.statusCode;
    var _resData = response.body ? JSON.parse(body) : null;
    var result = sCode == "404" ? (_resData = "undefined") : _resData;

    if (result && result.status == "Success") { 
      res.send(result);
    } else { 
      return res.status(444).json({ error: "no data returned." });
    }
    if (error) {
      return res.status(444).json({ error: "no data returned." });
      console.error("form post failed:", error);
    }
  });
});

router.route("/remPlayer").post((req, res) => {
  var hasAuth = req.cookies.lmtoken;
  var tmId = req.body.tmId;

  var options = {
    method: "POST",
    url: "https://avp-backend.com/api/backend/removeTeamPlayer.php",
    headers: {
      "content-type": "multipart/form-data",
    },
    formData: { jwt: hasAuth, teamMemberId: tmId },
  };

  request(options, (error, response, body) => {
    var sCode = response.statusCode;
    var _resData = response.body ? JSON.parse(body) : null;
    var result = sCode == "404" ? (_resData = "undefined") : _resData;

    if (result && result.status == "Success") { 
      res.send(result);
    } else { 
      return res.status(444).json({ error: "no data returned." });
    }
    if (error) {
      return res.status(444).json({ error: "no data returned." });
      console.error("form post failed:", error);
    }
  });
});

//Admin section
router.route("/admin-leagues").get((req, res) => {
  var hasAuth = req.cookies.lmtoken;

  var options = {
    method: "POST",
    url: "https://avp-backend.com/api/backend/getLeaguesAndManagers.php",
    headers: {
      "content-type": "multipart/form-data",
    },
    formData: {
      jwt: hasAuth,
    },
  };

  request(options, (error, response, body) => {
    var sCode = response.statusCode;
    var _resData = response.body ? JSON.parse(body) : null;
    var result = sCode == "404" ? (_resData = "undefined") : _resData;

    if (result && result.status == "Success") { 
      res.send(result);
    } else { 
      res.send(result);
    }
    if (error) {
      console.error("form post failed:", error);
      return res.status(444).json({ error: "no data returned." });
    }
  });
});

router.route("/admin-leaguesTab").get((req, res) => {
  var hasAuth = req.cookies.lmtoken;

  var options = {
    method: "POST",
    url: "https://avp-backend.com/api/backend/getAdminLeagueInfo.php",
    headers: {
      "content-type": "multipart/form-data",
    },
    formData: {
      jwt: hasAuth,
      flag: 1,
    },
  };

  request(options, (error, response, body) => {
    var sCode = response.statusCode;
    var _resData = response.body ? JSON.parse(body) : null;
    var result = sCode == "404" ? (_resData = "undefined") : _resData;

    if (result && result.status == "Success") { 
      res.send(result);
    } else { 
      res.send(result);
    }
    if (error) {
      console.error("form post failed:", error);
      return res.status(444).json({ error: "no data returned." });
    }
  });
});

router.route("/league-create").post(
  upload.fields([
    {
      name: "pic",
      maxCount: 1,
    },
    {
      name: "rules",
      maxCount: 1,
    },
  ]),
  (req, res) => {
    var hasAuth = req.cookies.lmtoken;
    var data = req.body;
    var img;
    if (req.file !== undefined) img = req.file.buffer;

    data.jwt = hasAuth;
    data = JSON.parse(JSON.stringify(data));

    var img, rules;
    if (req.files !== undefined) {
      img = req.files.pic;
      rules = req.files.rules;
    }

    if (img) {
      data.leagueIcon = {
        value: img[0].buffer,
        options: {
          filename: img[0].originalname,
          contentType: null,
        },
      };
    } else {
      data.leagueIcon = "";
    }

    if (rules) {
      data.rulesDoc = {
        value: rules[0].buffer,
        options: {
          filename: rules[0].originalname,
          contentType: null,
        },
      };
    } else {
      data.rulesDoc = "";
    }

    var options = {
      method: "POST",
      url: "https://avp-backend.com/devApi/backend/createLeague.php",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      formData: data,
    };

    request(options, (error, response, body) => {
      var sCode = response.statusCode;
      var _resData = JSON.parse(body);
      let result = sCode == "404" ? (_resData = "undefined") : _resData;

      if (result && result.status == "Success") {
        res.send(result);
      } else {
        res.send(result);
      }
      if (error) {
        return res.status(444).json({ error: "no data returned." });
      }
    });
  }
);

router.route("/view-league").get((req, res) => {
  var hasAuth = req.cookies.lmtoken;
  var lid = req.cookies.currentLid;
  if (lid) {
    var options = {
      method: "POST",
      url: "https://avp-backend.com/api/backend/getLeagueInfo.php",
      headers: {
        "content-type": "multipart/form-data",
      },
      formData: { jwt: hasAuth, leagueId: lid },
    };
  }
  request(options, (error, response, body) => {
    var sCode = response.statusCode;
    var _resData = response.body ? JSON.parse(body) : null;
    var result = sCode == "404" ? (_resData = "undefined") : _resData;

    if (result && result.status == "Success") {
      result.registrationDeadline = revertDate(result.registrationDeadline);
      result.startDate = revertDate(result.startDate);
      res.send(result);
    } else {
      res.send(result);
    }
    if (error) {
      return res.status(444).json({ error: "no data returned." });
    }
  });
});

router.route("/edit-league").post(
  upload.fields([
    {
      name: "pic",
      maxCount: 1,
    },
    {
      name: "rules",
      maxCount: 1,
    },
  ]),
  (req, res) => {
    var hasAuth = req.cookies.lmtoken;
    var data = req.body;
    var img;
    if (req.file !== undefined) img = req.file.buffer;

    data.jwt = hasAuth;
    data.leagueId = req.cookies.currentLid;
    data = JSON.parse(JSON.stringify(data));

    var img, rules;
    if (req.files !== undefined) {
      img = req.files.pic;
      rules = req.files.rules;
    }

    if (img) {
      data.leagueIcon = {
        value: img[0].buffer,
        options: {
          filename: img[0].originalname,
          contentType: null,
        },
      };
    } else {
      data.leagueIcon = "";
    }

    if (rules) {
      data.rulesDoc = {
        value: rules[0].buffer,
        options: {
          filename: rules[0].originalname,
          contentType: null,
        },
      };
    } else {
      data.rulesDoc = "";
    }

    var options = {
      method: "POST",
      url: "https://avp-backend.com/api/backend/editLeague.php",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      formData: data,
    };

    request(options, (error, response, body) => {
      var sCode = response.statusCode;
      var _resData = JSON.parse(body);
      let result = sCode == "404" ? (_resData = "undefined") : _resData;

      if (result && result.status == "Success") {
        res.send(result);
      } else {

        res.send(result);
      }
      if (error) {
        return res.status(444).json({ error: "no data returned." });
      }
    });
  }
);

router.route("/delete-league").get((req, res) => {
  var hasAuth = req.cookies.lmtoken;
  var lid = req.cookies.currentLid;
  if (lid) {
    var options = {
      method: "POST",
      url: "https://avp-backend.com/api/backend/deleteLeague.php",
      headers: {
        "content-type": "multipart/form-data",
      },
      formData: { jwt: hasAuth, leagueId: lid },
    };
  }
  request(options, (error, response, body) => {
    var sCode = response.statusCode;
    var _resData = response.body ? JSON.parse(body) : null;
    var result = sCode == "404" ? (_resData = "undefined") : _resData;
    if (result && result.status == "Success") { 
      res.send(result);
    } else {
      res.send(result);
    }
    if (error) {
      return res.status(444).json({ error: "no data returned." })
    }
  });
});

router.route("/edit-division").post(upload.none(), (req, res) => {
  var hasAuth = req.cookies.lmtoken;
  var data = req.body;
  data.jwt = hasAuth;
  data = JSON.parse(JSON.stringify(data));

  var options = {
    method: "POST",
    url: "https://avp-backend.com/devApi/backend/editDivision.php",
    headers: {
      "Content-Type": "multipart/form-data",
    },
    formData: data,
  };

  request(options, (error, response, body) => {
    var sCode = response.statusCode;
    var _resData = JSON.parse(body);
    let result = sCode == "404" ? (_resData = "undefined") : _resData;

    if (result && result.status == "Success") {
      res.send(result);
    } else {
      res.send(result);
    }
    if (error) {
      return res.status(444).json({ error: "no data returned." });
    }
  });
});

router.route("/create-division").post(upload.none(), (req, res) => {
  var hasAuth = req.cookies.lmtoken;
  var lId = req.cookies.currentLid;
  var data = req.body;

  data.jwt = hasAuth;
  data.leagueId = lId;
  data = JSON.parse(JSON.stringify(data));

  var options = {
    method: "POST",
    url: "https://avp-backend.com/api/backend/createDivision.php",
    headers: {
      "Content-Type": "multipart/form-data",
    },
    formData: data,
  };

  request(options, (error, response, body) => {
    var sCode = response.statusCode;
    var _resData = JSON.parse(body);
    let result = sCode == "404" ? (_resData = "undefined") : _resData;

    if (result && result.status == "Success") {
      res.send(result);
    } else {
      res.send(result);
    }
    if (error) {
      return res.status(444).json({ error: "no data returned." });
    }
  });
});

router.route("/delete-division").post(upload.none(), (req, res) => {
  var hasAuth = req.cookies.lmtoken;
  var data = req.body;

  data.jwt = hasAuth;
  data = JSON.parse(JSON.stringify(data));

  var options = {
    method: "POST",
    url: "https://avp-backend.com/api/backend/deleteDivision.php",
    headers: {
      "Content-Type": "multipart/form-data",
    },
    formData: data,
  };

  request(options, (error, response, body) => {
    var sCode = response.statusCode;
    var _resData = JSON.parse(body);
    let result = sCode == "404" ? (_resData = "undefined") : _resData;

    if (result && result.status == "Success") {
      res.send(result);
    } else {
      res.send(result);
    }
    if (error) {
      return res.status(444).json({ error: "no data returned." });
    }
  });
});

router.route("/league-status").post((req, res) => {
  var hasAuth = req.cookies.lmtoken;
  var data = req.body;
  data.jwt = hasAuth;
  data.leagueId = req.cookies.currentLid;

  var options = {
    method: "POST",
    url: "https://avp-backend.com/api/backend/setLeagueStatus.php",
    headers: {
      "Content-Type": "multipart/form-data",
    },
    formData: data,
  };

  request(options, (error, response, body) => {
    var sCode = response.statusCode;
    var _resData = response.body ? JSON.parse(body) : null;
    var result = sCode == "404" ? (_resData = "undefined") : _resData;

    if (result && result.status == "Success") {
      res.send(result);
    } else {
      res.send(result);
    }
    if (error) {
      return res.status(444).json({ error: "no data returned." });
    }
  });
});

router.route("/invite-manager").post((req, res) => {
  var hasAuth = req.cookies.lmtoken;
  var eId = req.body.emailId;

  var options = {
    method: "POST",
    url: "https://avp-backend.com/api/backend/inviteManager.php",
    headers: {
      "content-type": "multipart/form-data",
    },
    formData: { jwt: hasAuth, emailId: eId },
  };

  request(options, (error, response, body) => {
    var sCode = response.statusCode;
    var _resData = response.body ? JSON.parse(body) : null;
    var result = sCode == "404" ? (_resData = "undefined") : _resData; 

    if (result && result.status == "Success") {
      res.send(result);
    } else {
      res.send(result);
    }
  });
});

router.route("/view-manager").get((req, res) => {
  var hasAuth = req.cookies.lmtoken; 
  var mid = req.cookies.currentMid; 

  if (mid) {
    var options = {
      method: "POST",
      url: "https://avp-backend.com/api/backend/getLeagueManagerInfo.php",
      headers: {
        "content-type": "multipart/form-data",
      },
      formData: { jwt: hasAuth, leagueId: mid },
    };
  }
  request(options, (error, response, body) => {
    var sCode = response.statusCode;
    var _resData = response.body ? JSON.parse(body) : null;
    var result = sCode == "404" ? (_resData = "undefined") : _resData; 

    if (result && result.status == "Success") {
      res.send(result);
    } else {
      res.send(result);
    }
    if (error) {
      return res.status(444).json({ error: "no data returned." });
      console.error("form post failed:", error);
    }
  });
});

router.route("/delete-manager").get((req, res) => {
  var hasAuth = req.cookies.lmtoken;
  var mid = req.cookies.currentMid;
  if (mid) {
    var options = {
      method: "POST",
      url: "https://avp-backend.com/api/backend/deleteLeague.php",
      headers: {
        "content-type": "multipart/form-data",
      },
      formData: { jwt: hasAuth, leagueId: mid },
    };
  }
  request(options, (error, response, body) => {
    var sCode = response.statusCode;
    var _resData = response.body ? JSON.parse(body) : null;
    var result = sCode == "404" ? (_resData = "undefined") : _resData;

    if (result && result.status == "Success") {

      res.send(result);
    } else {
      res.send(result);
    }
    if (error) {
      return res.status(444).json({ error: "no data returned." });
      console.error("form post failed:", error);
    }
  });
});

router
  .route("/manager-edit")
  .get((req, res) => {
    var apitkn = req.cookies.lmtoken;
    var mId = req.cookies.currentMid;

    var options = {
      method: "POST",
      url: "https://avp-backend.com/api/backend/getLeagueManagerInfo.php",
      headers: {
        "content-type": "multipart/form-data",
      },
      formData: {
        jwt: apitkn,
        managerId: mId,
      },
    };

    request(options, function (error, response, body) {
      var _resData = JSON.parse(body);

      result = _resData;

      if (result && result.status == "Success") {
        result.contact = decrypt(_resData.contact);
        res.send(result);
      } else {
        res.send(result);
      }
      if (error) {
        return res.status(444).json({ error: "no data returned." });
        console.error("form post failed:", error);
      }
      if (_resData.contact && _resData.contact.length > 1) {
        var _val = _resData.contact;
        _val = _val.slice(0, 3) + " " + _val.slice(3, 6) + " " + _val.slice(6);
        _resData.contact = _val;
      }
    });
  })
  .post(upload.single("pic"), (req, res) => {
    var _apitkn = req.cookies.lmtoken;
    var _mId = req.cookies.currentMid;
    var _data = req.body;

    var img;
    if (req.file !== undefined) img = req.file.buffer;
    var _phone = encrypt(req.body.contact);
    let pw = req.body.password ? encrypt(req.body.password) : null;

    if (pw) _data.password = pw;

    _data.jwt = _apitkn;
    _data.managerId = _mId;
    _data.contact = _phone;

    _data = JSON.parse(JSON.stringify(_data));

    if (img) {
      _data.profilePic = {
        value: img,
        options: {
          filename: req.file.originalname,
          contentType: null,
        },
      };
    } else {
      _data.profilePic = "";
    }

    var options = {
      method: "POST",
      url: "https://avp-backend.com/api/backend/updateLeagueManager.php",
      headers: {
        "content-type": "multipart/form-data",
      },
      formData: _data,
    };

    request(options, (error, response, body) => {
      var sCode = response.statusCode;
      var _resData = response.body ? JSON.parse(body) : null;
      var result = sCode == "404" ? (_resData = "undefined") : _resData;
      
      if (result && result.status == "Success") {
        res.send(result);
      } else {
        res.send(result);
      }
    });
  });

router.route("/removeManagers").post((req, res) => {
  var hasAuth = req.cookies.lmtoken;
  var mId = req.body.mId;
  var lId = req.body.lId;

  var options = {
    method: "POST",
    url: "https://avp-backend.com/api/backend/removeLeagueManager.php",
    headers: {
      "content-type": "multipart/form-data",
    },
    formData: { jwt: hasAuth, leagueId: lId, managerId: mId },
  };

  request(options, (error, response, body) => {
    var sCode = response.statusCode;
    var _resData = response.body ? JSON.parse(body) : null;
    var result = sCode == "404" ? (_resData = "undefined") : _resData;

    if (result && result.status == "Success") {
      res.send(result);
    } else {
      res.send(result);
    }
  });
});

router.route("/loadMgrModal").post((req, res) => {
  var hasAuth = req.cookies.lmtoken;
  var lId = req.body.lId;

  var options = {
    method: "POST",
    url: "https://avp-backend.com/devApi/backend/getLeagueManagersOverlay.php",
    headers: {
      "content-type": "multipart/form-data",
    },
    formData: { jwt: hasAuth, leagueId: lId },
  };

  request(options, (error, response, body) => {
    var sCode = response.statusCode;
    var _resData = response.body ? JSON.parse(body) : null;
    var result = sCode == "404" ? (_resData = "undefined") : _resData;

    if (result && result.status == "Success") {
      res.send(result);
    } else {
      res.send(result);
    }
    if (error) {
      return res.status(444).json({ error: "no data returned." });
      console.error("form post failed:", error);
    }
  });
});

router.route("/addManager").post((req, res) => {
  var hasAuth = req.cookies.lmtoken;
  var lId = req.body.lId;
  let arr = req.body.mIds;
  var mIds = arr.join();

  var options = {
    method: "POST",
    url: "https://avp-backend.com/api/backend/confirmManagerToLeague.php",
    headers: {
      "content-type": "multipart/form-data",
    },
    formData: { jwt: hasAuth, leagueId: lId, managerId: mIds },
  };

  request(options, (error, response, body) => {
    var sCode = response.statusCode;
    var _resData = response.body ? JSON.parse(body) : null;
    var result = sCode == "404" ? (_resData = "undefined") : _resData;

    if (result && result.status == "Success") { 
      res.send(result);
    } else {
      res.send(result);
    }
    if (error) {
      return res.status(444).json({ error: "no data returned." });
      console.error("form post failed:", error);
    }
  });
});

router.route("/loadCourtsModal").post((req, res) => {
  var hasAuth = req.cookies.lmtoken;
  var zip = req.body.zip;
  var options = {
    method: "POST",
    url: "https://avp-backend.com/api/backend/addCourtList.php",
    headers: {
      "content-type": "multipart/form-data",
    },
    formData: { jwt: hasAuth, zip: zip },
  };

  request(options, (error, response, body) => {
    var sCode = response.statusCode;
    var _resData = response.body ? JSON.parse(body) : null;
    var result = sCode == "404" ? (_resData = "undefined") : _resData;

    if (result && result.status == "Success") {
      res.send(result);
    } else {
      res.send(result);
    }
    if (error) {
      return res.status(444).json({ error: "no data returned." });
      console.error("form post failed:", error);
    }
  });
});

router.route("/create-court").post(upload.single("pic"), (req, res) => {
  var hasAuth = req.cookies.lmtoken;
  var data = req.body;
  var img;
  if (req.file !== undefined) img = req.file.buffer;

  data.jwt = hasAuth;
  data = JSON.parse(JSON.stringify(data));

  if (img) {
    data.courtIcon = {
      value: img,
      options: {
        filename: req.file.originalname,
        contentType: null,
      },
    };
  } else {
    data.courtIcon = "";
  }

  var options = {
    method: "POST",
    url: "https://avp-backend.com/api/backend/createCourt.php",
    headers: {
      "Content-Type": "multipart/form-data",
    },
    formData: data,
  };

  request(options, (error, response, body) => {
    var sCode = response.statusCode;
    var _resData = response.body ? JSON.parse(body) : null;
    var result = sCode == "404" ? (_resData = "undefined") : _resData;

    if (result && result.status == "Success") {
      res.send(result);
    } else {
      res.send(result);
    }
    if (error) {
      console.error("form post failed:", error);
      return res.status(444).json({ error: "no data returned." });
    }
  });
});

// Schedule section
router.route("/schedule").get((req, res) => {
  var hasAuth = req.cookies.lmtoken;

  var options = {
    method: "POST",
    url: "https://avp-backend.com/api/backend/schedule.php",
    headers: {
      "content-type": "multipart/form-data",
    },
    formData: {
      jwt: hasAuth
    },
  };

  request(options, (error, response, body) => {
    var sCode = response.statusCode;
    var _resData = response.body ? JSON.parse(body) : null;
    var result = sCode == "404" ? (_resData = "undefined") : _resData;

    if (result && result.Status == "Success") {
      res.send(result);
    } else {
      res.send(result);
    }
    if (error) {
      console.error("form post failed:", error);
      return res.status(444).json({ error: "no data returned." });
    }
  });
});

router.route("/restart-schedule").post((req, res) => {
  var hasAuth = req.cookies.lmtoken;
  var options = {
    method: "POST",
    url: "https://avp-backend.com/api/backend/resetSchedule.php",
    headers: {
      "content-type": "multipart/form-data",
    },
    formData: {
      jwt: hasAuth,
      leagueId: req.body.lId,
    },
  };

  request(options, (error, response, body) => {
    var sCode = response.statusCode;
    var _resData = response.body ? JSON.parse(body) : null;
    var result = sCode == "404" ? (_resData = "undefined") : _resData;

    if (result && result.Status == "Success") { 
      res.send(result);
    } else {
      res.send(result);
    }
    if (error) {
      console.error("form post failed:", error);
      return res.status(444).json({ error: "no data returned." });
    }
  });
});

router.route("/bye-teams").post((req, res) => {
  var hasAuth = req.cookies.lmtoken;
  var tid = req.body.teams;
  var lid = req.cookies.currentLid;

  var options = {
    method: "POST",
    url: "https://avp-backend.com/api/backend/setByeTeams.php",
    headers: {
      "content-type": "multipart/form-data",
    },
    formData: { jwt: hasAuth, teamIdBye: tid, leagueId: lid },
  };

  request(options, (error, response, body) => {
    var sCode = response.statusCode;
    var _resData = response.body ? JSON.parse(body) : null;
    var result = sCode == "404" ? (_resData = "undefined") : _resData;

    if (result && result.status == "Success") {
      res.send(result);
    } else {
      res.send(result);
    }
    if (error) {
      return res.status(444).json({ error: "no data returned." });
    }
  });
});

router.route("/change-court").post(upload.none(), (req, res) => {
  var hasAuth = req.cookies.lmtoken;
  var tid = req.body.teamId;
  var court = req.body.courtId;

  var options = {
    method: "POST",
    url: "https://avp-backend.com/api/backend/changeCourtForTeams.php",
    headers: {
      "content-type": "multipart/form-data",
    },
    formData: { jwt: hasAuth, teamIds: tid, courtNo: court },
  };

  request(options, (error, response, body) => {
    var sCode = response.statusCode;
    var _resData = response.body ? JSON.parse(body) : null;
    var result = sCode == "404" ? (_resData = "undefined") : _resData;

    if (result && result.status == "Success") {
      res.send(result);
    } else {
      res.send(result);
    }
    if (error) {
      return res.status(444).json({ error: "no data returned." });
    }
  });
});

router.route("/generate").get((req, res) => {
  var hasAuth = req.cookies.lmtoken;
  var lid = req.cookies.currentLid;

  var options = {
    method: "POST",
    url: "https://avp-backend.com/api/backend/scheduleWLD.php",
    headers: {
      "content-type": "multipart/form-data",
    },
    formData: {
      jwt: hasAuth,
      leagueId: lid,
    },
  };

  request(options, (error, response, body) => {
    var sCode = response.statusCode;
    var _resData = response.body ? JSON.parse(body) : null;
    var result = sCode == "404" ? (_resData = "undefined") : _resData;

    if (result && result.status == "Success") {
      res.send(result);
    } else {
      res.send(result);
    }
    if (error) {
      return res.status(444).json({ error: "no data returned." });
    }
  });
});

router.route("/dupe-round").post((req, res) => {
  var hasAuth = req.cookies.lmtoken;
  var did = req.body.did;
  var cid = req.body.cid;

  var options = {
    method: "POST",
    url: "https://avp-backend.com/api/backend/duplicateRound.php",
    headers: {
      "content-type": "multipart/form-data",
    },
    formData: {
      jwt: hasAuth,
      divisionIds: did,
      courts: cid,
    },
  };

  request(options, (error, response, body) => {
    var sCode = response.statusCode;
    var _resData = response.body ? JSON.parse(body) : nu
    var result = sCode == "404" ? (_resData = "undefined") : _resData;

    if (result && result.status == "Success") {
      res.send(result);
    } else { 
      res.send(result);
    }
    if (error) {
      return res.status(444).json({ error: "no data returned." });
    }
  });
});

// Results section
router.route("/results").get((req, res) => {
  var hasAuth = req.cookies.lmtoken;

  var options = {
    method: "POST",
    url: "https://avp-backend.com/api/backend/results.php",
    headers: {
      "content-type": "multipart/form-data",
    },
    formData: {
      jwt: hasAuth,
    },
  };

  request(options, (error, response, body) => {
    var sCode = response.statusCode;
    var _resData = response.body ? JSON.parse(body) : null;
    var result = sCode == "404" ? (_resData = "undefined") : _resData;

    if (result && result.status == "Success") {
      res.send(result);
    } else {
      res.send(result);
    }
    if (error) {
      console.error("form post failed:", error);
      return res.status(444).json({ error: "no data returned." });
    }
  });
});

router.route("/delete-match").post(upload.none(), (req, res) => {
  var hasAuth = req.cookies.lmtoken;
  var mid = req.body.matchIds;

  if (mid) {
    var options = {
      method: "POST",
      url: "https://avp-backend.com/api/backend/deleteMatch.php",
      headers: {
        "content-type": "multipart/form-data",
      },
      formData: { jwt: hasAuth, matchIds: mid },
    };
  }
  request(options, (error, response, body) => {
    var sCode = response.statusCode;
    var _resData = response.body ? JSON.parse(body) : null;
    var result = sCode == "404" ? (_resData = "undefined") : _resData;

    if (result && result.status == "Success") {
      res.send(result);
    } else {
      res.send(result);
    }
    if (error) {
      return res.status(444).json({ error: "no data returned." });
      console.error("form post failed:", error);
    }
  });
});

router.route("/dupe-match").post(upload.none(), (req, res) => {
  var hasAuth = req.cookies.lmtoken;
  var mid = req.body.matchId;

  if (mid) {
    var options = {
      method: "POST",
      url: "https://avp-backend.com/api/backend/duplicateMatch.php",
      headers: {
        "content-type": "multipart/form-data",
      },
      formData: { jwt: hasAuth, matchId: mid },
    };
  }
  request(options, (error, response, body) => {
    var sCode = response.statusCode;
    var _resData = response.body ? JSON.parse(body) : null;

    var result = sCode == "404" ? (_resData = "undefined") : _resData;

    if (result && result.status == "Success") {
      res.send(result);
    } else {
      res.send(result);
    }
    if (error) {
      return res.status(444).json({ error: "no data returned." });
    }
  });
});

router.route("/edit-results").post((req, res) => {
  var hasAuth = req.cookies.lmtoken;
  var m = req.body.mids;
  var a = JSON.stringify(req.body.ta);
  var b = JSON.stringify(req.body.tb);

  var options = {
    method: "POST",
    url: "https://avp-backend.com/api/backend/editLeagueMatchScore.php",
    headers: {
      "content-type": "multipart/form-data",
    },
    formData: {
      jwt: hasAuth,
      matchIds: m,
      teamAScore: a,
      teamBScore: b,
    },
  };

  request(options, (error, response, body) => {
    var sCode = response.statusCode;
    var _resData = response.body ? JSON.parse(body) : null;
    var result = sCode == "404" ? (_resData = "undefined") : _resData;

    if (result && result.status == "Success") {
      res.send(result);
    }
    if (error) {
      return res.status(444).json({ error: "no data returned." })

    }
  });
});


module.exports = router;
