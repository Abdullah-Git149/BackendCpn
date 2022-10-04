const mongoose = require('mongoose')
const Users = mongoose.model('Users');
const Coupons = mongoose.model('Coupons');
const Notification = mongoose.model('Notification');
const ManageCategory = mongoose.model('ManageCategory');
const ClaimedCoupons = mongoose.model('ClaimedCoupons'); 
const bcrypt = require('bcrypt')
const moment = require('moment')

// const { sendVerificationEmail } = require("../utils/utils")

//done
const signUp = async (req, res) => {
    try {
        const { email, phone, password, confirm_password, role, devicetoken, devicetype } = req.body;
        const otp = Math.floor(100000 + Math.random() * 900000);
        const userex = await Users.findOne({ email: email.toLowerCase() })
        const usertype = userex?.role
        const pass = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,15}$/
        if (!email) {
            return res.status(400).send({ status: 0, Message: "Email is required" })
        }
        if (userex) {
            return res.status(400).send({ status: 0, Message: `Email already exist as ${usertype} account` })
        }
        else if (!phone) {
            return res.status(400).send({ status: 0, Message: "Phone Number is required" })
        }
        else if (!password) {
            return res.status(400).send({ status: 0, Message: "Password is required" })
        }
        else if (password.length < 6 || confirm_password.length < 6) {
            return res.status(400).send({ status: 0, Message: "Password should be 6 character long" })
        }
        else if (!confirm_password) {
            return res.status(400).send({ status: 0, Message: "Confirm Password is required" })
        }
        else if (password !== confirm_password) {
            return res.status(400).send({ status: 0, Message: "Password does not match" })
        }
        else {
            const user = new Users({
                email: email.toLowerCase(), phone: phone.toString(), password, role, otp: 123456,
                user_device_token: devicetoken,
                user_device_type: devicetype
            });
            await user.save();
            // sendVerificationEmail(user)
            return res.status(200).send({ status: 1, Message: "Verify Your Account", user_id: user._id })
        }
    }
    catch (err) {
        return res.status(500).send({ status: 0, Message: "Something went wrong" })
    }
}


//done 
const verifyAccount = async (req, res) => {
    try {
        const { otp, user_id } = req.body;
        if (!otp) {
            return res.status(400).send({ status: 0, Message: "OTP is required" })
        }
        else {
            const user = await Users.findOne({ _id: user_id })
            if (!user) {
                return res.status(400).send({ status: 0, Message: "Invalid User" })
            }
            else if (user.isActive) {
                return res.status(200).send({ status: 0, Message: "Already Verified" })
            }
            else {
                if (otp != user.otp) {
                    return res.status(400).send({ status: 0, Message: "Invalid OTP Verification Code." })
                }
                else {
                    const users = await Users.findByIdAndUpdate({ _id: user._id }, { $set: { isActive: true } })
                    return res.status(200).send({ status: 1, Message: "Account Verified successfully", user: user._id })
                }
            }
        }
    } catch (error) {
        return res.status(400).send({ status: 0, Message: "Some Error Occur" })
    }
}

//done 
const createProfile = async (req, res) => {
    try {
        const { name, user_id, emailNotification, textNotification, inAppNotification } = req.body;
        const users = await Users.findOne({ _id: user_id })
        if (!name) {
            return res.status(400).send({ status: 0, Message: "Name is requried" })
        }
        else if (!user_id) {
            return res.status(400).send({ status: 0, Message: "Id is requried" })
        }
        else {
            if (!users) {
                return res.status(400).send({ status: 0, Message: "User is invalid" })
            }
            else if (!users.isActive) {
                return res.status(400).send({ status: 0, Message: "User is Not Verified" })
            }
            else {
                await users.generateAuthToken();
                const user = await Users.findByIdAndUpdate({ _id: user_id }, { $set: { name, imageName: req.file ? req.file.path : null, emailNotification, textNotification, inAppNotification, isActive: true, isVerified: 1 } }, { new: true })
                res.status(200).send({ status: 1, Message: "Profile Created", user })
            }
        }
    }
    catch (err) {
        return res.status(500).send({ status: 0, Message: "Something Went Wrong" })
    }
}

