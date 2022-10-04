const mongoose = require('mongoose');

const ManageCardSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    nameOnCard: {
        type: String,
        default: null,
        trim: true,
    },
    card_number: {
        type: String,
        default: null,
        trim: true,
    },
    exp_month: {
        type: Number,
        default: null,
        trim: true,
    },
    exp_year: {
        type: Number,
        default: null,
        trim: true,
    },
    card_cvc: {
        type: Number,
        default: null,
        trim: true,
    },
    stripe_token: {
        type: String,
        default: null,
        trim: true,
    },
    is_active: {
        type: Boolean,
        default: true,
        trim: true,
    },
    is_blocked: {
        type: Boolean,
        default: false,
        trim: true,
    },
}, {
    timestamps: true
});

mongoose.model('ManageCard', ManageCardSchema);
