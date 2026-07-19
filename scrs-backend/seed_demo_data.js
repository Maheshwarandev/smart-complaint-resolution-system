require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://maheshwaran852485:GQPnvoAfpe9LsoPH@cluster0.t9zyrqz.mongodb.net/scrs_db?retryWrites=true&w=majority";

// Define mini schema inline to avoid imports
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' }
});

const ComplaintSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  status: { type: String, default: 'Open' },
  priority: { type: String, default: 'medium' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  resolutionNote: { type: String, default: '' },
  history: [
    {
      action: { type: String, required: true },
      prevValue: { type: String },
      newValue: { type: String },
      performedBy: { type: String, required: true },
      role: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Complaint = mongoose.models.Complaint || mongoose.model('Complaint', ComplaintSchema);

async function run() {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected successfully!");

    // Clean up existing demo users & complaints to avoid duplicate key errors
    console.log("Cleaning up previous demo records...");
    await User.deleteMany({ email: { $in: ['john@example.com', 'sarah@example.com', 'alex@example.com', 'emily@example.com'] } });
    await Complaint.deleteMany({ title: { $in: ['Laptop charger overheating', 'Cannot access company VPN', 'Office chair broken wheels', 'Email client crashing on startup'] } });

    console.log("Hashing passwords...");
    const salt = await bcrypt.genSalt(10);
    const userHash = await bcrypt.hash('userpassword123', salt);
    const agentHash = await bcrypt.hash('agentpassword123', salt);

    console.log("Seeding Users...");
    const john = await User.create({ name: "John Doe", email: "john@example.com", password: userHash, role: "user" });
    const sarah = await User.create({ name: "Sarah Smith", email: "sarah@example.com", password: userHash, role: "user" });
    
    console.log("Seeding Agents...");
    const alex = await User.create({ name: "Alex Turner", email: "alex@example.com", password: agentHash, role: "agent" });
    const emily = await User.create({ name: "Emily Watson", email: "emily@example.com", password: agentHash, role: "agent" });

    console.log("Seeding Complaints...");

    await Complaint.create({
      user: john._id,
      title: "Laptop charger overheating",
      description: "My laptop charger gets extremely hot (too hot to touch) after 15 minutes of use.",
      category: "hardware",
      priority: "high",
      status: "Open",
      history: [
        {
          action: "Complaint Created",
          performedBy: "John Doe",
          role: "user"
        }
      ]
    });

    await Complaint.create({
      user: john._id,
      title: "Cannot access company VPN",
      description: "Getting validation timeout errors when trying to connect to the secure VPN from home.",
      category: "network",
      priority: "medium",
      status: "In Progress",
      assignedTo: alex._id,
      history: [
        {
          action: "Complaint Created",
          performedBy: "John Doe",
          role: "user"
        },
        {
          action: "Status Updated",
          prevValue: "Open",
          newValue: "In Progress",
          performedBy: "System Administrator",
          role: "admin"
        },
        {
          action: "Assigned to Agent",
          newValue: "Alex Turner",
          performedBy: "System Administrator",
          role: "admin"
        }
      ]
    });

    await Complaint.create({
      user: sarah._id,
      title: "Office chair broken wheels",
      description: "One of the wheels on my rolling desk chair has broken off and the base is scraping the floor.",
      category: "infrastructure",
      priority: "low",
      status: "Open",
      history: [
        {
          action: "Complaint Created",
          performedBy: "Sarah Smith",
          role: "user"
        }
      ]
    });

    await Complaint.create({
      user: sarah._id,
      title: "Email client crashing on startup",
      description: "The mail application closes immediately after opening. Reinstalled it once but the crash persists.",
      category: "software",
      priority: "high",
      status: "Resolved",
      assignedTo: emily._id,
      resolutionNote: "Cleared local application data cache directory and reconfigured the server exchange login settings.",
      history: [
        {
          action: "Complaint Created",
          performedBy: "Sarah Smith",
          role: "user"
        },
        {
          action: "Status Updated",
          prevValue: "Open",
          newValue: "In Progress",
          performedBy: "System Administrator",
          role: "admin"
        },
        {
          action: "Assigned to Agent",
          newValue: "Emily Watson",
          performedBy: "System Administrator",
          role: "admin"
        },
        {
          action: "Complaint Resolved",
          prevValue: "In Progress",
          newValue: "Resolved",
          performedBy: "Emily Watson",
          role: "agent"
        }
      ]
    });

    console.log("=========================================");
    console.log("🎉 Seeding completed successfully!");
    console.log("Created users:");
    console.log("  1. John Doe (john@example.com) - password: userpassword123");
    console.log("  2. Sarah Smith (sarah@example.com) - password: userpassword123");
    console.log("Created agents:");
    console.log("  1. Alex Turner (alex@example.com) - password: agentpassword123");
    console.log("  2. Emily Watson (emily@example.com) - password: agentpassword123");
    console.log("=========================================");

  } catch (err) {
    console.error("Error seeding data:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

run();
