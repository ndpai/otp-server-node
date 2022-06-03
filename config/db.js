const mongoose = require("mongoose");

let MONGO = "mongodb://localhost:27017";

const initiateMongo = async () => {
    try {
        await mongoose.connect(MONGO, {
           useNewUrlParser: true
        });
        console.log("Database connected");
    }

    catch(err) {
        console.log(err);
    }
}

module.exports = initiateMongo;
