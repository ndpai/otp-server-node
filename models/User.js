const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
    phone: {
        type: String,
        default: ""
    },

    otp: {
        type: String,
        default: ""
    },

    otpGeneratedAt: {
        type: Date,
        default: null
    },

    otpExpiresAt: {
        type: Date,
        default: null
    }
});

module.exports = mongoose.model("User", UserSchema);
