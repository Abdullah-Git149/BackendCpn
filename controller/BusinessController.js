const mongoose = require('mongoose')
const Users = mongoose.model('Users');
const Coupons = mongoose.model('Coupons');
const TcPp = mongoose.model('TcPp');
const bcrypt = require('bcrypt');
const ClaimedCoupons = mongoose.model('ClaimedCoupons');
const Notification = mongoose.model('Notification');
const ManageCard = mongoose.model('ManageCard');
const { push_notifications, redeemPushNotification } = require('../utils/utils');
const moment = require('moment')
const stripe = require('stripe')(process.env.STRIPE_KEY);

const signUp = async (req, res) => {
    try {
        const { email, phone, password, confirm_password, name, lat, long } = req.body;
        const otp = Math.floor(100000 + Math.random() * 900000);
        const userex = await Users.findOne({ email })
        const usertype = userex?.role
        const emailValidation = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
        const pass = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,15}$/
        if (!name) {
            return res.status(400).send({ status: 0, Message: "Business Name is required" })
        }
        else if (!email) {
            return res.status(400).send({ status: 0, Message: "Email is required" })
        }
        else if (!email.match(emailValidation)) {
            return res.status(400).send({ status: 0, Message: "Invalid email address" })
        }
        if (userex) {
            return res.status(400).send({ status: 0, Message: `Email already exist as ${usertype} account` })
        }
        else if (!lat || !lat) {
            return res.status(400).send({ status: 0, Message: "Business Location not selected" })
        }
        else if (!phone) {
            return res.status(400).send({ status: 0, Message: "Phone Number is required" })
        }
        else if (phone.length < 14) {
            return res.status(400).send({ status: 0, Message: "Invalid phone number" })
        }
        else if (!password) {
            return res.status(400).send({ status: 0, Message: "Password is required" })
        }
        else if (!password.match(pass)) {
            return res.status(400).send({ status: 0, Message: "Password should be 8 characters long (should contain uppercase, lowercase, numeric and special character)" })
        }
        else if (!confirm_password) {
            return res.status(400).send({ status: 0, Message: "Confirm Password is required" })
        }
        else if (!confirm_password.match(pass)) {
            return res.status(400).send({ status: 0, Message: "Password should be 8 characters long (should contain uppercase, lowercase, numeric and special character)" })
        }
        else if (password !== confirm_password) {
            return res.status(400).send({ status: 0, Message: "Password does not match" })
        }
        else {
            try {
                const createCustomer = await stripe.customers.create({
                    name,
                    email,
                })
                const user = new Users({email: email.toLowerCase(), phone, name, password, imageName: req.file ? req.file.path : null, stripe_id: createCustomer.id, otp: 123456, "location.type": "Point", "location.coordinates": [long, lat], role: "Business" });
                await user.save();
                // sendVerificationEmail(user)
                return res.status(200).send({ status: 1, Message: "The Otp verification code sent to your email address", user_id: user._id })
            } catch (error) {
                return res.status(400).send({ status: 0, Message: "Customer not created" })
            }
        }
    }
    catch (err) {
        return res.status(500).send({ status: 0, Message: "Something went wrong" })
    }
}
//done
const signIn = async (req, res) => {
    try {
        const { email, password } = req.body
        const emailValidation = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
        if (!email) {
            return res.status(400).send({ status: 0, Message: "Email is required" })
        }
        else if (!email.match(emailValidation)) {
            return res.status(400).send({ status: 0, Message: "Invalid email address" })
        }
        const user = await Users.findOne({ email:email.toLowerCase() })
        if (!user) {
            return res.status(400).send({ status: 0, Message: "User not found" })
        }
        if(user.block){
            return res.status(400).send({ status: 0, Message: "Account Blocked" })
        }
        else if (!password) {
            return res.status(400).send({ status: 0, Message: "Password is required" })
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!user.isActive) {
            return res.status(400).send({ status: 0, Message: "User is Not Verified" })
        }
        else if (!isMatch) {
            return res.status(400).send({ status: 0, Message: "Password is not valid" });
        }
        else {
            if (user.role == "Business") {
                await user.generateAuthToken();
                const updateUser = await Users.findOneAndUpdate({ _id: user._id }, {
                    user_device_type: req.body.devicetype,
                    user_device_token: req.body.devicetoken
                }, { new: true });
                res.status(200).send({ status: 1, Message: "Login Successfully", data: updateUser.token })
            }
            else {
                res.status(400).send({ status: 0, Message: "Users can not access" })
            }
        }

    } catch (err) {
        return res.status(400).send({ status: 0, Message: "Something went wrong" })
    }
}

