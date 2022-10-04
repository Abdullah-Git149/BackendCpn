const mongoose = require('mongoose');
 
const tcPpSchema = new mongoose.Schema({
    termCondition: {
        type: String, 
        trim: true,
    }, 
    privacyPolicy: {
        type: String, 
        trim: true,
    }, 
}, {
    timestamps: true
});
  
mongoose.model('TcPp', tcPpSchema);
