const express = require("express");
const router = express.Router();

/* http://localhost:3000/adminLogin/ . */
router.get("/", (req, res) => {
  res.send("admin login API endpoint ");
});

module.exports = router;
