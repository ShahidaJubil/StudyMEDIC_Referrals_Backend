const mongoose = require("mongoose");

const apiModel = new mongoose.Schema({
  email: {
    type: String,
    required: false,
    match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
  },
  lname: {
    type: String,
    required: false,
  },
  fname: {
    type: String,
  },
    contact: {
      type: Number,
      required: false,
    },

    location: {
      type: String,
    },
    course:{
      type:String
    },
    duration:{
      type:String
    }
});

module.exports = mongoose.model("users", apiModel);