//done 
const updatePreference = async (req, res) => {
    try {
        const { emailNotification, textNotification, inAppNotification,notification } = req.body;
        const getUser = await Users.findOne({ _id: req.user._id })
        if (!getUser.isActive) {
            return res.status(400).send({ status: 0, Message: "User is Not Verified" })
        }
        else {
            if(notification){
                const user = await Users.findByIdAndUpdate({ _id: req.user._id }, { $set: { notification } }, { new: true })
            res.status(200).send({ status: 1, Message: notification=="on"?`Notification on`:`Notification off`, user: user })
            }else{     
            const user = await Users.findByIdAndUpdate({ _id: req.user._id }, { $set: { emailNotification, textNotification, inAppNotification } }, { new: true })
            res.status(200).send({ status: 1, Message: "Preferences Updated", user: user })
            }
        }
    } catch (err) {
        return res.status(500).send({ status: 0, Message: "Something Went Wrong" })
    }
}

//done
const resendOTP = async (req, res) => {
    try {
        const { user_id } = req.body;
        const otp = Math.floor(100000 + Math.random() * 900000);
        const userex = await Users.findOne({ _id: user_id })
        if (!userex) {
            return res.status(400).send({ status: 0, Message: "Invalid User" })
        }
        else {
            if (!userex.isActive) {
                await Users.findByIdAndUpdate({ _id: userex._id }, { $set: { otp: 123456 } })
                const user = await Users.findOne({ _id: userex._id })
                // sendVerificationEmail(user)
                return res.status(200).send({ status: 1, Message: "Verification OTP Sent" })
            }
            else {
                return res.status(400).send({ status: 0, Message: "Already Verified" })
            }
        }
    } catch (error) {
        return res.status(400).send({ status: 0, Message: "Some Error Occur" })
    }
}

//done
const forgetPassword = async (req, res) => {
    try {
        const otp = Math.floor(100000 + Math.random() * 900000);
        const { email } = req.body;
        const emailValidation = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
        const userex = await Users.findOne({ email })
        if (!email) {
            return res.status(400).send({ status: 0, Message: "Email is required" })
        }
        else if (!email.match(emailValidation)) {
            return res.status(400).send({ status: 0, Message: "Invalid email address" })
        }
        if (!userex) {
            return res.status(400).send({ status: 0, Message: "User not found" })
        }
        else {
            await Users.findByIdAndUpdate({ _id: userex._id }, { $set: { isActive: false, otp: 123456 } })
            const user = await Users.findOne({ email })
            // sendVerificationEmail(user)
            return res.status(200).send({ status: 1, Message: "Verification OTP Sent", user_id: user._id })

        }
    } catch (error) {
        return res.status(400).send({ status: 0, Message: "Some Error Occur" })
    }
}

//done
const newPassword = async (req, res) => {
    try {
        const { newPassword, confirmNewPassword, email } = req.body;
        const pass = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,15}$/
        if (!newPassword) {
            return res.status(400).send({ status: 0, Message: "New Password is requried" })
        }
        else if (newPassword.length < 6) {
            return res.status(400).send({ status: 0, Message: "Password should be 6 character long" })
        }
        else if (!confirmNewPassword) {
            return res.status(400).send({ status: 0, Message: "Confirm Password is requried" })
        }
        else if (confirmNewPassword.length < 6) {
            return res.status(400).send({ status: 0, Message: "Password should be 6 character long" })
        }
        else if (newPassword != confirmNewPassword) {
            return res.status(400).send({ status: 0, Message: "Password does not match" })
        }
        else {
            const usercheck = await Users.findOne({ email })
            if (!usercheck) {
                return res.status(400).send({ status: 0, Message: "User Not Found" })
            }
            else if (!usercheck.isActive) {
                return res.status(400).send({ status: 0, Message: "Verify your Account" })
            }
            const salt = await bcrypt.genSalt(10);
            const pass = await bcrypt.hash(newPassword, salt);
            const user = await Users.findByIdAndUpdate({ _id: usercheck._id }, { $set: { password: pass } })
            res.status(200).send({ status: 1, Message: "Password Changed successfully", data: user })
        }
    }
    catch (err) {
        return res.status(400).send({ status: 0, Message: "Something went wrong" })
    }
}