//done
const TcandPp = async (req, res) => {
    try {
        const { termCondition, privacyPolicy } = req.body
        const findData = await TcPp.findOne()
        if (!termCondition && !privacyPolicy) {
            return res.status(400).send({ status: 0, Message: "Please Add Term Condition or Privacy Policy" })
        }
        else if (termCondition && privacyPolicy) {
            await TcPp.findByIdAndUpdate({ _id: findData._id }, { $set: { termCondition, privacyPolicy } })
        }
        else if (termCondition && !privacyPolicy) {
            await TcPp.findByIdAndUpdate({ _id: findData._id }, { $set: { termCondition } })
        }
        else if (privacyPolicy && !termCondition) {
            await TcPp.findByIdAndUpdate({ _id: findData._id }, { $set: { privacyPolicy } })
        }
        res.status(200).send({ status: 1, Message: `${termCondition && privacyPolicy ? "Term Condition & Privacy Policy " : termCondition ? "Term Condition " : privacyPolicy ? "Privacy Policy " : " "}Added Successfully` })
    } catch (err) {
        return res.status(400).send({ status: 0, Message: "Something went wrong" })
    }
}

//done
const getTcandPp = async (req, res) => {
    try {
        const tcAndPp = await TcPp.findOne()
        res.status(200).send({ status: 1, tcAndPp })
    } catch (err) {
        return res.status(400).send({ status: 0, Message: "Something went wrong" })
    }
}

//done
const addCoupon = async (req, res) => {
    try {
        const { discountVoucher, couponDescription, validTill, brandCategory, radius,  couponTitle,launchDate } = req.body 
        const now = moment(new Date()).format("YYYY-MM-DDThh:mm");  
        if (!couponTitle) {
            return res.status(400).send({ status: 0, Message: "Coupon title is required" });
        }
        else if (!couponDescription) {
            return res.status(400).send({ status: 0, Message: "Coupon description is required" });
        }
        else if (!brandCategory) {
            return res.status(400).send({ status: 0, Message: "Coupon category is required" })
        }
        else if (!launchDate) {
            return res.status(400).send({ status: 0, Message: "Coupon Start Date is required" });
        }
        else if (launchDate < now) {
            return res.status(400).send({ status: 0, Message: "Select a valid start date and time" });
        } 
        else if (!validTill) {
            return res.status(400).send({ status: 0, Message: "Coupon End Date is required" });
        }
        else if (validTill < now) {
            return res.status(400).send({ status: 0, Message: "Select a valid start end and time" });
        } 
        else if (validTill <= launchDate) {
            return res.status(400).send({ status: 0, Message: "End Date Should Be Greater than Start Date" });
        }  
        else if (!req.file) {
            return res.status(400).send({ status: 0, Message: "Coupon image is required" });
        }
        else if (!radius || radius == 0) {
            return res.status(400).send({ status: 0, Message: "Radius is required" });
        }
        else if (!req.user.location.coordinates[0]) {
            return res.status(400).send({ status: 0, Message: "Longitude is required" });
        }
        else if (!req.user.location.coordinates[1]) {
            return res.status(400).send({ status: 0, Message: "Latitude is required" });
        }
        else {
            const getCustomer = await Users.findOne({ _id: req.user._id })
            const getCard = await ManageCard.findOne({ user: req.user._id, is_active: true })
            if (!getCard) {
                res.status(400).send({ status: 0, card: 0  })
            }
            else {
                try {
                    const userCard = await stripe.customers.retrieveSource(
                        getCustomer.stripe_id,
                        getCard.stripe_token
                    );
                    const chargeStripe = await stripe.charges.create({
                        customer: getCustomer.stripe_id,
                        amount: 0.50*100,
                        currency: "usd",
                        source: userCard.id,
                        description: "Coupon Creation Amount Charged",
                    });
                    if (chargeStripe.status == "succeeded") {
                        const coupon = new Coupons({ bussinessId: req.user._id, couponTitle, brandName: req.user.name,monthYear:moment(launchDate).format("YYYY-MM"), discountVoucher, launchDate, validTill, brandCategory, brandImage: req.file ? req?.file?.path : "", "location.type": "Point", "location.coordinates": [req.user.location.coordinates[0], req.user.location.coordinates[1]], couponDescription, radius } );
                        await coupon.save();
                        push_notifications(coupon)
                        res.status(200).send({ status: 1, Message: "Coupon is added successfully", coupon: coupon })
                    }
                } catch (error) {
                    return res.status(400).send({ status: 0, Message: error?.message });
                }
            }
        }
    } catch (err) {
        return res.status(400).send({ status: 0, Message: "Something went wrong" })
    }
}

