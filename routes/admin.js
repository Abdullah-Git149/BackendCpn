const express = require('express')
const router = express.Router();
const { signIn, profile, TcandPp, getTcandPp, signOut, updatePassword, getAllUsers, getRedeemedCoupons,getCouponDetail,getAllBusiness, dashboard,deleteAccount,blockunblock,getAllCoupons, getBusinessCoupons, getBusinessRedeemedCoupons } = require("../controller/adminController")
const checkAuthAdmin = require('../middleware/checkAuthAdmin')

router.post('/admin/signin', signIn)

router.get('/admin/profile', checkAuthAdmin, profile)

router.post('/admin/signout', checkAuthAdmin, signOut)

router.post('/admin/changepassword', checkAuthAdmin, updatePassword)

router.get('/admin/getAllUsers', checkAuthAdmin, getAllUsers)

router.get('/admin/getAllBusiness', checkAuthAdmin, getAllBusiness)

router.get('/admin/getBusinessCoupons/:idd', checkAuthAdmin, getBusinessCoupons) 

router.get('/admin/getBusinessRedeemedCoupons/:id', checkAuthAdmin, getBusinessRedeemedCoupons) 

router.delete('/admin/deleteAccount/:id', checkAuthAdmin, deleteAccount)

router.get('/admin/blockunblock/:id', checkAuthAdmin, blockunblock)

router.post('/admin/TcPp', checkAuthAdmin, TcandPp)

router.get('/getTcPp', getTcandPp)

router.get('/admin/getAllCoupons', getAllCoupons)

router.get('/admin/getCouponDetail/:id',getCouponDetail)

router.get('/admin/getRedeemedCoupons',getRedeemedCoupons)

router.get('/admin/dashboard',dashboard)

module.exports = router