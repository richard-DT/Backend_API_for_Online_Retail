const User = require('../models/User');
const bcrypt = require('bcryptjs');
const auth = require('../auth');
const { errorHandler } = require("../auth");


// 1. User Registration
module.exports.registerUser = (req, res) => {
  const { firstName, lastName, email, mobileNo, password } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: "Email invalid" });
  }

  if (!mobileNo || typeof mobileNo !== 'string' || mobileNo.length !== 11) {
    return res.status(400).json({ error: 'Mobile number invalid' });
  }

  if (!password || password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  if (!firstName || typeof firstName !== 'string' ||
      !lastName || typeof lastName !== 'string') {
    return res.status(400).json({ message: 'Check the details and try again' });
  }

  User.findOne({ email })
    .then(existingUser => {
      if (existingUser) {
        return res.status(409).json({ message: "Email already registered" });
      }

      const newUser = new User({
        firstName,
        lastName,
        email,
        mobileNo,
        password: bcrypt.hashSync(password, 10)
      });

      return newUser.save();
    })
    .then(savedUser => {
      if (!savedUser) return;
      const userObj = savedUser.toObject();
      delete userObj.password;
      return res.status(201).json({
        message: 'Registered successfully',
        user: userObj
      });
    })
    .catch(err => errorHandler(err, req, res));
};

// 2. User Authentication
module.exports.loginUser = (req, res) => {
  const { email, password } = req.body;

  // Validate email format
  if (!email || !email.includes('@')) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  // Find the user by email
  User.findOne({ email })
    .then(user => {
      if (!user) {
        return res.status(404).json({ message: 'Email not found' });
      }

      // Compare password
      const isPasswordCorrect = bcrypt.compareSync(password, user.password);
      if (!isPasswordCorrect) {
        return res.status(401).json({ message: 'Incorrect password' });
      }

      // Generate token
      const accessToken = auth.createAccessToken(user);

      return res.status(200).json({
        message: 'User logged in successfully',
        access: accessToken
      });
    })
    .catch(err => errorHandler(err, req, res));
};

// 3. Retrive User Details

module.exports.getUserDetails = (req, res) => {
  // req.user comes from the decoded token (set in auth.verify)
  const userId = req.user.id;

  User.findById(userId)
    .then(user => {
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Hide sensitive info (like password)
      const { password, ...userWithoutPassword } = user.toObject();

// **** modified for cart testing *****
      // res.status(200).json({
      //   message: 'User details retrieved successfully',
      //   user: userWithoutPassword
      // });

      res.status(200).json(userWithoutPassword);

    })
    .catch(err => errorHandler(err, req, res));
};

// 4. Set User as Admin (admin only)

module.exports.setAsAdmin = (req, res) => {
  const userId = req.params.id; // match the route param exactly

  User.findByIdAndUpdate(
    userId,
    { isAdmin: true },
    { new: true } // return updated document
  )
    .then(updatedUser => {
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.status(200).json({
        message: `User ${updatedUser.email} is now an admin.`,
        user: {
          _id: updatedUser._id,
          email: updatedUser.email,
          isAdmin: updatedUser.isAdmin
        }
      });
    })
    .catch(err => errorHandler(err, req, res));
};

// 5. Update password

module.exports.updatePassword = async (req, res) => {
  try {
    const userId = req.user.id; // from JWT decoded token
    const { newPassword } = req.body;

    // Basic validation
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters long'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in DB
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { password: hashedPassword },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Password updated successfully'
    });

  } catch (err) {
    errorHandler(err, req, res);
  }
};


// ********** added for carts debugging ******************************
// module.exports.getActiveUser = (req, res) => {
//     const { id, email, isAdmin } = req.user; 
    
//     // Ensure you return _id, not just id
//     return res.status(200).json({
//         _id: id,      // The property name the test likely expects
//         email,
//         isAdmin
//     });
// };
// *********************************************************************