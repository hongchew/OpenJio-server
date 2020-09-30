const express = require("express");
const router = express.Router();

/* http://localhost:3000/dashboard/ . */
router.get("/", (req, res) => {
  res.send("dashboard API endpoint ");
});

module.exports = router;
