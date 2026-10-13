
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  const user = await User.findOneAndUpdate(
    { email: "asrithareddy2008@gmail.com" },
    { $set: { role: "admin" } },
    { new: true }
  );

  console.log(user ? "Admin access granted!" : "Account not found. Sign up first.");
  await mongoose.disconnect();
}

main().catch(console.error);
