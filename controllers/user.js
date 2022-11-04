const User = require('../models/user')

module.exports.renderRegister = (req, res) => {
    res.render('user/register.ejs')
}

module.exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body
        const user = new User({ username, email })
        const registeredUser = await User.register(user, password)
        req.login(registeredUser, function (err) {
            if (err) {
                return next(err);
            }
            req.flash('sucess', 'welcome to yelpcamp')
            res.redirect('/campground')
        })
    } catch (err) {
        req.flash('error', err.message)
        res.redirect('/register')
    }
}

module.exports.renderLogin = (req, res) => {
    res.render('user/login.ejs')
}

module.exports.login = (req, res) => {
    req.flash('sucess', 'welcome back')
    // const redirectUrl = req.session.returnTo || '/campground'
    // console.log(req.session.returnTo)
    // delete req.session.returnTo
    res.redirect('/campground')
}

module.exports.logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('sucess', 'GoodBye!!');
        res.redirect('/campground');
    });
}