const getBusinessCoupons = async (req, res) => {
    try {
        const coupons = await Coupons.find({ bussinessId: req.user._id })
        if (coupons.length > 0) {
            res.status(200).send({ status: 1, coupons: coupons })
        }
        else {
            return res.status(400).send({ status: 0, Message: "No Coupons Found" })
        }
    } catch (err) {
        return res.status(400).send({ status: 0, Message: "Something Went Wrong" })
    }
}

const addLocation = async (req, res) => {
    try {
        const { name, lat, long } = req.body
        if (!name) {
            return res.status(400).send({ status: 0, Message: "No location name found" })
        }
        else if (!lat || !long) {
            return res.status(400).send({ status: 0, Message: "No location found" })
        }
        else {
            const location = await Users.findByIdAndUpdate({ _id: req.user._id }, { $push: { "branchLocations.name": name, "branchLocations.coordinates": [long, lat], } }, {
                new: true
            })
            if (location) {
                return res.status(200).send({ status: 1, Message: "Location Added" })
            }
        }
    } catch (err) {
        return res.status(400).send({ status: 0, Message: err })
    }
}

const getAllLocations = async (req, res) => {
    try {
        const getData = await Users.findOne({ _id: req.user._id })
        if (getData.branchLocations) {
            return res.status(200).send({ status: 1, getBranches: getData.branchLocations })
        }
        else {
            return res.status(400).send({ status: 0, Message: "No Location Found" })
        }
    } catch (err) {
        return res.status(400).send({ status: 0, Message: "Something Went Wrong" })
    }
}

//done
const editCoupons = async (req, res) => {
    try { 
        const _id = req.params.couponid
        const { discountVoucher, couponDescription, validTill, brandCategory, couponTitle, couponImage,launchDate } = req.body
         const now = moment(new Date()).format("YYYY-MM-DDThh:mm");
        if (!couponTitle) {
            return res.status(400).send({ status: 0, Message: "Coupon title is required" })
        }
        else if (!couponDescription) {
            return res.status(400).send({ status: 0, Message: "Coupon description is required" })
        } 
        else if (!validTill) {
            return res.status(400).send({ status: 0, Message: "Coupon validity is required" });
        }
        else if (validTill < now) {
            return res.status(400).send({ status: 0, Message: "Select a valid date and time" });
        }
        else {
            const coupon = await Coupons.findByIdAndUpdate({ _id, bussinessId: req.user._id }, { $set: { brandName: req.user.name, couponTitle, discountVoucher,launchDate, validTill, brandImage: req.file ? req.file.path : couponImage, couponDescription,expired:false } }, {
                new: true
            })
            res.status(200).send({ status: 1, Message: "Coupon Updated successfully", coupon })
        }
    }
    catch (err) {
        return res.status(500).send({ status: 0, Message: "Something Went Wrong" })
    }
}

//done
const deleteCoupon = async (req, res) => {
    try {
        const _id = req.params.couponid
        const coupon = await Coupons.findByIdAndDelete({ _id, bussinessId: req.user._id });
        if (coupon) {
            res.status(200).send({ status: 1, Message: "Coupon is deleted successfully", coupon: coupon })
        }
        else {
            res.status(400).send({ status: 0, Message: "Coupon not found" })
        }
    } catch (err) {
        return res.status(400).send({ status: 0, Message: "Something Went Wrong" })
    }
}

const couponCounts = async (req, res) => {
    try {
        const totalCoupons = await Coupons.count({ bussinessId: req.user._id })
        const presentedCoupons = await Coupons.count({ bussinessId: req.user._id, expired: false })
        const redeemedCoupons = await ClaimedCoupons.count({ bussinessId: req.user._id, redeemed: true })
        res.status(200).send({ status: 1, totalCoupons, presentedCoupons, redeemedCoupons })
    }
    catch (err) {
        res.status(400).send({ status: 0, Message: "Something Went Wrong" })
    }

}

