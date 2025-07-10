const Listing = require("../models/listing.js");
const mbxgeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
let maptoken = process.env.MAP_TOKEN;
const geocodingClient = mbxgeocoding({ accessToken: maptoken });

module.exports.index = async(req,res)=>{
    let allListings = await Listing.find({});
    res.render("Listings/index.ejs",{allListings});
}

module.exports.category = async (req, res) => {
        let { category } = req.params;
        console.log(category);

        // If not an ObjectId, search by category name instead
        let allListings = await Listing.find({ category: category });

        if (allListings.length === 0) {
            return res.status(404).send("No listings found for this category");
        }

        console.log(allListings);
        res.render("Listings/category.ejs",{allListings,category});
};

module.exports.searchListings = async(req,res)=>{
    let {country} = req.params;
    console.log(country);

    let allListings = await Listing.find({country:country});

    if (allListings.length === 0) {
        return res.status(404).send("No listings found for this search");
    }

    console.log(allListings);
    res.render("Listings/search.ejs",{allListings,country});
}

module.exports.renderNewForm = (req,res)=>{
    res.render("Listings/new.ejs");
}

module.exports.showListing = async(req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id).populate({path:"reviews",
        populate:{
            path: "author"
        },
    }).populate("owner");
    if(!listing){
        req.flash("error","Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    res.render("Listings/show.ejs",{listing});
}   

module.exports.createListing = async(req,res)=>{
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 2
      })
    .send();

    let url = req.file.path;
    let filename = req.file.filename;
    let newListing = new Listing(req.body.listing);
    console.log(req.user);
    newListing.owner = req.user._id;
    newListing.image = {url,filename};
    newListing.geometry = response.body.features[0].geometry;
    let savedListing = await newListing.save();
    console.log(savedListing);
    req.flash("success","New Listing Created!");
    res.redirect("/listings");
}

module.exports.renderEditForm = async(req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested for does not exist!");
        res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250");
    res.render("Listings/edit.ejs",{listing,originalImageUrl});
}

module.exports.updateListing = async(req,res)=>{
    let {id} = req.params;
    console.log(req.body.listing);
    let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});

    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        console.log(`url:${url} , filename: ${filename}`);
        listing.image = {url, filename};
        await listing.save();
    }
    req.flash("success","Listing Updated!");
    res.redirect(`/listings/${id}`);
}

module.exports.destroyListing = async(req,res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","Listing Deleted!");
    res.redirect("/listings");
}