//done
const signIn = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email) {
            return res.status(400).send({ status: 0, Message: "Email is required" })
        }
        else if (!password) {
            return res.status(400).send({ status: 0, Message: "Password is required" })
        }
        const user = await Users.findOne({ email: email.toLowerCase() })
        if (!user) {
            return res.status(400).send({ status: 0, Message: "User not found" })
        } 
        if(user.block){
            return res.status(400).send({ status: 0, Message: "Account Blocked" })
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!user.isActive) {
            return res.status(400).send({ status: 0, Message: "User is Not Verified" })
        }
        else if (!isMatch) {
            return res.status(400).send({ status: 0, Message: "Password is not valid" });
        }
        else {
            if (user?.role == "User") {
                await user.generateAuthToken();
                const updateUser = await Users.findOneAndUpdate({ _id: user._id }, {
                    user_device_type: req.body.devicetype,
                    user_device_token: req.body.devicetoken
                }, { new: true });
                res.status(200).send({ status: 1, Message: "Login Successfully", data: updateUser })
            }
            else {
                res.status(200).send({ status: 0, Message: "Business can not access" })
            }
        }

    } catch (err) {
        return res.status(400).send({ status: 0, Message: "Something went wrong" })
    }
}

//done
const socialLogin = async (req, res) => {
    const { socialToken, socialType, device_token, device_type, name, email, image, phone } = req.body
    try {
        if (!socialToken) {
            return res.status(400).send({ status: 0, Message: 'User Social Token field is required' });
        }
        else if (!socialType) {
            return res.status(400).send({ status: 0, Message: 'User Social Type field is required' });
        }
        else if (!device_token) {
            return res.status(400).send({ status: 0, Message: 'User Device Type field is required' });
        }
        else if (!device_type) {
            return res.status(400).send({ status: 0, Message: 'User Device Token field is required' });
        }
        else {
            const checkUser = await Users.findOne({ user_social_token: socialToken });
            if (!checkUser) {
                const user = new Users({ name, email, phone: phone, user_social_token: socialToken, user_social_type: socialType, user_device_type: device_type, user_device_token: device_token, imageName: req.file ? req.file.path : image, isActive: true });
                await user.save();
                return res.status(200).send({ status: 1, Message: 'Account created', user });
            }
            else {
                const token = await checkUser.generateAuthToken();
                const user = await Users.findOneAndUpdate({ _id: checkUser._id },
                    { user_device_type: device_type, user_device_token: device_token, phone: phone, token }
                    , { new: true });
                return res.status(200).send({ status: 1, Message: 'Login Successfully', user });
            }
        }
    } catch (e) {
        res.status(400).send({ status: 0, Message: 'Something went Wrong' });
    }
}

//done
const signOut = async (req, res) => {
    try {
        const user = await Users.findById({ _id: req.user._id })
        if (!user) {
            return res.status(400).send({ status: 0, Message: "User Not Found" })
        } else {
            if(req.user.role=="User"){
                await Users.findOneAndUpdate({ _id: req.user._id }, {
                token: null,
                user_device_type: null,
                user_device_token: null,
            }, { new: true });
            res.status(200).send({ status: 1, Message: "User Logged Out" })
            }else{          
            await Users.findOneAndUpdate({ _id: req.user._id }, {
                token: null, 
            }, { new: true });
            res.status(200).send({ status: 1, Message: "User Logged Out" })
            }
        }
    } catch (err) {
        return res.status(400).send({ status: 0, Message: "Something went wrong" })
    }
}

//done
const userProfile = async (req, res) => {
    try {
        const user = await Users.findById({ _id: req.user._id })
        if (!user.isActive) {
            res.status(400).send({ status: 0, Message: "User is not verified" })
        }
        else {
            res.send({ status: 1, user })
        }
    } catch (err) {
        return res.status(500).send({ status: 0, Message: "Something Went Wrong" })
    }
}

//done
const editProfile = async (req, res) => {
    try {
        const { name, phone } = req.body;
        const usercheck = await Users.findOne({ _id: req.user._id })
        if (!usercheck.isActive) {
            return res.status(400).send({ status: 0, Message: "User is not verified" })
        }
        else if (!name && !phone && !req.file) {
            return res.status(400).send({ status: 0, Message: "Fill atleast one Field" })
        }
        else {
            const user = await Users.findByIdAndUpdate({ _id: req.user._id }, { $set: { name: name ? name : req.user.name, phone: phone ? phone : req.user.phone, imageName: req.file ? req.file.path : req.user.imageName, } }, {
                new: true
            })
            res.status(200).send({ status: 1, Message: "Profile Updated successfully", user })
        }
    }
    catch (err) {
        return res.status(500).send({ status: 0, Message: "Something Went Wrong" })
    }
}