const getClaimedCoupons = async (req, res) => {
    try {
        const coupons = await ClaimedCoupons.find({ bussinessId: req.user._id })
        if (coupons.length > 0) {
            res.status(200).send({ status: 1, coupons: coupons })
        }
        else {
            return res.status(400).send({ status: 0, Message: "No Coupons Found" })
        }
    } catch (err) {
        return res.status(400).send({ status: 0, Message: "Something Went Wrong" })
    }
}

const redeemCoupons = async (req, res) => {
    try {
       const currDate= moment(new Date()).format("YYYY-MM")
        const _id = req.params.couponid
        const coupon = await ClaimedCoupons.findOne({ _id, bussinessId: req.user._id });
        if (coupon) {
            if (coupon.redeemed) {
                res.status(400).send({ status: 1, Message: "Coupon is already Redeemed" })
            }
            else {
                const getCustomer = await Users.findOne({ _id: req.user._id })
                const getCard = await ManageCard.findOne({ user: req.user._id,is_active: true  })
                if (!getCard) {
                    res.status(400).send({ status: 0, card: 0, Message: "Add Payment Method" })
                }
                else {
                    try {
                        const userCard = await stripe.customers.retrieveSource(
                            getCustomer.stripe_id,
                            getCard.stripe_token
                        );
                        const chargeStripe = await stripe.charges.create({
                            customer: getCustomer.stripe_id,
                            amount: 0.50 * 100,
                            currency: "usd",
                            source: userCard.id,
                            description: "Coupon Redemption Amount Charged",
                        });
                        if (chargeStripe.status == "succeeded") {
                            const redeemCoupon = await ClaimedCoupons.findOneAndUpdate({ _id, bussinessId: req.user._id }, { $set: { redeemed: true,monthYear:currDate } });
                            if (redeemCoupon) {
                                res.status(200).send({ status: 1, Message: "Coupon is redeemed successfully" })
                                redeemPushNotification(redeemCoupon)
                                const notification = new Notification({ user: req.user._id, couponTitle: redeemCoupon.couponTitle, coupon: redeemCoupon.coupon, bussinessId: redeemCoupon.bussinessId, brandName: redeemCoupon.brandName, discountVoucher: redeemCoupon.discountVoucher, validTill: redeemCoupon.validTill, launchDate: redeemCoupon.launchDate, brandImage: redeemCoupon.brandImage, action: "userCouponRedeem" });
                                await notification.save();
                            }
                        }
                    } catch (err) {
                        return res.status(400).send({ status: 0, Message: "Something Went Wrong" })
                    }
                }
            }
        } else {
            res.status(400).send({ status: 1, Message: "Coupon not found" })
        }
    }
    catch (err) {
        return res.status(400).send({ status: 0, Message: "Something Went Wrong" })
    }

}

const businessNotification = async (req, res) => {
        const currDate = moment(new Date()).format("YYYY-MM-DDTHH:mm")  
    try {
         const getNoti = await Notification.find({ bussinessId: req.user._id})
          if(getNoti.length>30){ 
            await Notification.deleteMany({bussinessId: req.user._id, validTill:{$lt:currDate}})
         }
        const notification = await Notification.find({ bussinessId: req.user._id, $or: [{ action: "claimed" }, { action: "userCouponRedeem" }] }).populate("user", "_id name");
        if (notification.length > 0) {
            res.status(200).send({ status: 1, notification: notification?.reverse() })
        }
        else {
            res.status(400).send({ status: 0, Message: "Notification not found" })
        }
    } catch (err) {
        return res.status(400).send({ status: 0, Message: "Something Went Wrong" })
    }
}

