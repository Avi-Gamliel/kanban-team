const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport')
// const mysql = require('mysql');
const dotenv = require('dotenv');
const mongoose = require('mongoose')
const User = require('.././modules/user');
dotenv.config();

//-------- GET Register Page PUBLIC-----------// 
router.get('/register', (req, res) => res.render('register'));

//-------- POST Register Page PUBLIC-----------// 
router.post('/register', async (req, res) => {
    const { fName, lName, email, password, password2 } = req.body;
    let errors = [];
    const fullName = `${fName} ${lName}`;
    const CharName = `${fName.trim()[0].toUpperCase()}${lName.trim()[0].toUpperCase()}`;

    if (!fName || !lName || !email || !password || !password2) {
        errors.push({ msg: ' Please fill in all fields' })
    }

    if (password2 !== password) {
        errors.push({ msg: ' Passwords do not match' });
    }

    if (password.length < 6) {
        errors.push({ msg: 'Password should be at least 6 charachters' })
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            fName,
            lName,
            email,
            password,
            password2
        })
    } else {

        let userExist = false;
        User.find({ email: email }).exec().then(async doc => {

            if (doc.length > 0) {
                errors.push({ msg: 'user exist' });
                res.render('register', {
                    errors,
                    fName,
                    lName,
                    email,
                    password,
                    password2
                });
            } else {
                let userAdd = false;
                const salt = await bcrypt.genSalt(10);
                const hashPasswaord = await bcrypt.hash(password, salt)
                const user = new User({
                    _id: mongoose.Types.ObjectId(),
                    name: fullName,
                    shortName: CharName,
                    email: email,
                    password: hashPasswaord,
                    payment: false
                });
                user.save().then(user => {
                    req.flash('success_msg', 'you are now registor')
                    res.redirect('/users/login')
                }).catch(err => {
                    console.log(err);
                });
            }
        }).catch(err => {
            console.log(63, err);
        });
    }
});

//----------- GET Login Page PUBLIC ----------// 
router.get('/login', (req, res) => res.render('login'));

//----------- POST Login Page PUBLIC -----------// 
router.post('/login', function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        if (err) { return next(err); }
        if (!user) {
            req.flash('error', info.message);
            res.redirect('/users/login');
            return;
        }
        req.logIn(user, function (err) {
            if (err) { return next(err); }
            return res.redirect('/' + user.id + '/dashboard');
        });
    })(req, res, next);
});

//------- GET handle log out user PUBLIC --------// 
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'you are logged out');
    res.redirect('/users/login')
});

module.exports = router;