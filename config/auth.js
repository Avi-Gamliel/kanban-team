module.exports = {
    ensureAuthenticated: function (req, res, next) {
        if (req.isAuthenticated()) {
            return next()
        }
        req.flash('error', 'You are not logged!');
        res.redirect('/users/login');
    }
}