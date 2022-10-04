const mongoose = require('mongoose');
 
const couponSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    bussinessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    couponTitle:{
         type: String, 
    },
    brandName: {
        type: String,
        required: true,
        trim: true,
    }, 
    brandCategory: {
        type: String,
        required: true,
        trim: true,
    },
    couponDescription: {
        type: String,
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
     monthYear: {
        type: String,
        required: true,
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
    radius:{
        type:Number,
        default:0
    }, 
       expired:{
        type:Boolean,
        default:false
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
  
mongoose.model('Coupons', couponSchema);
