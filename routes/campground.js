const express = require('express')
const router = express.Router()

const campground = require('../models/campground')
const { campgroundSchema } = require('../schemas.js')
const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')
const { isLoggedin, isAuthor, ValidateCampground } = require('../middleware')

const campgrounds = require('../controllers/campground')

const multer = require('multer')
const { storage } = require('../cloudinary')
const upload = multer({ storage })

router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedin, upload.array('image'), ValidateCampground, catchAsync(campgrounds.creatCampground))
// .post(upload.array('image'), (req, res) => {
//     console.log(req.body, req.files)
//     res.send('it worked')
// })

router.get('/new', isLoggedin, campgrounds.renderNewForm)

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedin, isAuthor, upload.array('image'), ValidateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedin, isAuthor, catchAsync(campgrounds.deleteCampground))

router.get('/:id/edit', isLoggedin, isAuthor, catchAsync(campgrounds.renderEditForm))


module.exports = router