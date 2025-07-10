const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

module.exports.createReview = async(req,res)=>{
    console.log(req.params, req.body);
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    let {id} = req.params;
    newReview.author = req.user._id;
    listing.reviews.push(newReview);
    console.log(newReview);
    
    await newReview.save();
    await listing.save();

    console.log("new review saved");
    req.flash("success","Review Created!");
    res.redirect(`/listings/${id}`);
}

module.exports.destroyReview = async(req,res)=>{
    let {id,reviewId} = req.params;

    await Review.findByIdAndDelete(reviewId);
    await Listing.findByIdAndUpdate(id,{$pull:{reviews: reviewId}});

    req.flash("success","Review Deleted!");
    res.redirect(`/listings/${id}`);
}