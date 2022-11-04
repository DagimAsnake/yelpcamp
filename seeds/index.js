const mongoose = require('mongoose')
const campground = require('../models/campground')
const cities = require('./cities')

const { descriptors, places } = require('./seedHelpers')

mongoose.connect('mongodb://localhost:27017/yelp-camp', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Database is Connected')
    })
    .catch(err => {
        console.log('this is error')
        console.log(err)
    })

const samp = array => array[Math.floor(Math.random() * array.length)]

const seedDb = async () => {
    await campground.deleteMany({})
    for (let i = 0; i < 50; i++) {
        const rand1000 = Math.floor(Math.random() * 1000)
        const price = Math.floor((Math.random() * 20)) + 10
        const c = new campground({
            author: '62d297c597ab04fb179a6428',
            location: `${cities[rand1000].city}, ${cities[rand1000].state}`,
            title: `${samp(descriptors)} ${samp(places)}`,
            description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Officia possimus iure corporis facilis minus neque beatae! Tempora eaque ipsum temporibus, impedit ullam exercitationem quibusdam inventore ducimus laboriosam necessitatibus, quam expedita!',
            price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[rand1000].longitude,
                    cities[rand1000].latitude
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dgqqgf57c/image/upload/v1658386519/yelpcamp/ymbi2idpm1ropcjboxdc.jpg',
                    filename: 'yelpcamp/ymbi2idpm1ropcjboxdc'
                },
                {
                    url: 'https://res.cloudinary.com/dgqqgf57c/image/upload/v1658305669/yelpcamp/aufipgyghmkqhp40mi7v.jpg',
                    filename: 'yelpcamp/aufipgyghmkqhp40mi7v'
                }
            ]
        })
        await c.save()
    }

}

seedDb().then(() => {
    mongoose.connection.close()
})