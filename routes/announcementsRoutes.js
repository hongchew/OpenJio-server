const express = require("express");
const router = express.Router();

/* http://localhost:3000/announcements/ . */
router.get("/",  (req, res) => {
    res.send('announcements API endpoint ')
});

module.exports = router;
