const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const router = express.Router();

// Start Google OAuth login flow
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "consent", // 🔹 Forces Google to ask every time
  })
);

// Google OAuth callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "https://zidio-manager.vercel.app/login",
  }),
  (req, res) => {
    // Generate JWT token
    const token = jwt.sign(
      { id: req.user.id, name:req.user.name, profilePicture:req.user.profilePicture, email: req.user.email },
      process.env.JWT_SECRET||'fkdjfkdhfkdhfidkhfkdhfdkfhdkfhieuhckbckdjchfodh',
      { expiresIn: "7d" } // Token expires in 7 days
    );
    
    // Set token in secure HTTP-only cookie
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    res.redirect("https://zidio-manager.vercel.app/"); // ✅ Ensure frontend matches this
  }
);

// Logout route (✅ Fix for Express 4.0+)
router.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) return next(err);
    req.session.destroy(() => {
      res.clearCookie("connect.sid"); // ✅ Clears session cookie
      res.clearCookie("auth_token"); // ✅ Also clear auth token
      res.redirect("https://zidio-manager.vercel.app/");
    });
  });
});

// Get current user session and send user details
router.get("/user", (req, res) => {
  if (req.user) {
    res.json({
      success: true,
      user: req.user, // ✅ Send user details
    });
    localStorage.setItem(user);
  } else {
    res.json({ success: false, user: null });
  }
});

module.exports = router;