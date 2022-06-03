const express = require("express");
const router = express.Router();
const User = require("../models/User");

const accountSID = "AC2e2083731941c17f8fa9d7ce7190b294";
const authToken = "833e515c8bf68c8a794850d3c8077508";
const fromPhone = "+19403082376";

const client = require('twilio')(accountSID, authToken);

router.post("/generate-otp", async (req, res) => {
    console.log(req.body);

    User.findOne(
        {phone: req.body.phone},
        (err, user) => {
            if (err) res.status(500).json("Something went wrong");
            if (!user) {
                let user = new User({
                    phone: req.body.phone,
                    otp: Math.floor(100000 + Math.random() * 900000),
                    otpGenerateAt: Date.now(),
                    otpExpiresAt: Date.now() + (5 * 60 * 1000)
                });

                user.save().then(doc => {
                    client.messages.create({
                        body: `Hello, your OTP to login is ${doc.otp}. Expires in 5 minutes.`,
                        to: doc.phone,
                        messagingServiceSid: 'MG483f52d877fd1ac20859a1df48b11763',
                        from: fromPhone
                    }).then((r) => res.status(200).json("User created, OTP sent"))
                        .catch((e) => res.status(500).json("Something went wrong."))
                });
            }

            if (user) {

                User.updateOne(
                    {phone: req.body.phone},
                    {
                        otp: Math.floor(100000 + Math.random() * 900000),
                        otpGenerateAt: Date.now(),
                        otpExpiresAt: Date.now() + (5 * 60 * 1000)
                    },
                    (err, updated) => {
                        if (err) res.status(500).json("Something went wrong.");
                        if (updated) {
                            User.findOne({
                                    phone: req.body.phone
                                },
                                (error, user) => {
                                    if (user) {
                                        client.messages.create({
                                            body: `Hello, your OTP to login is ${user.otp}. Expires in 5 minutes.`,
                                            to: req.body.phone,
                                            messagingServiceSid: 'MG483f52d877fd1ac20859a1df48b11763',
                                            from: fromPhone
                                        }).then((r) => res.status(200).json("OTP sent"))
                                            .catch((e) => res.status(500).json("Something went wrong."))
                                    }
                                }
                            )
                        }
                    }
                )
            }
        }
    )
});

router.post("/resend-otp", async (req, res) => {
    User.findOne({
            phone: req.body.phone
        },
        (err, user) => {
            if (err) res.status(500).json("Something went wrong");
            if (!user) res.status(404).json("User not found");
            if (user) {
                if (user.otpExpiresAt > Date.now()) {

                    client.messages.create({
                        from: fromPhone,
                        to: `${user.phone}`,
                        body: `Hello, your OTP to login is ${user.otp}. Expires in 5 minutes.`
                    }).then((message) => {
                        console.log(message);
                        res.status(200).json("OTP sent.");
                    }).catch((err) => {
                        console.log(err);
                        res.status(500).json("Something went wrong, please try again.");
                    });
                }

                if (user.otpExpiresAt < Date.now()) res.status(401).json("OTP expired, generate a new one");
            }
        });
});

router.post("/verify-otp", async (req, res) => {
    User.findOne(
        {phone: req.body.phone},
        (err, user) => {
            if (err) res.status(500).json("Something went wrong.");
            if (user) {

                if (user.otp === req.body.otp &&
                    user.otpExpiresAt > Date.now()
                )
                    res.status(200).json("OTP valid");

                if (user.otp !== req.body.otp &&
                    user.otpExpiresAt > Date.now()
                )
                    res.status(403).json("OTP not valid, please try again");

                if (user.otp === req.body.otp &&
                    user.otpExpiresAt < Date.now()
                )
                    res.status(401).json("OTP expired, please generate a new one");
            }
        }
    )
});

module.exports = router;