const stripeCard = async (req, res) => {
    try {
        const { card_number, exp_month, exp_year, card_cvc, nameOnCard } = req.body
         if (!nameOnCard) {
            return res
                .status(400)
                .send({ status: 0, Message: "Card holder name is required" });
        } else if (!card_number) {
            return res
                .status(400)
                .send({ status: 0, Message: "Card Number field is required" });
        } else if (!exp_month) {
            return res
                .status(400)
                .send({ status: 0, Message: "expire Month field is required" });
        } else if (!exp_year) {
            return res
                .status(400)
                .send({ status: 0, Message: "expire Year field is required" });
        } else if (!card_cvc) {
            return res
                .status(400)
                .send({ status: 0, Message: "Card CVC field is required" });
        } else {
            const findCard = await ManageCard.findOne({
                user:req.user._id,
                card_number: card_number
            });
            if (findCard) {
                return res
                    .status(400)
                    .send({ status: 0, Message: "Card Already exists!" });
            } else {
                const findUser = await Users.findOne({ _id: req.user._id });
                try {
                    const token = await stripe.tokens.create({
                        card: {
                            number: card_number,
                            exp_month: exp_month,
                            exp_year: exp_year,
                            cvc: card_cvc,
                        },
                    }); 
                    const source = await stripe.customers.createSource(findUser.stripe_id, {
                        source: token.id,
                    });
                    if (source) {
                        const saveCard = new ManageCard({ user: req.user._id, card_number, nameOnCard:nameOnCard?nameOnCard: findUser.name, exp_month, exp_year, card_cvc, stripe_token: source.id })
                        await saveCard.save();
                        if (saveCard) {
                         await ManageCard.updateMany({ user: req.user._id, _id: { $ne: saveCard._id } }, { $set: { is_active: false } }) 
                            return res.status(200).send({
                                status: 1,
                                Message: "Successfully added card",
                                data: saveCard,
                            });
                        }
                    }
                }
                catch (e) {
                    return res.status(400).send({ status: 0, Message: e.message });
                }
            }
        }
    } catch (e) {
        return res.status(400).send({ status: 0, Message: "Something Went Wrong" });
    }
};

const deleteCard = async (req, res) => {
    try {
        const _id = req.params.id
        const cardDelete = await ManageCard.findByIdAndDelete({ _id, user: req.user._id })
        if (cardDelete) {
            try {
                const deleted = await stripe.customers.deleteSource(
                    req.user.stripe_id,
                    cardDelete.stripe_token
                ); 
                if (deleted) {
                    return res.status(200).send({ status: 1, Message: "Card deleted successfully" });
                }
            }
            catch (err) {
                return res.status(400).send({ status: 0, Message: err.message });
            } 
        }
        else {
            return res.status(400).send({ status: 0, Message: "Card not found" });
        } 
    } 
    catch (err) {
        return res.status(400).send({ status: 0, Message: "Something Went Wrong" });
    }
}

const getAllCard = async (req, res) => {
    try {
        const findCard = await ManageCard.find({ user: req.user._id })
        if (findCard.length < 1) {
            return res.status(400).send({ status: 0, Message: "No card found" });
        }
        else {
            return res.status(200).send({ status: 1, cards: findCard });
        }
    } catch (error) {
        return res.status(400).send({ status: 0, Message: "Something Went Wrong" });
    }
}

const setCardDefault = async (req, res) => {
    try {
        const _id = req.params.id
        const getDetails = await ManageCard.findOne({ _id, user: req.user._id })
        if (getDetails.is_active) {
             await ManageCard.findByIdAndUpdate({ _id, user: req.user._id }, { $set: { is_active: false } })
            return res.status(200).send({ status: 1, Message: "Card is deactivated" });
        }
        else {
            const updateCardId = await ManageCard.findByIdAndUpdate({ _id, user: req.user._id }, { $set: { is_active: true } })
            if (updateCardId) {
                const expectUpdatedId = await ManageCard.updateMany({ user: req.user._id, _id: { $ne: _id } }, { $set: { is_active: false } })
                if (expectUpdatedId) {
                    return res.status(200).send({ status: 1, Message: "Card set to default" });
                }
                else {
                    return res.status(400).send({ status: 0, Message: "Card not set" }); 
                }
            }
            else {
                return res.status(400).send({ status: 0, Message: "Card not found" });
            }
        }

    } catch (error) { 
        return res.status(400).send({ status: 0, Message: "Something Went Wrong" });
    }
}



