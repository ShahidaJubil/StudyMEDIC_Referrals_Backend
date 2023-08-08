const express = require("express");
const router = express.Router();
const User = require("../model/ImageModel");

const {
  RegisterUser,
  LoginUser,
  DeleteUser,
  GetUser,
  PutUser,
  postReferDetails,
  getReferDetails,
  postReferral,
  successReferrals,
  getAllReferrals,
  ForgotPassword,
  ChangePassword,
  updateReferralStatus,
  getUpdatedReferralStatus,
  putReferral,
} = require("../controller/user");


router.post("/signup", RegisterUser);
router.post("/login", LoginUser);
router.delete("/user/delete/:id", DeleteUser);
router.get("/get/:id", GetUser);


router.post('/profiles/:userId/referrals', postReferral);
router.post('/post/success/:userId',successReferrals)


// Route to get the referral details of all users
router.get('/admin/referrals', getAllReferrals);
router.post("/forgot-password",ChangePassword)


// PUT route to update referral status
router.put('/users/:userId/referrals/:referralId',putReferral)
// router.put('/:userId/referrals/:referralId/status', updateReferralStatus);
// router.get('/api/:userId/referrals/:referralId/status',getUpdatedReferralStatus)

module.exports = router;
