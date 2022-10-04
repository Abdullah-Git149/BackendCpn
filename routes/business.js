const express = require('express')
const router = express.Router();
const { signIn, addCoupon, deleteCoupon, TcandPp, getTcandPp, editCoupons, signUp, getBusinessCoupons, redeemCoupons, getClaimedCoupons,businessNotification, stripeCard,addLocation,getAllLocations, couponCounts,getAllCard, deleteCard, setCardDefault, getTotalCouponChart, getRedeemedCouponChart,getPresentedCouponChart} = require("../controller/BusinessController")
const checkAuthBusiness = require('../middleware/checkAuthBusiness')
const { uploadCoupon } = require("../utils/utils")

router.post('/business/signin', signIn)

router.post('/business/signup', uploadCoupon.single("photo"), signUp)

router.post('/TcPp', TcandPp)

router.get('/getTcPp', getTcandPp)

router.post('/business/addcoupon', checkAuthBusiness, uploadCoupon.single("couponImage"), addCoupon)

router.get('/business/getbusinesscoupons', checkAuthBusiness,  getBusinessCoupons)

router.post('/business/editCoupons/:couponid', checkAuthBusiness, uploadCoupon.single("couponImage"), editCoupons)

router.delete('/business/deletecoupon/:couponid', checkAuthBusiness, deleteCoupon) 

router.post('/business/redeemcoupon/:couponid', checkAuthBusiness, redeemCoupons)

router.get('/business/getClaimedCoupons', checkAuthBusiness, getClaimedCoupons)

router.get('/business/getbusinessNotification', checkAuthBusiness, businessNotification)

router.post('/business/addcard', checkAuthBusiness, stripeCard)

router.post('/business/addlocation', checkAuthBusiness, addLocation)

router.get('/business/getbranches', checkAuthBusiness, getAllLocations)

router.get('/business/couponCounts', checkAuthBusiness, couponCounts)

router.get('/business/allCards', checkAuthBusiness, getAllCard)

router.delete('/business/deletecard/:id', checkAuthBusiness, deleteCard)

router.post('/business/setCardDefault/:id', checkAuthBusiness, setCardDefault)

router.post('/business/getTotalCouponChart', checkAuthBusiness, getTotalCouponChart)

router.post('/business/getRedeemedCouponChart', checkAuthBusiness, getRedeemedCouponChart)

router.get('/business/getPresentedCouponChart', checkAuthBusiness, getPresentedCouponChart)

module.exports = router