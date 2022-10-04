const mongoose = require('mongoose');
 
const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    bussinessId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    coupon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupons'
    },
    couponTitle:{
         type: String, 
    },
    brandName: {
        type: String,
        required: true,
        trim: true,
    },  
    discountVoucher: {
        type: String,
        required: false,
        trim: true,
    },
    launchDate: {
        type: String,
        required: false,
        trim: true,
    },
    validTill: {
        type: String,
        required: true,
        trim: true,
    },
    brandImage: {
        type: String,
        required: false,
        trim: true,
    },  
    action:{
        type:String, 
        required: true, 
    }, 
}, {
    timestamps: true
});
  
mongoose.model('Notification', notificationSchema);
