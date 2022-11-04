// const campgrounds = require('../../models/campground')
// const mapToken = '<%-process.env.MAPBOX_TOKEN%>'

mapboxgl.accessToken = 'pk.eyJ1IjoiZGFnZ3k5OTkiLCJhIjoiY2w1cnk2Nzd3MDF3dDNqcDM5bmpuMmxhbiJ9.l2aEvc25WazHwqD00dt4qA'
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v10', // stylesheet location
    center: campgrounds.geometry.coordinates, // starting position [lng, lat]
    zoom: 10 // starting zoom
});

map.addControl(new mapboxgl.NavigationControl());

new mapboxgl.Marker()
    .setLngLat(campgrounds.geometry.coordinates)
    // .setPopup(
    //     new mapboxgl.Popup({ offset: 25 })
    //         .setHTML(
    //             `<h3>${campgrounds.title}</h3><p>${campgrounds.location}</p>`
    //         )
    // )
    .addTo(map)


    // [-3.703583, 40.416705]
    // campgrounds.geometry.coordinates