const getTotalCouponChart = async (req, res) => {
    try {
        const currYear=moment(new Date()).format("YYYY")
        const {month}=req.body 
        if(!month){
            var arr=[]
            for(var i=1;i<13;i++){
                if(i<10){
                    const coupons = await Coupons.find({bussinessId: req.user._id,monthYear:`${currYear}-0${i}`}).count() 
                arr.push({month:`${currYear}-0${i}`,coupons})
                }else{
                    const coupons = await Coupons.find({bussinessId: req.user._id,monthYear:`${currYear}-${i}`}).count() 
                arr.push({month:`${currYear}-${i}`,coupons})
                } 
            }
            res.status(200).send({ status: 1,  coupons:arr })
        }
        else{
            var newArr=[]
             for(var i=1;i<13;i++){ 
                 if(i<10){ 
                     if(month==`${currYear}-0${i}`){
                    const coupons = await Coupons.find({bussinessId: req.user._id,monthYear:month}).count() 
                newArr.push({month:`${currYear}-0${i}`,coupons}) 
                }else{
                    const coupons = await Coupons.find({bussinessId: req.user._id,monthYear:`${currYear}-${i}`}).count()  
                newArr.push({month:`${currYear}-0${i}`,coupons:0})
                } 
                 }
                 else{
                     if(month==`${currYear}-${i}`){
                    const coupons = await Coupons.find({bussinessId: req.user._id,monthYear:month}).count()  
                newArr.push({month:`${currYear}-${i}`,coupons})
                }else{
                    const coupons = await Coupons.find({bussinessId: req.user._id,monthYear:`${currYear}-${i}`}).count()  
                newArr.push({month:`${currYear}-${i}`,coupons:0})
                } 
                 }
            }
            res.status(200).send({ status: 1, coupons:newArr }) 
        }
    } catch (err) {
        return res.status(400).send({ status: 0, Message: "Something Went Wrong" })
    }
} 


const getRedeemedCouponChart = async (req, res) => {
    try {
        const currYear=moment(new Date()).format("YYYY")
        const {month}=req.body 
        if(!month){
            var arr=[]
            for(var i=1;i<13;i++){
                if(i<10){
                    const coupons = await ClaimedCoupons.find({bussinessId: req.user._id,monthYear:`${currYear}-0${i}`,redeemed:true}).count() 
                arr.push({month:`${currYear}-0${i}`,coupons})
                }else{
                    const coupons = await ClaimedCoupons.find({bussinessId: req.user._id,monthYear:`${currYear}-${i}`,redeemed:true}).count() 
                arr.push({month:`${currYear}-${i}`,coupons})
                } 
            }
            res.status(200).send({ status: 1,  coupons:arr })
        }
        else{
            var newArr=[]
             for(var i=1;i<13;i++){ 
                 if(i<10){ 
                     if(month==`${currYear}-0${i}`){
                    const coupons = await ClaimedCoupons.find({bussinessId: req.user._id,monthYear:month,redeemed:true}).count() 
                newArr.push({month:`${currYear}-0${i}`,coupons}) 
                }else{
                    const coupons = await ClaimedCoupons.find({bussinessId: req.user._id,monthYear:`${currYear}-${i}`,redeemed:true}).count()  
                newArr.push({month:`${currYear}-0${i}`,coupons:0})
                } 
                 }
                 else{
                     if(month==`${currYear}-${i}`){
                    const coupons = await ClaimedCoupons.find({bussinessId: req.user._id,monthYear:month,redeemed:true}).count()  
                newArr.push({month:`${currYear}-${i}`,coupons})
                }else{
                    const coupons = await ClaimedCoupons.find({bussinessId: req.user._id,monthYear:`${currYear}-${i}`,redeemed:true}).count()  
                newArr.push({month:`${currYear}-${i}`,coupons:0})
                } 
                 }
            }
            res.status(200).send({ status: 1, coupons:newArr }) 
        }
    } catch (err) {
        return res.status(400).send({ status: 0, Message: "Something Went Wrong" })
    }
}


const getPresentedCouponChart = async (req, res) => {
    try {
          const percentageCounpons = await Coupons.find({bussinessId: req.user._id,expired:false, discountVoucher:{$regex: /%$/}}).count()
          const DollarCounpons = await Coupons.find({bussinessId: req.user._id,expired:false, $and: [ 
                        { discountVoucher: { $not: /%$/ } },
                        { discountVoucher: { $not: /No Discount$/ } }
                    ]}).count()
          const NoDiscountCounpons = await Coupons.find({bussinessId: req.user._id,expired:false, discountVoucher:{$regex: /No Discount$/}}).count()
            res.status(200).send({ status: 1, coupons:{percentageCounpons,DollarCounpons,NoDiscountCounpons} })  
    } catch (err) {
        return res.status(400).send({ status: 0, Message: "Something Went Wrong" })
    }
}
module.exports = { signIn, addCoupon, deleteCoupon, TcandPp, getTcandPp, editCoupons, signUp, getBusinessCoupons, redeemCoupons, getClaimedCoupons, businessNotification, stripeCard, addLocation, getAllLocations, couponCounts, getAllCard, deleteCard, setCardDefault, getTotalCouponChart,getRedeemedCouponChart,getPresentedCouponChart }