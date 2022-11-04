const { campgroundSchema } = require('./schemas.js')
const { reviewSchema } = require('./schemas.js')
const ExpressError = require('./utils/ExpressError')
const campground = require('./models/campground')
const Review = require('./models/review')


module.exports.isLoggedin = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'you must sign in first')
        return res.redirect('/login')
    }
    next()
}

module.exports.ValidateCampground = (req, res, next) => {

    const { error } = campgroundSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }

}

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campgrounds = await campground.findById(id);
    if (!campgrounds.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campground/${id}`);
    }
    next()
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campground/${id}`);
    }
    next()
}

module.exports.ValidateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}