//done
const updatePassword = async (req, res) => {
    try {
        const { currentPassword, confirmNewPassword, newPassword } = req.body;
        const usercheck = await Users.findOne({ _id: req.user._id })
        if (!usercheck.isActive) {
            return res.status(400).send({ status: 0, Message: "User is not Verified" })
        }
        if (!currentPassword) {
            return res.status(400).send({ status: 0, Message: "Current Password is required" })
        }
        const isMatch = await bcrypt.compare(currentPassword, usercheck.password);
        if (!isMatch) {
            return res.status(400).send({ status: 0, Message: "Invalid Current Password" })
        }
        else if (!newPassword) {
            return res.status(400).send({ status: 0, Message: "New Password is required" })
        }
        else if (newPassword.length < 6) {
            return res.status(400).send({ status: 0, Message: "Password should be 6 character long" })
        }
        else if (!confirmNewPassword) {
            return res.status(400).send({ status: 0, Message: "Confirm New Password is required" })
        }
        else if (confirmNewPassword.length < 6) {
            return res.status(400).send({ status: 0, Message: "Password should be 6 character long" })
        }
        else if (newPassword !== confirmNewPassword) {
            return res.status(400).send({ status: 0, Message: "New Password and Confirm New Password should be same" })
        }
        else if (currentPassword == newPassword || currentPassword == confirmNewPassword) {
            return res.status(400).send({ status: 0, Message: "Old password and new password can't be same" })
        }
        else if (!usercheck) {
            return res.status(400).send({ status: 0, Message: "User Not Found" })
        }
        else {
            await usercheck.comparePassword(currentPassword);
            const salt = await bcrypt.genSalt(10);
            const pass = await bcrypt.hash(newPassword, salt);
            const user = await Users.findByIdAndUpdate({ _id: req.user._id }, { $set: { password: pass } })
            res.status(200).send({ status: 1, Message: "Password Changed successfully" })
        }
    }
    catch (err) {
        return res.status(400).send({ status: 0, Message: "Something went wrong" })
    }
}

const filterCoupon = async (req, res) => {
    try {
        const { brandName, brandCategory } = req.body;
        const findDetails = await ManageCategory.findOne({ user: req.user._id })
        if (!findDetails) {
            const updateDetails = new ManageCategory({ user: req.user._id, brandName, brandCategory });
            await updateDetails.save();
            if (updateDetails) {
                res.status(200).send({ status: 1, Message: "Updated Successfully" })
            }
        }
        else {
            const updateDetails = await ManageCategory.findOneAndUpdate({ user: req.user._id }, { $set: { brandName, brandCategory } });
            await updateDetails.save();
            if (updateDetails) {
                res.status(200).send({ status: 1, Message: "Updated Successfully" })
            }
        }
    } catch (err) {
        return res.status(400).send({ status: 0, Message: "Something Went Wrong" })
    }
}

//done
const Catname = async (req, res) => {
    var brandNameArr = []
    var brandCategoryArr = []
    try {
        const currDate = moment(new Date()).format("YYYY-MM-DDTHH:mm")
        const coupons = await Coupons.find({
                    $and: [ 
                        { launchDate: { $lt: currDate.toString() } },
                        { validTill: { $gte: currDate.toString() } }
                    ], expired: false
                })  
        const user = await Users.find({ role: "Business" })
        if (coupons.length > 0) {
           const getbrandCat= coupons?.map(async(res, i) => { 
                const filterCoupons = await Coupons.find({
                        _id: res._id,
                        location:
                            { $geoWithin: { $centerSphere: [[req.user.location.coordinates[0], req.user.location.coordinates[1]], (res?.radius * 1.60934) / 6378.1] } }
                    })
                    if(filterCoupons[0]){  
                brandCategoryArr.push(res?.brandCategory)
                    }
            })
            const couponsfilter = await Promise.all(getbrandCat);
            
            if (user.length > 0) {
                user.map((res) => {
                    brandNameArr.push({ bussinessId: res._id, brandName: res.name })
                })
            } 
             const uniqueCategoryArray = brandCategoryArr.filter(function (item, pos) {
                return brandCategoryArr.indexOf(item) == pos;
            })
            const manageUserData = await ManageCategory.findOne({ user: req.user._id })
            if (manageUserData) {
                return res.status(200).send({ status: 1, brandNames: brandNameArr, brandCategories: uniqueCategoryArray, selectedBrandName: manageUserData.brandName, selectedbrandCategory: manageUserData.brandCategory })
            }
            else {
                return res.status(200).send({ status: 1, brandNames: brandNameArr, brandCategories: uniqueCategoryArray })
            }
        }
        else {
            return res.status(400).send({ status: 0, Message: "No Coupons found" })
        }

    } catch (err) {
        return res.status(400).send({ status: 0, Message: "Something Went Wrong" })
    }
}

