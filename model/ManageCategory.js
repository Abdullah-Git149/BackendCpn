const mongoose = require('mongoose');

const manageCategorySchema = new mongoose.Schema({
     user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
     brandName: {
            type: [String],
            required: false
          },
     brandCategory: {
            type: [String],
            required: false
          }
}, {
    timestamps: true
});

mongoose.model('ManageCategory', manageCategorySchema);