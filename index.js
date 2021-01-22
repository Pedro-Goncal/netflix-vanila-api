const express = require("express");
const app = express();

require("dotenv").config();

//cors
const cors = require("cors");

//Mongoose
const mongoose = require("mongoose");
const { Schema } = mongoose;

//Json Web Tokken
const jwt = require("jsonwebtoken");

const PORT = process.env.PORT || 4001;

mongoose
  .connect(process.env.MONGO_DB, {
    useCreateIndex: true,
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => console.log("mongoDB connected!"))
  .catch((err) => console.log(err));

const User = mongoose.model(
  "Users",
  new Schema({
    name: String,
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  })
);

//npm install cors --save
app.use(cors());

//Parse all data coming into the app
app.use(express.json());

//=========================
//MIDDLEWARE FUNCTIONS
//========================

function generateAccessToken(user) {
  const payload = {
    id: user.id,
    name: user.name,
  };
  return jwt.sign(payload, "asdfghjkl7536951", { expiresIn: "7200s" });
}

function authenticateToken(req, res, next) {
  const authHeaderToken = req.headers["authorization"];
  if (!authHeaderToken) return res.sendStatus(401);

  jwt.verify(authHeaderToken, process.env.TOKEN_SECRET, (err, user) => {
    console.log(err);
    if (err) return res.sendStatus(403);

    req.user = user;
    next();
  });
}

//==============================
//==============================

//GET
app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/wishlist", authenticateToken, (req, res) => {
  console.log("I am Authenticatted");
  // WishList.findOne({user: user.id}, )
  res.send({
    items: ["clockwork Orange", "Full Metal Jacket", "The Shining"],
  });
});

//Register User
app.post("/register", (req, res) => {
  const newUser = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });

  newUser.save((err, user) => {
    if (err) {
      console.log(err);
      res.send(400, {
        status: err,
      });
    } else {
      res.send({
        status: "registered",
      });
    }
  });
});

//Check If user is valid
app.post("/login", (req, res) => {
  const password = req.body.password;
  const email = req.body.email;

  User.findOne({ email: email, password: password }, (err, user) => {
    if (user) {
      const token = generateAccessToken(user);

      res.send(200, {
        status: "valid",
        token: token,
      });
    } else {
      res.send(404, {
        status: "Not Found",
      });
    }
  });
});

app.listen(PORT, () => console.log("listening on http://localhost:4001"));

//npm install mongoose
//npm install cors
//npm install express
//npm install nodemon
//npm install jsonwebtoken
