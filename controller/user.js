const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const User = require("../model/ImageModel");
const createError = require("http-errors");
const cookieParser = require("cookie-parser");
const JWT = require("./jwt");
const { generateUniqueId } = require("../utils"); 
const mongoose = require("mongoose");
const { updateExcelSheet } = require("./Excel");
const path = require('path');




const isAuth = (req, res, next) => {
  if (req.session.isAuth) {
    next();
  } else {
    res.redirect("/login");
  }
};

const RegisterUser = asyncHandler(async (req, res) => {
  const {
    email,
    password,
    fname,
    lname,
    specialization,
    experience,
    phone,
    location,
  } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Please add all fields" });
    return;
  }
  const userExist = await User.findOne({ email: req.body.email });
  if (userExist) {
    res.status(409).json({ message: "This email is already registered" });
    return;
  }
  const salt = await bcrypt.genSalt(10);

  const hashedPassword = await bcrypt.hash(password, salt);

  try {
    const user = new User({
      email,
      password: hashedPassword,
      fname,
      lname,
      location,
      specialization,
      experience,
      phone,
      role: "mentor", // Assigning the role
    });

    const savedUser = await user.save();

    const referralLink = generateReferralLink(savedUser._id);

    // Save the referral link in the user's account details in the database
    savedUser.referralLink = referralLink;
    await savedUser.save();

    res.status(200).json({ savedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const LoginUser = asyncHandler(async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Email doesn't exists!" });
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = JWT.generateToken(user);
      const fname = user.fname;
      const lname = user.lname;
      const user_id = user._id;
      const prof_id = user.profileId;
      const role = user.role;
      res.json({ success: true, token, fname, prof_id, role, user_id, lname });
    } else {
      return res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (err) {
    return next(createError(500, err.message));
  }
});

// POST route to handle the "Forgot Password" request
const ChangePassword = asyncHandler(async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    // Check if the email exists in the database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email not found" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password with the new hashed password
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Generating a referral link
function generateReferralLink(userId) {
  const uniqueId = generateUniqueId(); // Implement this function to generate a unique identifier
  return `http://localhost:3000/refer/${userId}/${uniqueId}`;
}

const DeleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Delete the user by their ID
    await User.findByIdAndRemove(userId);
    console.log("Deleted User.");

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
};
// Get user details
const GetUser = async (req, res) => {
  const userId = req.params.id;

  // Validate userId
  if (!userId || !mongoose.isValidObjectId(userId)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  try {
    // Find the user by their ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    console.log("USER_____________:",user);
    // Return the user details
    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
};

const PutUser = async (req, res) => {
  const userId = req.params.id;
  const updatedData = req.body;

  try {
    // Find the user by their ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update the user details
    user.email = updatedData.email || user.email;
    user.fname = updatedData.fname || user.fname;
    user.lname = updatedData.lname || user.lname;
    user.specialization = updatedData.specialization || user.specialization;
    user.experience = updatedData.experience || user.experience;
    user.phone = updatedData.phone || user.phone;

    // Save the updated user
    const updatedUser = await user.save();

    // Return the updated user details
    res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
};

const postReferral = async (req, res) => {
  const userId = req.params.userId;
  // console.log("REQUEST :...................",req.body);

  try {
    // Find the user profile by user ID
    const userProfile = await User.findById(userId);

    if (!userProfile) {
      return res.status(404).json({ message: "User profile not found" });
    }

    // Create a new referral object from the request body
    const newReferral = {
      remail: req.body.remail,
      rlname: req.body.rlname,
      rfname: req.body.rfname,
      rcontact: req.body.rcontact,
      rlocation: req.body.rlocation,
      rcourse: req.body.rcourse,
      rduration: req.body.rduration,
      rstatus: req.body.rstatus,
    };

    // Add the new referral to the user's refers array
    userProfile.refers.push(newReferral);

    // Save the updated user profile
    const updatedProfile = await userProfile.save();

    // Call updateExcelSheet to update the Excel file
    // const existingExcelFilePath =
    //   "C:\\Users\\shahi\\Documents\\studyMEDIC\\Referal Portar\\Referral-Portal.xlsx";
  
    
    const existingExcelFilePath = path.join(__dirname, 'Referral-Portal.xlsx');
    console.log("path",existingExcelFilePath);
    // const existingExcelFilePath ="https://docs.google.com/spreadsheets/d/1pkdurkl16lwXRJBrncxHdcNNz23scHztl-RhFWRkvZ8/edit?usp=sharing"
    
    const updatedExcelFilePath = await updateExcelSheet(
      existingExcelFilePath,
      // userProfile.refers
      newReferral
    );

    // Check if the Excel update was successful
    if (!updatedExcelFilePath) {
      return res.status(500).json({ message: "Failed to update Excel file" });
    }

    // Send the updated Excel file path as a response
    res.status(200).json({ updatedExcelFilePath });
  } catch (error) {
    console.error(error);

    // Check for specific error types and send appropriate responses
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Validation error in request data" });
    } else if (error.name === "MongoError" && error.code === 11000) {
      return res.status(409).json({ message: "Duplicate key error" });
    }

    // For all other errors, send a generic server error response
    res.status(500).json({ message: "Server error" });
  }
};

// const postReferral = async (req, res) => {
//   const userId = req.params.userId;

//   try {
//     // Find the user profile by user ID
//     const userProfile = await User.findById(userId);

//     if (!userProfile) {
//       return res.status(404).json({ message: "User profile not found" });
//     }

//     // Create a new referral object from the request body
//     const newReferral = {
//       remail: req.body.remail,
//       rlname: req.body.rlname,
//       rfname: req.body.rfname,
//       rcontact: req.body.rcontact,
//       rlocation: req.body.rlocation,
//       rcourse: req.body.rcourse,
//       rduration: req.body.rduration,
//       rstatus: req.body.rstatus,
//     };

//     // Add the new referral to the user's refers array
//     userProfile.refers.push(newReferral);

//     // Save the updated user profile
//     const updatedProfile = await userProfile.save();

//     // Call updateExcelSheet to update the Excel file
//     const existingExcelFilePath =
//       "C:\\Users\\shahi\\Documents\\studyMEDIC\\Referal Portar\\Referral-Portal.xlsx";
//     const updatedExcelFilePath = updateExcelSheet(
//       existingExcelFilePath,
//       userProfile.refers
//     );

//     // Send the updated Excel file path as a response
//     res.status(201).json({ updatedExcelFilePath });

//     // No need to send the userProfile as a response, as it's already saved in the Excel file
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

const putReferral = async (req, res) => {
  const userId = req.params.userId;
  const referralId = req.params.referralId;

  try {
    // Find the user profile by user ID
    const userProfile = await User.findById(userId);

    if (!userProfile) {
      return res.status(404).json({ message: "User profile not found" });
    }

    // Find the referral within the user's refers array
    const referralIndex = userProfile.refers.findIndex(
      (referral) => referral._id.toString() === referralId
    );

    if (referralIndex === -1) {
      return res.status(404).json({ message: "Referral not found" });
    }

    // Update the referral with the new data from the request body
    userProfile.refers[referralIndex].remail = req.body.remail;
    userProfile.refers[referralIndex].rlname = req.body.rlname;
    userProfile.refers[referralIndex].rfname = req.body.rfname;
    userProfile.refers[referralIndex].rcontact = req.body.rcontact;
    userProfile.refers[referralIndex].rlocation = req.body.rlocation;
    userProfile.refers[referralIndex].rcourse = req.body.rcourse;
    userProfile.refers[referralIndex].rduration = req.body.rduration;
    userProfile.refers[referralIndex].rstatus = req.body.rstatus;

    // Save the updated user profile
    await userProfile.save();

    return res.json({ message: "Referral updated successfully" });
  } catch (error) {
    console.log("error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const successReferrals = async (req, res) => {
  const userId = req.params.userId;

  try {
    // Find the user profile by user ID
    const userProfile = await User.findById(userId);

    if (!userProfile) {
      return res.status(404).json({ message: "User profile not found" });
    }

    // Create a new referral object from the request body
    const successReferral = {
      slname: req.body.slname,
      sfname: req.body.sfname,
      scourse: req.body.scourse,
      srduration: req.body.srduration,
      points: req.body.points,
    };

    // Add the new referral to the user's refers array
    userProfile.successReferrals.push(successReferral);

    // Save the updated user profile
    const updatedProfile = await userProfile.save();

    res.status(201).json(updatedProfile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Route to get the referral details of all users
const getAllReferrals = async (req, res) => {
  try {
    // Find all users in the database
    const allUsers = await User.find({});

    // Create an array to store the referral details of all users
    const allReferrals = [];

    // Iterate through each user to retrieve their referral details
    for (const user of allUsers) {
      // Retrieve the user's referral details
      const referralDetails = {
        userId: user._id,
        fname: user.fname,
        lname: user.lname,
        refers: user.refers,
      };

      // Add the referral details to the array
      allReferrals.push(referralDetails);
    }

    // Return the array of all referral details
    res.status(200).json({ allReferrals });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// const updateReferralStatus = async (req, res) => {
//   const userId = req.params.userId;
//   const referralId = req.params.referralId;
//   const { status } = req.body;

//   try {
//     // Find the user profile by user ID
//     const userProfile = await User.findById(userId);

//     if (!userProfile) {
//       return res.status(404).json({ message: "User profile not found" });
//     }

//     // Find the specific referral by its ID
//     const referral = userProfile.refers.find((ref) => ref._id.toString() === referralId);

//     if (!referral) {
//       return res.status(404).json({ message: "Referral not found" });
//     }

//     // Update the status of the referral
//     referral.status = status;

//     // Save the updated user profile
//     await userProfile.save();

//     // Now, update the referral status for this referral in the `refers` array of every user
//     const allUsers = await User.find({});

//     for (const user of allUsers) {
//       // Find the referral by its ID in the `refers` array of the current user
//       const userReferral = user.refers.find((ref) => ref._id.toString() === referralId);

//       if (userReferral) {
//         // If the referral is found, update its status
//         userReferral.status = status;
//         await user.save();
//       }
//     }

//     res.status(200).json({ message: "Referral status updated successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // user.js (controller)

// const getUpdatedReferralStatus = async (req, res) => {
//   const userId = req.params.userId;
//   const referralId = req.params.referralId;

//   try {
//     // Find the user profile by user ID
//     const userProfile = await User.findById(userId);

//     if (!userProfile) {
//       return res.status(404).json({ message: "User profile not found" });
//     }

//     // Find the specific referral by its ID
//     const referral = userProfile.refers.find((ref) => ref._id.toString() === referralId);

//     if (!referral) {
//       return res.status(404).json({ message: "Referral not found" });
//     }

//     // Return the updated status of the referral
//     res.status(200).json({ status: referral.status });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

module.exports = {
  RegisterUser,
  LoginUser,
  DeleteUser,
  GetUser,
  PutUser,
  postReferral,
  successReferrals,
  getAllReferrals,
  ChangePassword,
  putReferral,
  // updateReferralStatus,
  // getUpdatedReferralStatus
};
