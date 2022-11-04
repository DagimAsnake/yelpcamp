if (process.env.NODE_ENV != 'production') {
    require('dotenv').config()
}

// require('dotenv').config()

// console.log(process.env.CLOUDINARY_CLOUD_NAME)

const express = require('express')
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')
const catchAsync = require('./utils/catchAsync')
const session = require('express-session')
const flash = require('connect-flash')
const ExpressError = require('./utils/ExpressError')
const joi = require('joi')
const { campgroundSchema, reviewSchema } = require('./schemas.js')
const path = require('path')
const methodOverride = require('method-override')
const campground = require('./models/campground')
const Joi = require('joi')
const Review = require('./models/review')
const User = require('./models/user')
const passport = require('passport')
const passportLocal = require('passport-local')

const helmet = require("helmet");

const mongoSanitize = require('express-mongo-sanitize');

const userRouter = require('./routes/user')
const campgroundRouter = require('./routes/campground')
const reviewRouter = require('./routes/review')

const MongoStore = require('connect-mongo')

const dbUrl = 'mongodb://localhost:27017/yelp-camp'
// const dbUrl = process.env.DB_URL
mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Database is Connected')
    })
    .catch(err => {
        console.log('this is error')
        console.log(err)
    })

const app = express()

app.engine('ejs', ejsMate)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))



const store = MongoStore.create({
    mongoUrl: dbUrl,
    secret: 'thisisthesecret',
    touchAfter: 24 * 60 * 60
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})



const sessionConfig = {
    store,
    name: 'session',
    secret: 'thisisthesecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig))
app.use(flash())
app.use(helmet());


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",

    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",

    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",

    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",

    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",

    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",

    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dgqqgf57c/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


app.use(passport.initialize())
app.use(passport.session())
app.use(mongoSanitize(
    {
        replaceWith: '_'
    }
))

passport.use(new passportLocal(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
    // if (!['/login', '/register', '/'].includes(req.originalUrl)) {
    //     console.log(req.originalUrl);
    //     req.session.returnTo = req.originalUrl;
    //     console.log(req.session.returnTo);
    // }
    // console.log(req.query)
    res.locals.currentUser = req.user
    res.locals.success = req.flash('sucess')
    res.locals.error = req.flash('error')
    next()
})

app.use('/', userRouter)
app.use('/campground', campgroundRouter)
app.use('/campground/:id/reviews', reviewRouter)

app.get('/', (req, res) => {
    res.render('home.ejs')
})

app.all('*', (req, res, next) => {
    next(new ExpressError('Page is NOT Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err
    if (!err.message) err.message = 'something is wrong'
    res.status(statusCode).render('error.ejs', { err })
})

app.listen(3000, () => {
    console.log('this is port 3000!!!!')
})





