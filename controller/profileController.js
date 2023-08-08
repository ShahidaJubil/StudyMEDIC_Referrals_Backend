const uploadProfile = require("../model/model");
const ImageModel=require("../model/ImageModel")
const multer = require("multer");
const express = require("express");
const app = express();
app.use("/uploads", express.static("uploads"));

const Storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({
  storage: Storage,
}).single("image");


const refer = async (req, res) => {
  const {
    fname1,
    lname2,
    name,
    course,
    contact,
    duration
  } = req.body;
  upload(req, res, (err) => {
    if (err) {
      console.log(err);
    } else {
      const profile = new ImageModel({
        refer:{
         
        lname2:req.body.lname2, 
        email: req.body.email,
        contact: req.body.contact,
        
        course:req.body.course,
        duration:req.body.duration
      },
      location: req.body.location,
      fname1: req.body.fname1,
      });

      profile.save();
      res.json(profile);
    }
  });
};

const postProfile = async (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.log(err);
    } else {
      const profile = new uploadProfile({
        fname: req.body.fname,  
        lname: req.body.lname, 
        email: req.body.email,
        contact: req.body.contact,
        course: req.body.course,
        duration: req.body.duration,
        contact: req.body.contact,
        location: req.body.location,
        
      });

      profile.save();
      res.json(profile);
    }
  });
};

const putProfile = async (req, res) => {
  try {
    const check = await uploadProfile.findByIdAndUpdate(req.params.id);
    check.name = req.body.name;
    check.title = req.body.title;
    check.contact = req.body.contact;
    (check.location = req.body.location),
    (check.contact = req.body.contact);
    check.course = req.body.course;
    const a3 = await check.save();
    res.json(a3);
  } catch (error) {
    res.send(error);
  }
};


const getProfile = async (req, res) => {
  try {
    const details = await uploadProfile.find();
    res.json(details);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const geteachProfile = async (req, res) => {
  try {
    const details = await uploadProfile.findById(req.params.id);
    // console.log("idp", req.params.id);
    // console.log("details", details);
    res.status(200).json(details);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const getUserProfile = async (req, res) => {
  try {
    const { proId } = req.body;
    const userProfile = await uploadProfile.findById(proId);
    console.log("idp", proId);
    console.log("userP",userProfile);
    res.status(200).json(userProfile);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

module.exports = {
  postProfile,
  putProfile,
  geteachProfile,
  getProfile,
  getUserProfile,
  refer
};
