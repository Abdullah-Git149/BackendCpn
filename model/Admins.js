const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const adminSchema = new mongoose.Schema({
    email: {
        type: String, 
        required: true,
        trim: true,
    },
    name: {
        type: String,
        required: false,
        trim: true,
    }, 
    password: {
        type: String,
        required: true,
        trim: true,
    },
    user_image: {
        type: String,
        required: false,
        trim: true,
    },

    is_blocked: {
        type: String,
        required: false,
        trim: true,
        default:"0"
    },
    token: {
        type: String,
        default: null,
        required: false
    }
}, {
    timestamps: true
});

adminSchema.pre('save', function (next) {
    const user = this;
    if (!user.isModified('password')) {
        return next()
    }
    bcrypt.genSalt(10, (err, salt) => {
        if (err) {
            return next(err)
        }
        bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) {
                return next(err)
            }
            user.password = hash;
            next()
        })

    })

})

adminSchema.methods.generateAuthToken = async function () {
    const admin = this;
    const token = jwt.sign({ adminId: admin._id }, process.env.secret_Key)
    admin.token = token;
    await admin.save();
    return token;
}
 
adminSchema.methods.comparePassword = function (candidatePassword) {
    const user = this;
    return new Promise((resolve, reject) => {
        bcrypt.compare(candidatePassword, user.password, (err, isMatch) => {
            if (err) {
                return reject(err)
            }
            if (!isMatch) {
                return reject(err)
            }
            resolve(true)
        })
    })

}
mongoose.model('Admins', adminSchema);
