const express = require('express')
const router = express.Router();
const { claim, getClaimedCoupon, deleteClaimedCoupon,getRedeemedCoupons } = require("../controller/claimedCouponController")
const checkAuthUser = require('../middleware/checkAuthUser')

router.post('/Coupon/claim/:couponId',checkAuthUser, claim)

router.get('/Coupon/getClaimedCoupon',checkAuthUser, getClaimedCoupon)

router.delete('/Coupon/deleteClaimedCoupon/:id',checkAuthUser, deleteClaimedCoupon)

router.get('/Coupon/getRedeemedCoupons',checkAuthUser, getRedeemedCoupons)

module.exports = router