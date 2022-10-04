const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: false,
        trim: true,
    },
    name: {
        type: String,
        required: false,
        trim: true,
    },
    phone: {
        type: String,
        required: false,
        trim: true,
    },
    password: {
        type: String,
        required: false,
        trim: true,
    },
    imageName: {
        type: String,
        required: false,
        trim: true,
        default: null
    },
    otp: {
        type: Number,
        required: false,
        trim: true,
    },
    emailNotification: {
        type: Boolean,
        required: false,
        trim: true,
        default: function () {
            if (this.role == 'Business') {
                return;
            }
            if (this.role == 'User') {
                return false;
            }
        }
    },
    textNotification: {
        type: Boolean,
        required: false,
        trim: true,
        default: function () {
            if (this.role == 'Business') {
                return;
            }
            if (this.role == 'User') {
                return false;
            }
        }
    },
    inAppNotification: {
        type: Boolean,
        required: false,
        trim: true,
        default: function () {
            if (this.role == 'Business') {
                return;
            }
            if (this.role == 'User') {
                return false;
            }
        }
    },
    notification: {
        type: String,
        required: false,
        trim: true,
        default: function () {
            if (this.role == 'Business') {
                return;
            }
            if (this.role == 'User') {
                return "on";
            }
        }
    },
    stripe_id: {
        type: String,
        required: false,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: false
    },
    block: {
        type: Boolean,
        default: false
    },
    isVerified: {
        type: Number,
        trim: true,
        default: function () {
            if (this.role == 'Business') {
                return;
            }
            if (this.role == 'User') {
                return 0;
            }
        }
    },
    user_social_token: {
        type: String,
        required: false,
        trim: true,
        default: function () {
            if (this.role == 'Business') {
                return;
            }
            if (this.role == 'User') {
                return null;
            }
        }
    },
    user_social_type: {
        type: String,
        required: false,
        trim: true,
        default: function () {
            if (this.role == 'Business') {
                return;
            }
            if (this.role == 'User') {
                return null;
            }
        }
    },
    user_device_type: {
        type: String,
        required: false,
        trim: true,
        default: function () {
            if (this.role == 'Business') {
                return;
            }
            if (this.role == 'User') {
                return null;
            }
        }
    },
    user_device_token: {
        type: String,
        required: false,
        trim: true,
        default: function () {
            if (this.role == 'Business') {
                return;
            }
            if (this.role == 'User') {
                return null;
            }
        }
    },
    token: {
        type: String,
        default: null,
        required: false
    },
    role: {
        type: String,
        enum: ["User", "Business"],
        default: "User"
    },
    branchLocations: {
        type: Object,
        name: [{
            type: String,
            required: false,
        }],
        coordinates: [{
            type: [Number],
            required: false
        }],
        required: false
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: false,
            default: "Point"
        },
        coordinates: {
            type: [Number],
            required: false
        }
    },
}, {
    timestamps: true
});

userSchema.pre('save', function (next) {
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

userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ userId: user._id }, process.env.secret_Key)
    user.token = token;
    await user.save();
    return token;
}

userSchema.methods.comparePassword = function (candidatePassword) {
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
mongoose.model('Users', userSchema);
