const express = require('express')
const router = express.Router({ mergeParams: true })

const campground = require('../models/campground')
const Review = require('../models/review')
const { reviewSchema } = require('../schemas.js')

const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')

const { ValidateReview, isLoggedin, isReviewAuthor } = require('../middleware')

const reviews = require('../controllers/review')


router.post('/', isLoggedin, ValidateReview, catchAsync(reviews.creatReviews))

router.delete('/:reviewId', isLoggedin, isReviewAuthor, catchAsync(reviews.deleteReviews))

module.exports = router