require("dotenv").config();
const connectDB = require("./config/db");
const app = require("./app");

const seedAdmin = async () => {
  const User = require('./models/User');
  const adminExists = await User.findOne({ role: 'admin' });
  if (!adminExists) {
    const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'adminpassword123';
    console.log('No admin user found. Auto-seeding default system administrator...');
    await User.create({
      name: 'System Administrator',
      email: process.env.ADMIN_DEFAULT_EMAIL || 'admin@scrs.com',
      password: defaultPassword,
      role: 'admin'
    });
    console.log(`Default administrator account created! Set ADMIN_DEFAULT_EMAIL/ADMIN_DEFAULT_PASSWORD in .env`);
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
