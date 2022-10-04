const mongoose = require('mongoose')
const Admins = mongoose.model('Admins');
const Users = mongoose.model('Users');
const Coupons = mongoose.model('Coupons');
const ClaimedCoupons = mongoose.model('ClaimedCoupons');
const TcPp = mongoose.model('TcPp');
const bcrypt = require('bcrypt')
//done
const signIn = async (req, res) => {
    try {
        const { email, password } = req.body
        const admin = await Admins.findOne({ email })
        var emailRegex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
        

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!email || !password) {
            return res.status(400).send({ status: 0, Message: "Must provide email or password" })
        }
       else if (!email.includes(emailRegex)) {
            return res.status(400).send({ status: 0, Message: "Invalid Email Format" })
        }
        else if (!isMatch) {
            return res.status(400).send({ status: 0, Message: "Password is not valid" });
        }
        else {
            await admin.generateAuthToken();
            const adminDetail = await Admins.findOne({ _id: admin._id });
            res.status(200).send({ status: 1, Message: "Login Successfull", data: adminDetail.token })
        }
    } catch (err) {
        return res.status(400).send({ status: 0, Message: "Invalid User" })
    }
}

//done
const profile = async (req, res) => {
    try {
        const user = await Admins.findById({ _id: req.user._id })
        if (!user) {
            res.status(400).send({ status: 0, Message: "User not found" })
        }
        else {
            res.send({ status: 1, user })
        }
    } catch (err) {
        return res.status(500).send({ status: 0, Message: "Something Went Wrong" })
    }
}

//done
const signOut = async (req, res) => {
    try {
        const user = await Admins.findById({ _id: req.user._id })
        if (!user) {
            return res.status(400).send({ status: 0, Message: "Admin Not Found" })
        } else {
            await Admins.findOneAndUpdate({ _id: req.user._id }, {
                token: null,
            }, { new: true });
            res.status(200).send({ status: 1, Message: "Admin Logged Out" })
        }
    } catch (err) {
        return res.status(400).send({ status: 0, Message: "Something Went Wrong" })
    }
}

//done
const updatePassword = async (req, res) => {
    try {
        const { currentPassword, confirmNewPassword, newPassword } = req.body;
        const usercheck = await Admins.findOne({ _id: req.user._id })
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
            await Admins.findByIdAndUpdate({ _id: req.user._id }, { $set: { password: pass } })
            res.status(200).send({ status: 1, Message: "Password Changed successfully" })
        }
    }
    catch (err) {
        return res.status(400).send({ status: 0, Message: "Something went wrong" })
    }
}

//done
const getAllUsers = async (req, res) => {
    try {
        const users = await Users.find({ role: "User" })
        if (users.length < 1) {
            return res.status(400).send({ status: 0, Message: "No users found" });
        }
        else {
            return res.status(200).send({ status: 1, users });
        }
    } catch (error) {
        return res.status(400).send({ status: 0, Message: "Something Went Wrong" });
    }
}

//done
const getAllBusiness = async (req, res) => {
    try {
        const Business = await Users.find({ role: "Business" })
        if (Business.length < 1) {
            return res.status(400).send({ status: 0, Message: "No business found" });
        }
        else {
            return res.status(200).send({ status: 1, Business });
        }
    } catch (error) {
        return res.status(400).send({ status: 0, Message: "Something Went Wrong" });
    }
}
// done
const deleteAccount = async (req, res) => {
    try {
        const _id = req.params.id
        const user = await Users.findByIdAndDelete({ _id })
        if (!user) {
            return res.status(400).send({ status: 0, Message: "No user found" });
        }
        else {
            await Users.findOneAndUpdate({ _id: user._id }, {
                token: null,
                user_device_type: null,
                user_device_token: null,
            }, { new: true });
            return res.status(200).send({ status: 1, Message: "User deleted successfully" });
        }
    } catch (error) {
        return res.status(400).send({ status: 0, Message: "Something Went Wrong" });
    }
}
// done
const blockunblock = async (req, res) => {
    try {
        const _id = req.params.id
        const checkUser = await Users.findOne({ _id })
        if (checkUser.block) {
            const user = await Users.findByIdAndUpdate({ _id }, { $set: { block: false } })

            if (user) {
  
                return res.status(200).send({ status: 1, Message: "Account unblocked successfully" });
            }
        }
        else {
            const user = await Users.findByIdAndUpdate({ _id }, { $set: { block: true } })
            if (user) {
                await Users.findOneAndUpdate({ _id: user._id }, {
                    token: null,
                    user_device_type: null,
                    user_device_token: null,
                }, { new: true });
                return res.status(200).send({ status: 1, Message: "Account blocked successfully" });
            }
        }
    } catch (error) {
        return res.status(400).send({ status: 0, Message: "Something Went Wrong" });
    }
}

//done
const getBusinessCoupons = async (req, res) => {
    try {
        const _id = req.params.idd;
        const coupons = await Coupons.find({ bussinessId: _id })
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






const getCouponDetail = async (req, res) => {
    try {
        const id = req.params.id;
        const coupons = await Coupons.findOne({_id:id})
        if (coupons) {
            res.status(200).send({ status: 1, coupons: coupons })
        }
        else {
            return res.status(400).send({ status: 0, Message: "No Coupons Found" })
        }
    } catch (err) {
        return res.status(400).send({ status: 0, Message: "Something Went Wrong" })
    }
}





const getBusinessRedeemedCoupons = async (req, res) => {
    try {
        const _id = req.params.id;
        const coupons = await ClaimedCoupons.find({ bussinessId: _id, redeemed: true }).populate("user",'name')
        if (coupons.length > 0) {
            res.status(200).send({ status: 1, coupons: coupons })
        }
        else {
            return res.status(400).send({ status: 0, Message: "No Redeemed Coupons Found" })
        }
    } catch (err) {
        return res.status(400).send({ status: 0, Message: "Something Went Wrong" })
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



// ============================
// GET ALL COUPONS
const getAllCoupons = async (req, res) => {
    try {
        const _id = req.params.id;
        const coupons = await Coupons.find({})
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


const getRedeemedCoupons = async (req, res) => {
    try {
   
        const coupons = await ClaimedCoupons.find({})
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


const dashboard = async (req, res) => {
    try {
   
        const users = await Users.find({role:"User"}).countDocuments()
        const business = await Users.find({role:"Business"}).countDocuments()
        const coupons = await Coupons.find({}).countDocuments()
        const claimCoupons = await ClaimedCoupons.find({}).countDocuments()

        return res.status(200).json({status:1 ,users, business , coupons,claimCoupons})
    

    } catch (err) {
        return res.status(400).send({ status: 0, Message: "Something Went Wrong" })
    }
}




module.exports = { signIn, TcandPp, getTcandPp, signOut, profile, updatePassword,dashboard, getAllUsers, getRedeemedCoupons,getAllBusiness, deleteAccount, blockunblock,getCouponDetail, getBusinessCoupons, getBusinessRedeemedCoupons,getAllCoupons }