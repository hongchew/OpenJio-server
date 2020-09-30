const express = require("express");
const router = express.Router();

/* http://localhost:3000/adminProfile/ . */
router.get("/", (req, res) => {
  res.send("admin profile API endpoint ");
});

module.exports = router;
