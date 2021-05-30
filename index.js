const express = require('express');
const expressLayout = require('express-ejs-layouts');
const app = express();
const flash = require('connect-flash');
const session = require('express-session');
const socketio = require("socket.io");
const http = require("http");
const dotenv = require('dotenv');
const passport = require('passport');
const methodOverride = require('method-override');
const User = require('./modules/user');
const Page = require('./modules/pages');

//Pssport config
require('./config/passport')(passport)
const mongoose = require('mongoose');
const { emit } = require('./modules/pages');
dotenv.config();

const server = http.createServer(app);

var io = socketio(server, {
    transports: ['websocket', 'flashsocket', 'htmlfile', 'xhr-polling', 'polling']
});

mongoose.connect(`mongodb+srv://avi-gamliel:${process.env.MONGO_DB}@cluster-kanban.bzeyx.mongodb.net/${process.env.DATABASE}?retryWrites=true&w=majority`, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false
}, async function (err) {
    if (err) throw err;
    let userNotification = {};
    await io.on('connection', async (socket) => {
        let countChange = 0;
        socket.on('joinRoom', async (data) => {      // data will look like => {myID: "123123"}
            socket.join(data.room)
        });

        socket.on('updateData', (data) => {
            Page.find({ _id: data }).populate('custumers_share').populate('custumer_id').
                exec(async function (err, page) {
                    if (page) {
                        sharesUsers = []
                        page[0].custumers_share.forEach(users => {
                            sharesUsers.push({ name: users.name, short: users.shortName });
                        })
                        page[0].custumers_share.forEach(costumer => {
                            const notifiaction = costumer.notification;
                            socket.to(`${costumer._id}/dashboard`).emit('notification', {
                                note: notifiaction,
                                page: {
                                    adminName: page[0].custumer_id[0].name,
                                    adminShort: page[0].custumer_id[0].shortName,
                                    pageName: page[0].name_board,
                                    pageSec: page[0].name_desc,
                                    userShare: sharesUsers,
                                    id: page[0].page_id
                                }
                            })

                        })
                    }
                })
        });

        socket.on('removeBoard', data => {
            data.page[0].custumers_share.forEach(user => {
                socket.to(`${user}/dashboard`).emit('notifcation_deleteBoard', data)
            })
        })

        socket.on('userShare', data => {
            data.usersShare.forEach(USER => {
                User.find({ _id: USER[2] }).exec().then(user => {
                    socket.to(`${USER[2]}/dashboard`).emit('userShare', { data: data, note: user[0].notification })
                })
            })
        })

        socket.on('createRoom', (data) => {
            socket.nickname = data.Search.split("=")[1];
            socket.join(data.URL);
            let userExist = []
            let nickname = io.sockets.sockets.get(socket.id).nickname;
            io.sockets.sockets.forEach(user => {
                if (user.nickname && user.nickname !== nickname) {
                    userExist.push(user.nickname);
                }
            })
            io.sockets.in(data.URL).emit('connectToRoom', { userExist: userExist, user: nickname });
        })

        socket.on('leaveRoom', (data) => {
            let userExist = []
            socket.nickname = data.Search.split("=")[1];
            socket.leave(data.URL);
            let nickname = io.sockets.sockets.get(socket.id).nickname;
            io.sockets.sockets.forEach(user => {
                if (user.nickname && user.nickname !== nickname) {
                    userExist.push(user.nickname);
                }
            })
            io.sockets.in(data.URL).emit('leaveRoom', { userExist: userExist, user: nickname });
        })

        socket.on('updateMove', data => {
            socket.to(data.url).emit('updateMove', data.Move)
        })

        socket.on('sendToRoom', (link) => {
            io.to(link).emit('getDataToRoom')
        })

        socket.on('changeNote', data => {

            if (data.type == 'removeNote') {
                socket.to(data.url).emit('removeNote', { child: data.idBoard, parent: data.parent })
            }
            if (data.type == 'changeNote') {
                socket.to(data.url).emit('changeNote', { child: data.idBoard, parent: data.parent, item: data.item, target: data.target })
            }
            if (data.type == 'addNewText') {
                io.to(data.url).emit('changeNote', { child: data.idBoard, parent: data.parent, target: data.target })
            }
            if (data.type == 'addNewCheckList') {
                io.to(data.url).emit('changeNote', { child: data.idBoard, parent: data.parent, target: data.target })
            }
            if (data.type == 'submitList') {
                io.to(data.url).emit('changeNote', { child: data.idBoard, parent: data.parent, target: data.target, idTask: data.idTask, value: data.value })
            }
            if (data.type == 'changeListTitle') {
                io.to(data.url).emit('changeNote', { child: data.idBoard, parent: data.parent, target: data.target, idTask: data.idTask, taskId: data.taskId, item: data.item })
            }
            if (data.type == 'checked') {
                io.to(data.url).emit('changeNote', { child: data.idBoard, parent: data.parent, target: data.target, taskId: data.taskId, check: data.check, li: data.li })
            }
            if (data.type == 'delete') {
                io.to(data.url).emit('changeNote', { child: data.idBoard, parent: data.parent, target: data.target, taskId: data.taskId, li: data.li })
            }
            if (data.type == 'deleteTitle') {
                io.to(data.url).emit('changeNote', { child: data.idBoard, parent: data.parent, target: data.target, taskId: data.taskId })
            }
            if (data.type == 'changeTaskTitle') {
                io.to(data.url).emit('changeNote', { child: data.idBoard, parent: data.parent, target: data.target, taskId: data.taskId, item: data.item })
            }
        })
    })
});

//JSON
app.use(express.json());

// EJS
app.use(expressLayout);
app.set('view engine', 'ejs');

app.use(methodOverride('_method'));

// Bodyparser
app.use(express.urlencoded({ extended: false }));

// Express session middleware
app.use(session({
    secret: 'asdasd',
    resave: true,
    saveUninitialized: true
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// check passport
app.use((req, res, next) => {
    next();
})

// Connect flash
app.use(flash());

// Global Vars 
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.data = req.flash('data');
    next();
})

//----------- GET Test page PUBLIC -----------//
app.get('/test', (req, res) => res.render('test'));

// Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use(express.static(__dirname + '/public'));

const PORT = process.env.PORT || 5007;

server.listen(PORT, () => console.log(`server start on port ${PORT}`))