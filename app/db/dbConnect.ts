import mongoose from "mongoose";

const mongo_uri = process.env.MONGO_URI as string;
if (!mongo_uri) {
  throw new Error("Please provide MONGO_URI in the .env file");
}

mongoose.set("strictQuery", true);

const dbConnect = async () => {
  try {
    if (mongoose.connection.readyState === 1) return true;
    await mongoose.connect(mongo_uri, { bufferCommands: false });
    return true;
  } catch (err) {
    return false;
  }
};

export default dbConnect;
