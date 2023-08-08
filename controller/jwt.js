const jwt = require("jsonwebtoken");

// Generate JWT token
function generateToken(user) {
  const token = jwt.sign(
    { id: user.id, email: user.email },
    "your-secret-key",
    { expiresIn: "1h" }
  );
  return token;
}

// Verify JWT token
function verifyToken(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(401).send({ auth: false, message: "No token provided." });
  }

  jwt.verify(token, "your-secret-key", function (err, decoded) {
    if (err) {
      return res
        .status(500)
        .send({ auth: false, message: "Failed to authenticate token." });
    }

    req.userId = decoded.id;
    next();
  });
}

module.exports = { generateToken, verifyToken };

// const JWT = require("../model/jwt");

// exports.jwtSignup = async (req, res, next) => {
//   const { email } = req.body;
//   const userExist = await JWT.findOne({ email });
//   if (userExist) {
//     return next("Email already registered", 400);
//   }
//   try {
//     const user = await JWT.create(req.body);
//     res.status(200).json({
//       success: true,
//       user,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// exports.jwtSignin = async (req, res, next) => {
//   try {
//     const { email, password } = req.body;

//     if (!email) {
//       return next("Add email");
//     }
//     if (!password) {
//       return next("Add password");
//     }

//     const user = await JWT.findOne({ email });
//     if (!user) {
//       return next("Invalid credentials");
//     }
//     const isMatched = await user.comparePassword(password);
//     if (!isMatched) {
//       return next("Invalid credentials");
//     }
//     sendTokenResponse(user, 200, res);
//   } catch (error) {
//     next(error);
//   }
// };

// const sendTokenResponse = async (user,codeStatus, res) => {
//   const token = await user.getJwtToken();
//   res
//     .status(codeStatus)
//     .cookie("token", token, { maxAge: 60 * 60 * 1000, httponly: true })
//     .json({ success: true, token, user });
// };

// exports.logout=async(req,res,next)=>{
//     res.clearCookie('token')
//     res.status(200).json({
//         success:true,
//         message:"logged out"
//     })
// }

// exports.userProfile=async(req,res,next)=>{
//     const user=await JWT.findById(req.user.id).select('-password')
//     res.status(200).json({
//         success:true,
//         user
//     })
// }