//done
const getcoupons = async (req, res) => {
    //  try {
    //     const long = req.query.long;
    //     const lat = req.query.lat;
    //     console.log(long, lat)
    //     const date = moment(new Date()).format("YYYY-MM-DD")
    //     await Coupons.updateMany(
    //         { validTill: { $lt: date } },
    //         { $set: { expired: true } }
    //     )
    //     if (!long || !lat) {
    //         return res.status(400).send({ status: 0, Message: "Location not found" })
    //     }
    //     else {
    //         await Users.findByIdAndUpdate({ _id: req.user._id }, { $set: { "location.type": "Point", "location.coordinates": [long, lat], } }, { new: true })

    //         const options = {
    //             location:
    //                 { $geoWithin: { $centerSphere: [[long, lat], 1 / 6378.1] } }, expired: false
    //         }
    //         const coupons = await Coupons.find(options)
    //         if (coupons.length > 0) {
    //             res.status(200).send({ status: 1, inRadius: 1, coupons: coupons })
    //         }
    //         else {
    //             return res.status(200).send({ status: 0, inRadius: 0, Message: "No Coupons in your area" })
    //         }
    //     }
    // } catch (err) {
    //     return res.status(400).send({ status: 0, Message: "Something Went Wrong" })
    // }







    // try {
    //     const long=req.query.long;
    //     const lat=req.query.lat;
    //     console.log(long,lat)
    //      if(!long || !lat){
    //         return res.status(400).send({ status: 0, Message: "Location not found" })
    //     }
    //     else{
    //         const user = await Users.findByIdAndUpdate({ _id: req.user._id }, { $set: { "location.type": "Point", "location.coordinates": [long, lat], } }, { new: true }) 

    //          const options = {
    //     location: 
    //     { $geoWithin: { $centerSphere: [ [long, lat ],(20*1.60934)/6378.1 ] } }

    // } 
    //     const coupons = await Coupons.find(options )
    //       if (coupons.length > 0) { 
    //           const arr=[]
    //     const coupondata = coupons.map(async (item, i) => { 

    //   var R = 6371; // km
    //   var dLat = toRad(item.location.coordinates[1]-lat);
    //   var dLon = toRad(item.location.coordinates[0]-long);
    //   var lat1 = toRad(lat);
    //   var lat2 = toRad(item.location.coordinates[1]); 
    //   var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    //     Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
    //   var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    //   var d = R * c; 
    //   if(d<=item.radius){  
    //   console.log(d)
    //       arr.push({_id:item._id,location:item.location,radius:item.radius,brandName:item.brandName,brandCategory:item.brandCategory,couponDescription:item.couponDescription,discountVoucher:item.discountVoucher,validTill:item.validTill,brandImage:item.brandImage,createdAt:item.createdAt,updatedAt:item.updatedAt,inRadius: 1}) 
    //   }
    //   else{
    //       arr.push({_id:item._id,location:item.location,radius:item.radius,brandName:item.brandName,brandCategory:item.brandCategory,couponDescription:item.couponDescription,discountVoucher:item.discountVoucher,validTill:item.validTill,brandImage:item.brandImage,createdAt:item.createdAt,updatedAt:item.updatedAt,inRadius: 0}) 
    //   }

    //  function toRad(Value) 
    // {
    //     return Value * Math.PI / 180;
    // }
    //         })
    //         const couponsfilter = await Promise.all(coupondata);
    //         console.log(arr)
    //         if(couponsfilter){ 
    //         res.status(200).send({ status: 1,  coupons: arr })
    //         }
    //     }
    //     else {
    //         return res.status(200).send({ status: 0, inRadius:0, Message: "No Coupons in your area" })
    //     }
    //     }
    // } catch (err) {
    //     return res.status(400).send({ status: 0, Message: "Something Went Wrong" })
    // }


     const currDate = moment(new Date()).format("YYYY-MM-DDTHH:mm")
    try {
        const long = req.query.long;
        const lat = req.query.lat;
        console.log(long, lat)
        if (!long || !lat) {
            return res.status(400).send({ status: 0, Message: "Location not found" })
        }
        else {
            const manageCat = await ManageCategory.findOne({ user: req.user._id })
            await Users.findByIdAndUpdate({ _id: req.user._id }, { $set: { "location.type": "Point", "location.coordinates": [long, lat], } }, { new: true })
            await Coupons.updateMany(
                { validTill: { $lt: currDate.toString() } },
                { $set: { expired: true } }
            )
            var claimedArr = []
            const couponsClaimed = await ClaimedCoupons.find({ user: req.user._id })
            const getClaimed = couponsClaimed?.map(async (item, i) => {
                claimedArr.push(item?.coupon)
            })
            const resolveClaimed = await Promise.all(getClaimed);
            if (resolveClaimed) {
                const couponall = await Coupons.find({
                    $and: [
                        { _id: { "$nin": claimedArr } },
                        { bussinessId: { "$nin": manageCat?.brandName } },
                        { brandCategory: { "$nin": manageCat?.brandCategory } },
                        { launchDate: { $lt: currDate.toString() } },
                        { validTill: { $gte: currDate.toString() } }
                    ], expired: false
                })
                var arr = []
                const coupondata = couponall?.map(async (item, i) => {
                    const filterCoupons = await Coupons.find({
                        _id: item._id,
                        location:
                            { $geoWithin: { $centerSphere: [[long, lat], (item?.radius * 1.60934) / 6378.1] } }
                    })
                    var R = 6371; // km
                    var dLat = toRad(item.location.coordinates[1] - lat);
                    var dLon = toRad(item.location.coordinates[0] - long);
                    var lat1 = toRad(lat);
                    var lat2 = toRad(item.location.coordinates[1]);
                    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
                    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                    var d = R * c;
                    var convert = d * 1000
                    if (filterCoupons.length > 0) {
                        if (convert <= 500) {
                            arr.push({ _id: item._id, couponTitle: item.couponTitle, location: item.location, radius: item.radius, brandName: item.brandName, brandCategory: item.brandCategory, couponDescription: item.couponDescription, discountVoucher: item.discountVoucher, validTill: item.validTill, launchDate: item.launchDate, brandImage: item.brandImage, createdAt: item.createdAt, updatedAt: item.updatedAt, inRadius: 1 })
                        }
                        else {
                            arr.push({ _id: item._id, couponTitle: item.couponTitle, location: item.location, radius: item.radius, brandName: item.brandName, brandCategory: item.brandCategory, couponDescription: item.couponDescription, discountVoucher: item.discountVoucher, validTill: item.validTill, launchDate: item.launchDate, brandImage: item.brandImage, createdAt: item.createdAt, updatedAt: item.updatedAt, inRadius: 0 })
                        }
                    }
                    function toRad(Value) {
                        return Value * Math.PI / 180;
                    }
                })
                const couponsfilter = await Promise.all(coupondata);
                if (couponsfilter) {
                    res.status(200).send({ status: 1, coupons: arr })
                }
                else {
                    return res.status(400).send({ status: 0, inRadius: 0, Message: "No Coupons Found" })
                }

            }
        }
    } catch (err) {
        return res.status(400).send({ status: 0, Message: "Something Went Wrong" })
    }
}

