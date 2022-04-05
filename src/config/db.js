const mongoose = require("mongoose")
const { mongoURI } = require("config")

// config db
const connectDB = async () => {
  try{
  const conn = await mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  });

  console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold);
} catch (err) {
  console.error(err)
  process.exit(1)
}
};

module.exports = connectDB;
