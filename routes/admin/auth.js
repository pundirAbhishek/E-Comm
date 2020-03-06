const express = require("express"),
  usersRepo = require("../../repositories/users"),
  { validationResult } = require("express-validator"); // Middleware for form validation and sanitization

const {
  requireEmail,
  requirePassword,
  requirePasswordConfirmation,
  requireEmailExists,
  requireValidPasswordForUser
} = require("./validator");

const router = express.Router();

router.get("/signup", (req, res) => {
  res.render("./admin/auth/signup", { err: undefined });
});

router.post(
  "/signup",
  // email, password, passwordConfirmation -> properties inside req.body
  // Express-validator automatically lookes for these properties
  [requireEmail, requirePassword, requirePasswordConfirmation],

  async (req, res) => {
    // // Since the network sends the info bit by bit(in packets)
    // // req emits a data event every time it receives a bit of data
    // // data -> return a Buffer
    // // data.toString('utf8') -> Take the buffer input and convert it into a string which is encoded in utf8 format
    // req.on('data', (data) => {
    //     console.log(data.toString('utf8'));
    // });

    // req.body -> Added by body parser


    const errors = validationResult(req);

    console.log(errors);

    if (!errors.isEmpty()) {
      return res.render("./admin/auth/signup", {
        err: errors,
        getError: getError
      });
    }

    const { email, password } = req.body;

    // Create a user in our user repo to represent this person
    const user = await usersRepo.create({ email, password });

    // Store the id of that user inside the users cookie

    // Adding a new property of userId in seesions object
    req.session.userId = user.id; // req.session -> Added By cookie session

    res.send("Signed Up");
  }
);

router.get("/login", (req, res) => {
  res.render("./admin/auth/login");
});

router.post(
  "/login",
  [requireEmailExists, requireValidPasswordForUser],
  async (req, res) => {
    const { email } = req.body;

    const errors = validationResult(req);
    console.log(errors);

    const user = await usersRepo.getOneBy({ email });

    req.session.userId = user.id;

    res.send("Signed In");
  }
);

router.get("/logout", (req, res) => {
  req.session = null; // Delete the current session of the user
  res.send("Logged Out");
});

const getError = (errors, prop) => {
  try {
    return errors.mapped()[prop].msg; //.mapped() -> converts array into objects
  } catch (err) {
    return "";
  }
};

module.exports = router;
