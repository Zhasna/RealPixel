require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 8000 })
  .then(() => { console.log('connected'); process.exit(0); })
  .catch((err) => {
    console.log(err.message);
    console.dir(err.reason, { depth: 4 });
    process.exit(1);
  });
  