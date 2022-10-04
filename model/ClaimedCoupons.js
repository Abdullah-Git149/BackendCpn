const mongoose = require('mongoose');
 
const claimedCouponSchema = new mongoose.Schema({
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
    couponDescription: {
        type: String,
         trim: true,
    },
    brandCategory: {
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
        required: true,
        trim: true,
    },
    validTill: {
        type: String,
        required: true,
        trim: true,
    },
     monthYear: {
        type: String, 
        trim: true,
        default:null
    },
    brandImage: {
        type: String,
        required: false,
        trim: true,
    }, 
    uniqueCode:{
        type:Number,
        required: true,
        trim: true,

    },
     redeemed:{
        type:Boolean, 
        default: false,

    },
    location: {
        type: {
            type: String,  
            enum: ['Point'], 
            required: false,
            default:"Point"
          },
          coordinates: {
            type: [Number],
            required: false
          }
    },
}, {
    timestamps: true
});
  
mongoose.model('ClaimedCoupons', claimedCouponSchema);
