const express = require("express");
const bodyParser = require("body-parser");
const initiateMongo = require("./config/db");
const userRoutes = require("./routes/userRoutes");

initiateMongo();
//InitiateMongoServer();

const app = express();
const PORT = process.env.PORT || 4001;

app.use(bodyParser.json());

app.use("/user", userRoutes);

app.get("/", (req, res) => {
   res.json({message: "API working"});
});

app.listen(PORT, () => {
    console.log(`App connected to ${PORT}`);
})
