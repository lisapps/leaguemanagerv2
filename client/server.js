const express = require("express");
const path = require("path");
const app = express();
const dotenv = require("dotenv");
dotenv.config();

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Listening on port ${port}`));
app.use(express.static("dist"));

// create a GET route
app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});
