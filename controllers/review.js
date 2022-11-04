const campground = require('../models/campground')
const Review = require('../models/review')

module.exports.creatReviews = async (req, res) => {
    const { id } = req.params
    const campgrounds = await campground.findById(id)
    const review = new Review(req.body.review)
    review.author = req.user._id
    campgrounds.reviews.push(review)
    await review.save()
    await campgrounds.save()
    req.flash('sucess', 'successfully created a review!!!')
    res.redirect(`/campground/${campgrounds._id}`)
}

module.exports.deleteReviews = async (req, res) => {
    const { id, reviewId } = req.params
    await campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId)
    req.flash('sucess', 'sucessfully deleted review!!!')
    res.redirect(`/campground/${id}`)
}