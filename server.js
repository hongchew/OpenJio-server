const express = require('express');
const app = express();
const port = 3000;

//#region Database
const getDb = require('./database')
getDb();

//#endregion

//#region Routes 
const usersRouter = require('./routes/usersRoutes')
const announcementsRouter = require('./routes/announcementsRoutes')
const requestsRouter = require('./routes/requestsRoutes')


app.use("/users", usersRouter);
app.use("/announcements", announcementsRouter);
app.use("/requests", requestsRouter)
app.use("/files", express.static("files"));

//#endregion

//#region Servable files
app.use("/files", express.static("files"));

//#endregion


//#region Testing endpoints
app.get("/", (req, res) => {
  res.send(`
    <h1>IS4103 Information Systems Capstone Project AY2021 Semester 1</h1>
    <h2>TT01 - OpenJio Server on express.js<h2>
  `);
});

app.get("/test", (req, res) => {
  res.json({ status: "success - the server is running" });
});


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}"`);
});
//#endregion

module.exports = app;
