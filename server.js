const express = require('express');
const app = express();

//#region Database
const getDb = require('./database');
getDb();

//#endregion

//#region Express Config
app.use('/files', express.static('files'));
app.use(express.json());

// enable files upload
const fileUpload = require('express-fileupload');
app.use(
  fileUpload({
    createParentPath: true,
  })
);

//#region middleware
const cors = require('cors');
const bodyParser = require('body-parser');

app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));

//#region middleware
const cors = require('cors');
const bodyParser = require('body-parser');

app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));

//#region Routes
const usersRouter = require('./routes/usersRoutes');
const adminsRouter = require('./routes/adminRoutes');
const announcementsRouter = require('./routes/announcementsRoutes');
const requestsRouter = require('./routes/requestsRoutes');
const addressesRouter = require('./routes/addressesRoutes');

app.use('/users', usersRouter);
app.use('/admins', adminsRouter);
app.use('/announcements', announcementsRouter);
app.use('/requests', requestsRouter);
app.use('/addresses', addressesRouter);
app.use('/files', express.static('files'));

//#endregion

//#region Testing endpoints
app.get('/', (req, res) => {
  res.send(`
    <h1>IS4103 Information Systems Capstone Project AY2021 Semester 1</h1>
    <h2>TT01 - OpenJio Server on express.js</h2>
  `);
});

app.get('/test', (req, res) => {
  res.json({status: 'success - the server is running'});
});

app.post('/testJson', (req, res) => {
  console.log(req.body);
  req.body.acknowledgement = true;
  res.json(req.body);
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}"`);
});
//#endregion

module.exports = app;
