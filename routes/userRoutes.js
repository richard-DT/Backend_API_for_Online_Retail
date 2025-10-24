const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const auth = require('../auth');

// 1. User Registration
router.post('/register', userController.registerUser);

// 2. User Authentication
router.post('/login', userController.loginUser);

// 3. Retrive User Details
router.get('/details', auth.verify, userController.getUserDetails);

// 4. Set User as Admin (admin only)
router.patch("/:id/set-as-admin", auth.verify, userController.setAsAdmin);

// 5. Update password
router.patch('/update-password', auth.verify, userController.updatePassword);

// 6. Active User (added for carts debugging)
// router.get("/active", auth.verify, userController.getActiveUser);



module.exports = router;
