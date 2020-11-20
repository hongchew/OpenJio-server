const express = require('express');
const app = express();
const dotenv = require('dotenv');
const engines = require("consolidate");
dotenv.config();

//#region Database
const getDb = require('./database');
getDb();

//#endregion

//#region Express Config
app.use('/files', express.static('files'));
app.use(express.json());
app.engine("ejs", engines.ejs);
app.set("views", "./views");
app.set("view engine", "ejs");

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

//#region Routes
const usersRouter = require('./routes/usersRoutes');
const adminsRouter = require('./routes/adminRoutes');
const announcementsRouter = require('./routes/announcementsRoutes');
const requestsRouter = require('./routes/requestsRoutes');
const addressesRouter = require('./routes/addressesRoutes');
const walletsRouter = require('./routes/walletRoutes');
const transactionRouter = require('./routes/transactionRoutes');
const paypalRouter = require('./routes/paypalRoutes');
const temperatureRouter = require('./routes/temperatureRoutes');
const complaintRouter = require('./routes/complaintRoutes');
const supportTicket = require('./routes/supportTicketRoutes');
// const supportComment = require('./routes/supportCommentRoutes');

app.use('/users', usersRouter);
app.use('/admins', adminsRouter);
app.use('/announcements', announcementsRouter);
app.use('/requests', requestsRouter);
app.use('/addresses', addressesRouter);
app.use('/wallets', walletsRouter);
app.use('/transactions', transactionRouter);
app.use('/paypal', paypalRouter);
app.use('/temperatures', temperatureRouter);
app.use('/complaints', complaintRouter);
app.use('/supportTickets', supportTicket);
// app.use('/supportComments', supportComment);
app.use('/files', express.static('files'));

//#endregion

//#region Routine Tasks
const cron = require('node-cron');
const {doMonthlyTasks} = require('./utils/routineTasks');
cron.schedule('* * 1 * *', async () => {
  try {
    await doMonthlyTasks();
  } catch (e) {
    console.log(e);
  }
});

//#endregion

//#region Manual Trigger for Routine Tasks Endpoints
app.post('/manual-trigger-monthly', (req, res) => {
  console.log('\n*** MANUALLY TRIGGERING MONTHLY TASKS *** ');
  doMonthlyTasks()
    .then(() => {
      res.json(true);
    })
    .catch((e) => {
      console.log(e)
      res.status(500).json(false);
    });
});
//#endregion

//#region Testing endpoints
app.get('/', (req, res) => {
  res.send(`
    <h1>IS4103 Information Systems Capstone Project AY2021 Semester 1</h1>
    <h2>TT01 - OpenJio Server on express.js</h2>
  `);
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}"`);
});
//#endregion

module.exports = app;
