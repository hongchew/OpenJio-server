const express = require("express");
const router = express.Router();

/* http://localhost:3000/users/ . */
router.get("/",  (req, res) => {
    res.send('users API endpoint ')
});

module.exports = router;
