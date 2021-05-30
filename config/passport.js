const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const dotenv = require('dotenv');
const User = require('.././modules/user');

dotenv.config();

module.exports = function (passport) {
    let USER;
    let userPass;
    passport.use(
        new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
            User.find({ email: email }).exec().then(doc => {

                let userExist = false;

                if (email === doc[0].email) {
                    userExist = true;
                    userPass = doc[0].password;
                    USER = doc[0];
                }
                if (!userExist) {
                    return done(null, false, { msg: 'That email is not register' })
                } else {
                    bcrypt.compare(password, userPass, (err, isMatch) => {

                        if (err) throw err;
                        if (isMatch) {
                            return done(null, USER)
                        } else {
                            return done(null, false, { message: 'password incorrect' })
                        }

                    });
                }


            }).catch(err => {
                console.log(63, err);
            });

        }));

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        return done(null, USER);
    });
}