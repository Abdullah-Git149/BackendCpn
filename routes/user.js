 const express = require('express')
const router = express.Router();
const { upload } = require("../utils/utils")
const { signUp, signIn, verifyAccount, resendOTP, userProfile, editProfile, updatePassword, forgetPassword, newPassword, signOut, socialLogin, createProfile, updatePreference, getcoupons ,filterCoupon,Catname,getNotification,locationUpdate,getTotalCouponChart} = require("../controller/userController")
const checkAuthUser = require('../middleware/checkAuthUser')

router.post('/user/signup', signUp); 

router.post('/user/signin', signIn)

router.post('/user/verifyaccount', verifyAccount)

router.post('/user/createprofile', upload.single("photo"), createProfile)

router.post('/user/updatepreference', checkAuthUser, updatePreference)

router.post('/user/resendotp', resendOTP)

router.post('/user/forgetpassword', forgetPassword)

router.post('/user/newpassword', newPassword)

router.post('/user/signout', checkAuthUser, signOut)

router.post('/user/sociallogin', upload.single("photo"), socialLogin) 

router.get('/user/profile', checkAuthUser, userProfile)

router.post('/user/editProfile',checkAuthUser,  upload.single("photo"), editProfile)

router.post('/user/changepassword', checkAuthUser, updatePassword)

router.get('/getcoupons', checkAuthUser, getcoupons)

router.post('/filterCoupon', checkAuthUser, filterCoupon)

router.get('/getcatname', checkAuthUser, Catname)

router.get('/getNotification', checkAuthUser, getNotification) 
 
router.post('/user/locationUpdate', checkAuthUser, locationUpdate)

module.exports = router

