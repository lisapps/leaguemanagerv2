export default function validate(values) {
  let errors = {};

  //email
  if (values.emailId !== undefined && values.emailId == "") {
    errors.emailId = "Email address is required";
  } else if (
    values.emailId &&
    values.emailId &&
    !/\S+@\S+\.\S+/.test(values.emailId)
  ) {
    errors.emailId = "Email address is invalid";
  }

  //zip
  if (values.zip !== undefined && values.zip == "") {
    errors.zip = "Zip is required";
  } else if (values.zip && !/^[0-9]{5}(?:-[0-9]{4})?$/.test(values.zip)) {
    errors.zip = "Please enter a valid zip code";
  }

  //phone number
  if (values.contact !== undefined && values.contact == "") {
    errors.contact = "Phone number is required";
  } else if (
    values.contact &&
    !/^(\([0-9]{3}\) |[0-9]{3}-)[0-9]{3}-[0-9]{4}$/.test(values.contact) &&
    !/^[0-9]{10}$/.test(values.contact)
  ) {
    errors.contact = "Please enter a U.S. phone number with area code.";
  }

  //dob

  if (values.dob !== undefined && values.dob == "") {
    errors.dob = "Please enter a valid Date of Birth.";
  } else if (
    values.dob &&
    !/(?:(?:0[1-9]|1[0-2])[/\-. ]?(?:0[1-9]|[12][0-9])|(?:(?:0[13-9]|1[0-2])[/\-. ]?30)|(?:(?:0[13578]|1[02])[/\-. ]?31))[/\-. ]?(?:19|20)[0-9]{2}/.test(
      values.dob
    )
  ) {
    errors.dob = "Please enter a valid Date of Birth.";
  } else {
    var birthday = +new Date(values.dob);
    var age = ~~((Date.now() - birthday) / 31557600000);
    if (values.dob !== undefined && age < 18) {
      errors.dob = "Player must be over 18.";
    }
  }

  // beach experience
  if (values.beachExperience !== undefined && values.beachExperience == "") {
    errors.beachExperience = "Beach experience is required";
  }

  //password
  if (values.password) {
    if (values.password == undefined) {
      errors.password = "Password is required";
    } else if (values.password.length < 8) {
      errors.password = "Password must contain at least 8 characters.";
    } else if (values.password.search(/[0-9]/) < 0) {
      errors.password = "Your password must contain at least one digit.";
    }
    var ltrTest = values.password.match(/[a-zA-Z]/);

    if (ltrTest !== null) {
      var ltr = values.password.match(/[a-zA-Z]/).pop();
      if (ltr.match(/[A-Z]/)) {
        errors.password =
          "Your uppercase letter can not be the first character in your password.";
      }
    }
    if (values.password.search(/[A-Z]/) < 0) {
      errors.password =
        "Your password must contain at least one uppercase letter.";
    }
    if (values.password.search(/[!@#$%^&*_=+-]/) < 0) {
      errors.password =
        "Your password must contain at least one special character.";
    }
    if (values.password !== values.passwordConfirm) {
      errors.password = "Passwords must match.";
    }
  }

  // Create League

  // league cost
  if (values.leagueCost !== undefined && values.leagueCost == "") {
    errors.leagueCost = "Cost is required";
  }

  // league day
  if (values.dayOfLeague !== undefined && values.dayOfLeague == "") {
    errors.dayOfLeague = "League Day is required";
  }

  // league time
  if (values.time !== undefined && values.time == "") {
    errors.time =
      "League Time is required. Different times can be set later at a division level.";
  }

  // league duration
  if (values.duration !== undefined && values.duration == "") {
    errors.duration = "Duration is required";
  }

  //registration deadline
  if (
    values.registrationDeadline !== undefined &&
    values.registrationDeadline == ""
  ) {
    errors.registrationDeadline = "Please enter a valid date.";
  } else if (
    values.registrationDeadline &&
    !/(?:(?:0[1-9]|1[0-2])[/\-. ]?(?:0[1-9]|[12][0-9])|(?:(?:0[13-9]|1[0-2])[/\-. ]?30)|(?:(?:0[13578]|1[02])[/\-. ]?31))[/\-. ]?(?:19|20)[0-9]{2}/.test(
      values.registrationDeadline
    )
  ) {
    errors.registrationDeadline = "Please enter a valid date.";
  } else {
    var reg = +new Date(values.registrationDeadline);
    reg = reg + 86400000; //add rest of time of day up till midnite
    var today = Date.now();
    if (today > reg) {
      errors.registrationDeadline = "Registration date can't be in the past.";
    }
  }

  //registration deadline for edit league (allows past date)
  if (
    values.registrationDeadlineEdit !== undefined &&
    values.registrationDeadlineEdit == ""
  ) {
    errors.registrationDeadlineEdit = "Please enter a valid date.";
  } else if (
    values.registrationDeadlineEdit &&
    !/(?:(?:0[1-9]|1[0-2])[/\-. ]?(?:0[1-9]|[12][0-9])|(?:(?:0[13-9]|1[0-2])[/\-. ]?30)|(?:(?:0[13578]|1[02])[/\-. ]?31))[/\-. ]?(?:19|20)[0-9]{2}/.test(
      values.registrationDeadlineEdit
    )
  ) {
    errors.registrationDeadlineEdit = "Please enter a valid date.";
  }

  //league start date
  if (values.startDate !== undefined && values.startDate == "") {
    errors.startDate = "Please enter a valid date.";
  } else if (
    values.startDate &&
    !/(?:(?:0[1-9]|1[0-2])[/\-. ]?(?:0[1-9]|[12][0-9])|(?:(?:0[13-9]|1[0-2])[/\-. ]?30)|(?:(?:0[13578]|1[02])[/\-. ]?31))[/\-. ]?(?:19|20)[0-9]{2}/.test(
      values.startDate
    )
  ) {
    errors.startDate = "Please enter a valid date.";
  } else {
    var sd = +new Date(values.startDate);
    sd = sd + 86400000; //add rest of time of day up till midnite
    var today = Date.now();
    if (today > sd) {
      errors.startDate = "Start date can't be in the past.";
    }
  }

  //league start date for edit league (allows past date)
  if (values.startDateEdit !== undefined && values.startDateEdit == "") {
    errors.startDateEdit = "Please enter a valid date.";
  } else if (
    values.startDateEdit &&
    !/(?:(?:0[1-9]|1[0-2])[/\-. ]?(?:0[1-9]|[12][0-9])|(?:(?:0[13-9]|1[0-2])[/\-. ]?30)|(?:(?:0[13578]|1[02])[/\-. ]?31))[/\-. ]?(?:19|20)[0-9]{2}/.test(
      values.startDateEdit
    )
  ) {
    errors.startDate = "Please enter a valid date.";
  }

  // league format
  if (values.format !== undefined && values.format == "") {
    errors.format = "League format is required.";
  }

  // league type
  if (values.type !== undefined && values.type == "") {
    errors.type = "Game Type is required";
  }

  // league gender
  if (values.gender !== undefined && values.gender == "") {
    errors.gender = "Gender is required";
  }

  // league env
  if (values.environment !== undefined && values.environment == "") {
    errors.environment = "Environment is required";
  }

  // league maxteams
  if (values.maxTeams !== undefined && values.maxTeams == "") {
    errors.maxTeams = "Gender is required";
  }

  // league preferredSurface
  if (values.preferredSurface !== undefined && values.preferredSurface == "") {
    errors.preferredSurface = "Preferred Surface is required";
  }

  // league noofDivisions
  if (values.noofDivisions !== undefined && values.noofDivisions == "") {
    errors.noofDivisions = "No. of Divisions is required";
  }

  // court - name
  if (values.courtName !== undefined && values.courtName == "") {
    errors.courtName = "Name is required";
  }

  // court - address 1
  if (values.addressLine1 !== undefined && values.addressLine1 == "") {
    errors.addressLine1 = "Street address is required";
  }

  // court - city
  if (values.city !== undefined && values.city == "") {
    errors.city = "City is required";
  }

  // court - state
  if (values.state !== undefined && values.state == "") {
    errors.state = "State address is required";
  }

  // court - overall Rating
  if (values.overallRating !== undefined && values.overallRating == "") {
    errors.overallRating = "Overall Rating address is required";
  }

  // court - net Rating
  if (values.netRating !== undefined && values.netRating == "") {
    errors.netRating = "Net Rating address is required";
  }

  // court - Num of courts
  if (values.noOfCourts !== undefined && values.noOfCourts == "") {
    errors.noOfCourts = "Number of courts is required";
  }

  // court - Lines
  if (values.line !== undefined && values.line == null) {
    errors.line = "Lines is required";
  }

  // court - antenna
  if (values.antenna !== undefined && values.antenna == null) {
    errors.antenna = "Antennas is required";
  }

  // court - adjustableHeight
  if (
    values.adjustableHeight !== undefined &&
    values.adjustableHeight == null
  ) {
    errors.adjustableHeight = "Adjustable Height is required";
  }

  // court - publicRestroom
  if (values.publicRestroom !== undefined && values.publicRestroom == null) {
    errors.publicRestroom = "Public Restroom is required";
  }

  // court - parking
  if (values.parking !== undefined && values.parking == null) {
    errors.parking = "Parking is required";
  }

  // Edit Division

  // division cost
  if (values.divisionCost !== undefined && values.divisionCost == "") {
    errors.divisionCost = "Cost is required";
  }

  // division - Num of courts
  if (values.courtsAvailable !== undefined && values.courtsAvailable == "") {
    errors.courtsAvailable = "Number of courts is required";
  }

  // division - court start number
  if (values.courtStartNumber !== undefined && values.courtStartNumber == "") {
    errors.courtStartNumber = "Court starting number is required";
  }

  // division - teams per court
  if (values.teamsPerCourt !== undefined && values.teamsPerCourt == "") {
    errors.teamsPerCourt = "Number of teams using court is required";
  }

  // division - matches per court
  if (values.matchesPerCourt !== undefined && values.matchesPerCourt == "") {
    errors.matchesPerCourt = "Number of matches per court is required";
  }

  // division gender
  if (values.gameType !== undefined && values.gameType == "") {
    errors.gameType = "Gender is required";
  }

  // division day
  if (values.divisionDay !== undefined && values.divisionDay == "") {
    errors.divisionDay = "Division Day is required";
  }

  // division format
  if (values.matchFormat !== undefined && values.matchFormat == "") {
    errors.matchFormat = "Match Format choice is required";
  }

  // division team reffing
  if (values.teamReffing !== undefined && values.teamReffing == "") {
    errors.teamReffing = "Team Reffing choice is required";
  }

  // division score tracking
  if (values.scoreTracking !== undefined && values.scoreTracking == "") {
    errors.scoreTracking = "Score Tracking choice is required";
  }

  // division time
  if (values.divTime !== undefined && values.divTime == "") {
    errors.divTime = "Time is required.";
  }

  return errors;
}
