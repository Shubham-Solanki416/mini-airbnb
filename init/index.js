const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const initData = require("./data.js");

async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust")
}

main().then((res)=>{
    console.log("connected to DB");
}).catch(err=>{console.log(err)});

const initDB = async()=>{
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj)=>({...obj,owner:'67d50942b9fbd82da43a509f'}));
    await Listing.insertMany(initData.data);
    console.log("data initialized successfully");
}

initDB();