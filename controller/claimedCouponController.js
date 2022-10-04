const mongoose = require('mongoose')
const ClaimedCoupons = mongoose.model('ClaimedCoupons');
const Coupons = mongoose.model('Coupons');
const Users = mongoose.model('Users');
const Notification = mongoose.model('Notification');
const moment=require("moment")
//done
const claim = async (req, res) => {
    try {
        const _id = req.params.couponId
        const uniqueCode = Math.floor(10000 + Math.random() * 90000);
        const getCoupon = await Coupons.findOne({ _id })
        const user = await Users.findOne({ _id: req.user._id })
        if (!user.isActive) {
            return res.status(400).send({ status: 0, Message: "User is not verified" })
        }
        else if (getCoupon) {
            if (getCoupon.expired) {
                res.status(400).send({ status: 0, Message: "Coupon is Expired" })
            } else {
                const alreadyClaimed = await ClaimedCoupons.findOne({ coupon: getCoupon._id, user: req.user._id })
                if (alreadyClaimed) {
                    res.status(200).send({ status: 0, Message: "Coupon is already claimed" })
                }
                else {
                    const coupon = new ClaimedCoupons({ user: req.user._id, couponTitle: getCoupon.couponTitle, bussinessId: getCoupon.bussinessId, coupon: getCoupon._id, brandName: getCoupon.brandName, discountVoucher: getCoupon.discountVoucher, couponDescription: getCoupon.couponDescription, validTill: getCoupon.validTill,launchDate: getCoupon.launchDate, brandCategory: getCoupon.brandCategory, uniqueCode, "location.type": getCoupon.location.type, "location.coordinates": getCoupon.location.coordinates, brandImage: getCoupon.brandImage });
                    await coupon.save();
                    const notification = new Notification({ user: req.user._id, couponTitle: getCoupon.couponTitle, coupon: getCoupon._id, bussinessId: getCoupon.bussinessId, brandName: getCoupon.brandName, discountVoucher: getCoupon.discountVoucher, validTill: getCoupon.validTill,launchDate: getCoupon.launchDate, brandImage: getCoupon.brandImage, action: "claimed" });
                    await notification.save();
                    res.status(200).send({ status: 1, Message: "Coupon is claimed successfully", coupon: coupon });
                  
                }
            }
        }
        else {
            return res.status(400).send({ status: 0, Message: "Coupon not found" });
        }
    } catch (err) {
        return res.status(400).send({ status: 0, Message: err })
    }
}

//done
const getClaimedCoupon = async (req, res) => {
    const currDate = moment(new Date()).format("YYYY-MM-DDTHH:mm") 
    try {
        await ClaimedCoupons.deleteMany({  user: req.user._id, redeemed: false , validTill: { $lt: currDate.toString() }})
        const user = await Users.findOne({ _id: req.user._id })
        if (!user.isActive) {
            return res.status(400).send({ status: 0, Message: "User is not verified" })
        }
        else {
            const getCoupon = await ClaimedCoupons.find({ user: req.user._id }).populate("user", "_id name email   ")
            if (getCoupon.length > 0) { 
                res.status(200).send({ status: 1, coupons: getCoupon })
            }
            else {
                return res.status(400).send({ status: 0, Message: "Coupons not found" })
            }
        }
    } catch (err) {
        return res.status(400).send({ status: 0, Message: "Something Went Wrong" })
    }
}


const getRedeemedCoupons = async (req, res) => {
    try {
        const user = await Users.findOne({ _id: req.user._id })
        if (!user.isActive) {
            return res.status(400).send({ status: 0, Message: "User is not verified" })
        }
        else {
            const getCoupon = await ClaimedCoupons.find({ user: req.user._id, redeemed: true }).populate("user", "_id name email   ")
            if (getCoupon.length > 0) {
                res.status(200).send({ status: 1, coupons: getCoupon })
            }
            else {
                return res.status(400).send({ status: 0, Message: "Coupons not found" })
            }
        }
    } catch (err) {
        return res.status(400).send({ status: 0, Message: "Something Went Wrong" })
    }
}

//done
const deleteClaimedCoupon = async (req, res) => {
    try {
        const _id = req.params.id
        const user = await Users.findOne({ _id: req.user._id })
        if (!user.isActive) {
            return res.status(400).send({ status: 0, Message: "User is not verified" })
        }
        else {
            const deleteCoupon = await ClaimedCoupons.findByIdAndDelete({ _id })
            if (deleteCoupon) {
                res.status(200).send({ status: 1, Message: "Coupon is deleted successfully" })
                await Coupons.findByIdAndUpdate({ _id: deleteCoupon.coupon }, { $set: { expired: false } }, {
                    new: true
                })
            }
            else {
                return res.status(400).send({ status: 0, Message: "Coupons not found" })

            }
        }
    } catch (err) {
        return res.status(400).send({ status: 0, Message: "Something Went Wrong" })
    }
}

module.exports = { claim, getClaimedCoupon, deleteClaimedCoupon, getRedeemedCoupons }