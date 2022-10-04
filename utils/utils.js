const multer = require('multer');
const mongoose = require('mongoose')
const Users = mongoose.model('Users');
const Coupons = mongoose.model('Coupons');
const Notification = mongoose.model('Notification');
const nodemailer = require('nodemailer');
var FCM = require("fcm-node");
var serverKey = "AAAA5tlUGO0:APA91bH7aYsHW6pxJp6uXJrkAnXHTPgs70CBfdZtl0Ymg9xiIjAChz88vWtC2OSUD_FFwr2SZhD7AR6FN9R_nUWWDOQPbPLGhOm3yMCQA-iqwBVXHIcixI7y-AOYkk7pb2k07pb42ZJF"; //put your server key here
var fcm = new FCM(serverKey);
const storage = multer.diskStorage({
    destination(req, file, callback) {
        callback(null, './uploads/images');
    },
    filename(req, file, callback) {
        callback(null, `${file.fieldname}_${Date.now()}_${file.originalname}`);
    },
});

const upload = multer({
    storage,
    fileFilter: async (req, file, cb) => {
        const { user_id } = req.body;
        const userex = await Users.findOne({ _id: user_id ? user_id : req.user._id })
        if (!userex.isActive || !file) {
            cb(null, false);
        }
        else {
            cb(null, true);
        }
    }
});

const uploadCoupon = multer({
    storage,
    fileFilter: async (req, file, cb) => {
        if (!file) {
            cb(null, false);
        }
        else {
            cb(null, true);
        }
    }
});


const push_notifications = async (coupon) => {
    var arr = []
    const pushCoupon = await Coupons.findOne({ _id: coupon._id })
    const options = {
        location:
            { $geoWithin: { $centerSphere: [[pushCoupon.location.coordinates[0], pushCoupon.location.coordinates[1]], 1 / 6378.1] } },user_device_token:{$ne:null}
    }
    const user = await Users.find(options)
    if (user) {
        for (var i = 0; i < user.length; i++) {
            if (user[i].inAppNotification) {
                arr.push(user[i].user_device_token)
            }
                const addCouponNotification = new Notification({ user: user[i]._id, coupon: coupon._id, couponTitle: coupon.couponTitle, bussinessId: coupon.bussinessId, brandName: coupon.brandName, discountVoucher: coupon.discountVoucher,launchDate:coupon.launchDate, validTill: coupon.validTill, brandImage: coupon.brandImage, action: "addcoupon" });
                await addCouponNotification.save();
        }
    }
    for (var i = 0; i < arr.length; i++) {
        var message = {
            to: arr[i],
            collapse_key: "your_collapse_key",

            notification: {
                title: `${coupon.brandName} added a ${coupon.couponTitle} Coupon`,
                body: `${coupon.couponDescription} with ${coupon.discountVoucher} discount`,
            },
            data: {
                coupon: coupon
            }
        };
        fcm.send(message, function (err, response) {
            if (err) {
                console.log("Something has gone wrong!", err);
            } else {
                console.log("Successfully sent with response: ", response);
            }
        });
    }
};

const redeemPushNotification = async (coupon) => {
     const user = await Users.findOne({ _id: coupon?.user })
     if(user.inAppNotification){
    var message = {
        to: user?.user_device_token,
        collapse_key: "your_collapse_key",

        notification: {
            title: `${coupon.brandName} successfully redeemed your Coupon`,
            body: coupon.couponTitle,
        },
        data: {
            coupon: coupon
        }
    };
    fcm.send(message, function (err, response) {
        if (err) {
            console.log("Something has gone wrong!", err);
        } else {
            console.log("Successfully sent with response: ", response);
        }
    });
     }
    const redeemNotification = new Notification({ user: coupon?.user, coupon: coupon.coupon, couponTitle: coupon.couponTitle, bussinessId: coupon.bussinessId, brandName: coupon.brandName, discountVoucher: coupon.discountVoucher, validTill: coupon.validTill, brandImage: coupon.brandImage, action: "Redeem" });
    await redeemNotification.save();
};

// let transporter = nodemailer.createTransport({
//     host: "smtp.mailtrap.io",
//     port: 2525,
//     auth: {
//         user: "b02ab1e8406a6a",
//         pass: "201a3bb4e49a11"
//     }
// })

// transporter.verify((err, succ) => {
//     if (err) {
//         console.log("transporter error " + err)
//     }
//     else {
//         console.log("Nodemailer is ready")
//     }
// })

// const sendVerificationEmail = ({ email, name, otp }, res) => {
//     const mailOptions = {
//         from: 'zainhashmi8910@gmail.com',
//         to: email,
//         subject: 'Verify Your Account Through One Time Password',
//         html: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
//       <div style="margin:50px auto;width:70%;padding:20px 0">
//          <div style="border-bottom:1px solid #eee">
//           <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Coupon App User Verification</a>
//          </div>
//          <p style="font-size:1.1em">Hi, ${name ? name : "User"}</p>
//          <p>Thank you for choosing Our Brand. Use the following OTP to complete your Sign Up procedures.</p>
//          <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
//           <p style="font-size:0.9em;">Regards,<br />Coupon App</p>
//          <hr style="border:none;border-top:1px solid #eee" />
//          <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
//           </div>
//       </div>
//      </div>`,
//     }
//     transporter.sendMail(mailOptions, function (err, data) {
//         if (err) {
//             console.log('Error Occurs');
//         } else {
//             console.log('Email sent successfully');
//         }
//     });
// }

module.exports = { upload, uploadCoupon, push_notifications, redeemPushNotification }