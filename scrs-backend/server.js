require("dotenv").config();
const connectDB = require("./config/db");
const app = require("./app");

const seedAdmin = async () => {
  const User = require('./models/User');
  const adminExists = await User.findOne({ role: 'admin' });
  if (!adminExists) {
    console.log('No admin user found. Auto-seeding default system administrator...');
    await User.create({
      name: 'System Administrator',
      email: 'admin@scrs.com',
      password: 'adminpassword123',
      role: 'admin'
    });
    console.log('Default administrator account (admin@scrs.com) created!');
  }
};

const start = async () => {
  await connectDB();
  await seedAdmin();

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();
