const campground = require('../models/campground')

const { cloudinary } = require('../cloudinary')

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const mapBoxToken = process.env.MAPBOX_TOKEN
const geocoder = mbxGeocoding({ accessToken: mapBoxToken })

module.exports.index = async (req, res) => {
    const campgrounds = await campground.find({})
    res.render('campgrounds/index.ejs', { campgrounds })
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new.ejs')
}

module.exports.creatCampground = async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    // res.send(geoData.body.features[0].geometry.coordinates)
    // if (!req.body.campground) throw new ExpressError('invalid campground data', 400)
    const newCamp = new campground(req.body.campground)
    newCamp.geometry = geoData.body.features[0].geometry
    newCamp.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    newCamp.author = req.user._id
    await newCamp.save()
    // console.log(campgrounds.geometry.coordinates)
    // console.log(newCamp)
    req.flash('sucess', 'successfully created a new campground!!!')
    res.redirect(`/campground/${newCamp._id}`)
}

module.exports.showCampground = async (req, res) => {
    const { id } = req.params
    const campgrounds = await campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author')
    // console.log(campgrounds)
    if (!campgrounds) {
        req.flash('error', 'cannot find campground')
        res.redirect('/campground')
    }
    res.render('campgrounds/show.ejs', { campgrounds })
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params
    const campgrounds = await campground.findById(id)
    if (!campgrounds) {
        req.flash('error', ' cannot find campground')
        res.redirect('/campground')
    }
    res.render('campgrounds/edit.ejs', { campgrounds })
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    // console.log(req.body)
    const campgrounds = await campground.findByIdAndUpdate(id, { ...req.body.campground })
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campgrounds.images.push(...imgs)
    await campgrounds.save()
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campgrounds.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('sucess', 'successfully edited a campground!!!')
    res.redirect(`/campground/${campgrounds._id}`)
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params
    await campground.findByIdAndDelete(id)
    req.flash('sucess', 'successfully deleted campground!!!')
    res.redirect('/campground')
}