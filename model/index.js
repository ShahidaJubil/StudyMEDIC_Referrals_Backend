const express = require("express");
const mongoose = require("mongoose");
const router = require("./routes/router");
const PasswordRouter = require("./controller/PasswordReset");
const imgRouter=require("./routes/Image")
const app = express();
const cors = require("cors");
require("dotenv").config();
const session = require("express-session");
const cookieParser = require("cookie-parser");




app.use((req, res, next) => {
    res.setHeader(
        "Access-Control-Allow-Origin",
        "*"
    );
    res.setHeader("Access-Control-Allow-Credentials", true);
    res.setHeader("Access-Control-Allow-Methods", [
        "PATCH",
        "POST",
        "GET",
        "DELETE",
        "PUT",
    ]);
    res.setHeader("Access-Control-Allow-Headers", ["Content-Type"]);
    res.setHeader("Access-Control-Expose-Headers", ["Content-Type"]);
    next();
});

app.use(cors());

app.use(express.json());
app.use(cookieParser());

const MongoDBStore = require("connect-mongodb-session")(session);


const morgan = require("morgan");
const bodyParser = require("body-parser");
app.use(morgan("dev"));

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
// app.use(express.json());

app.use("/api", router);
app.use("/api", PasswordRouter);
app.use("/api", imgRouter);

// app.use(JWT);
// app.use(verifyJWT);


mongoose.connect(process.env.DB, {
  useNewUrlParser: true,
});
const con = mongoose.connection;

con.on("open", () => {
  
  console.log("DB Connected");
});

const store = new MongoDBStore({
    uri: process.env.DB,
    collection: "mySessions",
  });
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
    store: store,
    // cookie: {
    //   httpOnly: true,
    //   secure: true,
    //   maxAge: 3600 * 1000, // Set an expiration time of 1 hour
    // },
  })
);



app.listen(process.env.PORT, () => {
  console.log("Server running on :", process.env.PORT);
});
