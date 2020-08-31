const express = require("express");
const router = express.Router();

/* http://localhost:3000/requests/ . */
router.get("/",  (req, res) => {
    res.send('requests API endpoint ')
});

module.exports = router;
