const mongoose = require('mongoose');
const MONGO_URI = process.env.MONGO_URI;

function mongoConnect() {
    mongoose.connect(MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("MongoDB Connection Success");
    })
    .catch((e) => {
        console.log("MongoDB Connection Error:", e);
    });
}

mongoConnect();