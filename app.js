const express = require('express');
const expressLayouts = require('express-ejs-layouts');


const flash = require('connect-flash');
const session = require('express-session');
const mysql = require("mysql");
const bodyparser = require("body-parser");
const fileupload = require('express-fileupload');
const busboy = require("then-busboy");
const http = require('http');
const path = require('path');
const multer = require('multer');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');


const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'attachments');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'application/pdf' ||
    file.mimetype === 'application/msword'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: "DeliverMe",
  port:'8889'
});

db.connect((err) => {
  if (err) console.log(err);
  else {
    console.log("Connected to Mysql database");
  }
});



const app = express();

//ejs
app.use(expressLayouts);
app.set('view engine', 'ejs');


//bodyparser
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
app.use(express.static(path.join(__dirname, 'public')));

//fileupload
app.use(fileupload());


//session
app.use(session({
  secret: 'thisismysecretdonttellthisanyone',
  name: 'sid',
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 10000 * 6 * 20,
    sameSite: true,
    secure: false
  }

}));


app.use(flash());

app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');

  res.locals.error_msg = req.flash('error_msg');

  res.locals.error = req.flash('error');
  next();
})

app.use('/', require('./routes/index'));
app.use('/users', require('./routes/user'));


app.use('/attachments', express.static(path.join(__dirname, 'attachments')));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('file')
);

const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./utils/users');
const botName = 'ChatCord Bot';



const server = http.createServer(app);
const io = socketio(server);
// Run when client connects
io.on('connection', socket => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // Welcome current user
    socket.emit('message', formatMessage(botName, 'Welcome to ChatCord!'));

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, `${user.username} has joined the chat`)
      );

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });

  // Listen for chatMessage
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} has left the chat`)
      );

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
});

const PORT = 4000;

app.listen(PORT, console.log("listening on port "));