const locationUpdate = async (req, res) => {
    try {
        const {lat,long}=req.body
        if(!lat ||!long){
            return res.status(400).send({ status: 0, Message: "Location is Required" })
        }
        else{      
       const location= await Users.findByIdAndUpdate({ _id: req.user._id }, { $set: { "location.type": "Point", "location.coordinates": [long, lat], } }, { new: true })
        if (location) {
            res.status(200).send({ status: 1 })
        }
        else {
            return res.status(400).send({ status: 0, Message: "Location not updated" })
        }
        }
    } catch (err) {
        return res.status(400).send({ status: 0, Message: "Something Went Wrong" })
    }
}

const getNotification = async (req, res) => {
    const currDate = moment(new Date()).format("YYYY-MM-DDTHH:mm") 
    try {
         const getNoti = await Notification.find({ user: req.user._id})
         if(getNoti.length>30){ 
            await Notification.deleteMany({user: req.user._id, validTill:{$lt:currDate}})
         }
        const notifications = await Notification.find({ user: req.user._id, $or: [{ action: "addcoupon" }, { action: "Redeem" }] })
        if (notifications.length > 0) {
            res.status(200).send({ status: 1, notification: notifications })
        }
        else {
            return res.status(400).send({ status: 0, Message: "Notification Not Found" })
        }
    } catch (err) {
        return res.status(400).send({ status: 0, Message: "Something Went Wrong" })
    }
}

module.exports = { signUp, signIn, userProfile, editProfile, updatePassword, verifyAccount, resendOTP, forgetPassword, newPassword, signOut, socialLogin, createProfile, updatePreference, getcoupons, filterCoupon, Catname, getNotification, locationUpdate}