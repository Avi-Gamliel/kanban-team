const Page = require('.././modules/pages');

module.exports = {
    ensureAdmin: function (req, res, next) {
        //check if the user is the own board
        Page.find({ custumer_id: [req.params.id], page_id: req.params.board }).exec().then(page => {
            if (page.length > 0) {
                return next();
            } else {
                req.flash('error', 'You are not admin!');
                res.redirect(`/${req.params.id}/dashboard/${req.params.board}`);
            }
        });
    }
}