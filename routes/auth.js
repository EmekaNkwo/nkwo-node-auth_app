const router = require("express").Router();
const User = require("../model/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const { validateRegister, validateLogin } = require("../validation");

router.post("/register", validateRegister, async (req, res) => {
  //checking if an email exists in db
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) return res.status(400).send("Email already exists");

  //Hashing Passwords
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  const user = new User({
    email: req.body.email,
    password: hashedPassword,
  });

  try {
    const savedUser = await user.save();

    res.send(savedUser);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

//Login
router.post("/login", validateLogin, async (req, res) => {
  //checking if an email exists
  const userExist = await User.findOne({ email: req.body.email });
  if (!userExist) return res.status(400).send("Email does not exist");

  //checking if password is correct
  const validPass = await bcrypt.compare(req.body.password, userExist.password);
  if (!validPass) return res.status(400).send("Invalid Password");

  //Token Assigning
  const token = jwt.sign({ _id: userExist._id }, process.env.TOKEN_SECRET);
  res.header("auth-token", token).send(token);
});

module.exports = router;
