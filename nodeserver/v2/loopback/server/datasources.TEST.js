require('dotenv').config();

module.exports =
    {
        "mongodb": {
            "url": process.env.MONGO_CONNECTION,
            "name": "mongodb",
            "user": "",
            "connector": "mongodb"
        }
    }