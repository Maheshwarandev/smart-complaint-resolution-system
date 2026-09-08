const dns = require('node:dns');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

try {
  dns.setDefaultResultOrder('ipv4first');
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore
}

const mongoose = require('mongoose');
const fs = require('fs');

const User = require('./models/User');
const Complaint = require('./models/Complaint');
const Notification = require('./models/Notification');

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://maheshwaran852485:GQPnvoAfpe9LsoPH@cluster0.t9zyrqz.mongodb.net/scrs_db?retryWrites=true&w=majority";

async function seedTestingData() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected successfully!');

  console.log('\n--- 🧹 STEP 1: DELETING PREVIOUS DATA ---');
  const delComplaints = await Complaint.deleteMany({});
  const delUsers = await User.deleteMany({});
  const delNotifs = await Notification.deleteMany({});
  console.log(`Deleted ${delComplaints.deletedCount} complaints, ${delUsers.deletedCount} users, and ${delNotifs.deletedCount} notifications.`);

  console.log('\n--- 👥 STEP 2: CREATING 2 ADMINS, 6 AGENTS, 10 USERS ---');

  // 1. Admins (2)
  const adminData = [
    {
      name: "Chief Admin",
      email: "admin@scrs.com",
      password: "adminpassword123",
      role: "admin",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
    },
    {
      name: "Operations Admin",
      email: "ops.admin@scrs.com",
      password: "AdminPass123!",
      role: "admin",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
    }
  ];

  // 2. Agents (6)
  const agentData = [
    {
      name: "Alex Mercer",
      email: "agent.alex@scrs.com",
      password: "AgentPass123!",
      role: "agent",
      agentSecurityCode: "AGNT01",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80"
    },
    {
      name: "Maya Lin",
      email: "agent.maya@scrs.com",
      password: "AgentPass123!",
      role: "agent",
      agentSecurityCode: "AGNT02",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80"
    },
    {
      name: "Samuel Vance",
      email: "agent.samuel@scrs.com",
      password: "AgentPass123!",
      role: "agent",
      agentSecurityCode: "AGNT03",
      avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80"
    },
    {
      name: "Elena Rostova",
      email: "agent.elena@scrs.com",
      password: "AgentPass123!",
      role: "agent",
      agentSecurityCode: "AGNT04",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80"
    },
    {
      name: "Kevin Hart",
      email: "agent.kevin@scrs.com",
      password: "AgentPass123!",
      role: "agent",
      agentSecurityCode: "AGNT05",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80"
    },
    {
      name: "Rachel Green",
      email: "agent.rachel@scrs.com",
      password: "AgentPass123!",
      role: "agent",
      agentSecurityCode: "AGNT06",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80"
    }
  ];

  // 3. Users (10)
  const userData = [
    { name: "John Doe", email: "john.doe@scrs.com", password: "Password123!", role: "user" },
    { name: "Sarah Connor", email: "sarah.connor@scrs.com", password: "Password123!", role: "user" },
    { name: "Michael Chang", email: "michael.chang@scrs.com", password: "Password123!", role: "user" },
    { name: "Emily Blunt", email: "emily.blunt@scrs.com", password: "Password123!", role: "user" },
    { name: "David Miller", email: "david.miller@scrs.com", password: "Password123!", role: "user" },
    { name: "Jessica Alba", email: "jessica.alba@scrs.com", password: "Password123!", role: "user" },
    { name: "Robert Downey", email: "robert.downey@scrs.com", password: "Password123!", role: "user" },
    { name: "Priya Sharma", email: "priya.sharma@scrs.com", password: "Password123!", role: "user" },
    { name: "Daniel Craig", email: "daniel.craig@scrs.com", password: "Password123!", role: "user" },
    { name: "Lisa Kudrow", email: "lisa.kudrow@scrs.com", password: "Password123!", role: "user" },
  ];

  const createdAdmins = await Promise.all(adminData.map(d => User.create(d)));
  const createdAgents = await Promise.all(agentData.map(d => User.create(d)));
  const createdUsers = await Promise.all(userData.map(d => User.create(d)));

  console.log(`Created ${createdAdmins.length} Admins.`);
  console.log(`Created ${createdAgents.length} Agents.`);
  console.log(`Created ${createdUsers.length} Users.`);

  console.log('\n--- 📝 STEP 3: CREATING 20 REALISTIC ENTERPRISE COMPLAINTS ---');

  const now = Date.now();
  const h = 3600000;
  const d = 24 * h;

  const rawComplaints = [
    // 1. Critical Network Outage (In Progress, urgent deadline)
    {
      user: createdUsers[0]._id, // John Doe
      assignedTo: createdAgents[0]._id, // Alex Mercer
      title: "Core Switch Failure in Server Room B",
      description: "Main backbone switch in Server Room B went offline at 09:15 AM. 45 workstations on Floor 3 have lost LAN and internet connectivity.",
      category: "network",
      priority: "critical",
      status: "In Progress",
      createdAt: new Date(now - 2 * h),
      slaDeadline: new Date(now + 2 * h),
      slaBreached: false,
      history: [
        { action: "Created", performedBy: "John Doe", role: "user", timestamp: new Date(now - 2 * h) },
        { action: "Auto-Assigned", prevValue: "Unassigned", newValue: "Alex Mercer", performedBy: "Load Balancer", role: "system", timestamp: new Date(now - 2 * h) },
        { action: "Status Changed", prevValue: "Open", newValue: "In Progress", performedBy: "Alex Mercer", role: "agent", timestamp: new Date(now - 1.5 * h) }
      ],
      comments: [
        { user: createdAgents[0]._id, text: "Dispatching hardware engineer with backup Cisco Catalyst switch now.", createdAt: new Date(now - 1.2 * h) },
        { user: createdUsers[0]._id, text: "Thanks Alex, Floor 3 team is on standby.", createdAt: new Date(now - 1 * h) }
      ]
    },
    // 2. High Finance Issue (Open, awaiting agent)
    {
      user: createdUsers[1]._id, // Sarah Connor
      assignedTo: null,
      title: "Overcharged on AWS Enterprise Support Invoice",
      description: "Monthly invoice #INV-88219 includes $1,450 for unprovisioned EC2 instances in us-west-2. Requesting refund and audit.",
      category: "finance",
      priority: "high",
      status: "Open",
      createdAt: new Date(now - 4 * h),
      slaDeadline: new Date(now + 20 * h),
      slaBreached: false,
      history: [
        { action: "Created", performedBy: "Sarah Connor", role: "user", timestamp: new Date(now - 4 * h) }
      ],
      comments: []
    },
    // 3. Critical Hardware failure (Overdue SLA)
    {
      user: createdUsers[2]._id, // Michael Chang
      assignedTo: createdAgents[1]._id, // Maya Lin
      title: "Production Database SSD RAID Degradation",
      description: "Primary database node reported 2 failed NVMe drives in RAID-10 array. Performance is heavily degraded.",
      category: "hardware",
      priority: "critical",
      status: "In Progress",
      createdAt: new Date(now - 8 * h),
      slaDeadline: new Date(now - 4 * h), // Missed 4h SLA
      slaBreached: true,
      history: [
        { action: "Created", performedBy: "Michael Chang", role: "user", timestamp: new Date(now - 8 * h) },
        { action: "Assigned", prevValue: "Unassigned", newValue: "Maya Lin", performedBy: "Chief Admin", role: "admin", timestamp: new Date(now - 7 * h) }
      ],
      comments: [
        { user: createdAgents[1]._id, text: "Hot-swap drives were delayed at datacenter reception. Rebuilding RAID currently at 65%.", createdAt: new Date(now - 2 * h) }
      ]
    },
    // 4. Medium Software Bug (Resolved, 5-Star CSAT)
    {
      user: createdUsers[3]._id, // Emily Blunt
      assignedTo: createdAgents[2]._id, // Samuel Vance
      title: "SSO Login Token Expiry Loop on Firefox",
      description: "Users on Firefox 128 are getting stuck in an infinite redirect loop when accessing the internal portal.",
      category: "software",
      priority: "medium",
      status: "Resolved",
      resolutionNote: "Updated SameSite cookie attributes and cleared stale Redis session tokens. Verified on all Firefox builds.",
      createdAt: new Date(now - 30 * h),
      slaDeadline: new Date(now + 18 * h),
      resolvedAt: new Date(now - 4 * h),
      slaBreached: false,
      rating: {
        score: 5,
        feedback: "Samuel resolved the cookie issue rapidly and even provided browser guidance for our remote staff!",
        ratedAt: new Date(now - 3 * h)
      },
      history: [
        { action: "Created", performedBy: "Emily Blunt", role: "user", timestamp: new Date(now - 30 * h) },
        { action: "Assigned", prevValue: "Unassigned", newValue: "Samuel Vance", performedBy: "Load Balancer", role: "system", timestamp: new Date(now - 30 * h) },
        { action: "Status Changed", prevValue: "In Progress", newValue: "Resolved", performedBy: "Samuel Vance", role: "agent", timestamp: new Date(now - 4 * h) }
      ],
      comments: [
        { user: createdAgents[2]._id, text: "Patch deployed to v2.4.1. Please test your login flow.", createdAt: new Date(now - 5 * h) },
        { user: createdUsers[3]._id, text: "Working perfectly now, thank you!", createdAt: new Date(now - 3.5 * h) }
      ]
    },
    // 5. Low Maintenance Request (Closed, 4-Star CSAT)
    {
      user: createdUsers[4]._id, // David Miller
      assignedTo: createdAgents[3]._id, // Elena Rostova
      title: "Ergonomic Desk Adjustment on 4th Floor Pod 12",
      description: "Height-adjustable motorized desk mechanism is stuck at lowest setting.",
      category: "maintenance",
      priority: "low",
      status: "Closed",
      resolutionNote: "Replaced motor control box and recalibrated presets.",
      createdAt: new Date(now - 4 * d),
      slaDeadline: new Date(now - 1 * d),
      resolvedAt: new Date(now - 2 * d),
      slaBreached: false,
      rating: {
        score: 4,
        feedback: "Fixed well within the SLA timeline.",
        ratedAt: new Date(now - 2 * d)
      },
      history: [
        { action: "Created", performedBy: "David Miller", role: "user", timestamp: new Date(now - 4 * d) },
        { action: "Resolved", prevValue: "In Progress", newValue: "Resolved", performedBy: "Elena Rostova", role: "agent", timestamp: new Date(now - 2 * d) },
        { action: "Closed", prevValue: "Resolved", newValue: "Closed", performedBy: "Chief Admin", role: "admin", timestamp: new Date(now - 1 * d) }
      ]
    },
    // 6. High HR Payroll Discrepancy (In Progress)
    {
      user: createdUsers[5]._id, // Jessica Alba
      assignedTo: createdAgents[4]._id, // Kevin Hart
      title: "Missing Overtime Hours on August Payslip",
      description: "Logged 16 hours of weekend on-call duty in August, but payslip shows base salary only.",
      category: "hr",
      priority: "high",
      status: "In Progress",
      createdAt: new Date(now - 12 * h),
      slaDeadline: new Date(now + 12 * h),
      slaBreached: false,
      history: [
        { action: "Created", performedBy: "Jessica Alba", role: "user", timestamp: new Date(now - 12 * h) },
        { action: "Assigned", prevValue: "Unassigned", newValue: "Kevin Hart", performedBy: "Load Balancer", role: "system", timestamp: new Date(now - 12 * h) }
      ],
      comments: [
        { user: createdAgents[4]._id, text: "Reviewing timecard logs with HR payroll manager. Supplementary adjustment will be issued.", createdAt: new Date(now - 6 * h) }
      ]
    },
    // 7. Medium Network Issue (Open)
    {
      user: createdUsers[6]._id, // Robert Downey
      assignedTo: null,
      title: "Intermittent VPN Disconnects in Asia-Pacific Region",
      description: "Remote engineers connecting through Singapore gateway experience dropouts every 20-30 minutes.",
      category: "network",
      priority: "medium",
      status: "Open",
      createdAt: new Date(now - 6 * h),
      slaDeadline: new Date(now + 42 * h),
      slaBreached: false,
      history: [{ action: "Created", performedBy: "Robert Downey", role: "user", timestamp: new Date(now - 6 * h) }]
    },
    // 8. Low Software Feature Request (Open)
    {
      user: createdUsers[7]._id, // Priya Sharma
      assignedTo: null,
      title: "Dark Mode Contrast Enhancement in Reporting Export",
      description: "Exported PDF summaries in dark mode have low contrast when printed in grayscale.",
      category: "software",
      priority: "low",
      status: "Open",
      createdAt: new Date(now - 18 * h),
      slaDeadline: new Date(now + 54 * h),
      slaBreached: false,
      history: [{ action: "Created", performedBy: "Priya Sharma", role: "user", timestamp: new Date(now - 18 * h) }]
    },
    // 9. Critical Security Alert (Resolved, 5-Star CSAT)
    {
      user: createdUsers[8]._id, // Daniel Craig
      assignedTo: createdAgents[5]._id, // Rachel Green
      title: "Phishing Email Campaign Detected Impersonating IT Support",
      description: "Multiple staff received emails from 'support-scrs-auth.com' asking for password resets.",
      category: "security",
      priority: "critical",
      status: "Resolved",
      resolutionNote: "Domain blocked on gateway firewall, suspicious emails purged from all inboxes, and SPF/DMARC policies reinforced.",
      createdAt: new Date(now - 10 * h),
      slaDeadline: new Date(now - 6 * h),
      resolvedAt: new Date(now - 8 * h),
      slaBreached: false,
      rating: {
        score: 5,
        feedback: "Exceptional speed in quarantining the malicious domain across our global offices!",
        ratedAt: new Date(now - 7 * h)
      },
      history: [
        { action: "Created", performedBy: "Daniel Craig", role: "user", timestamp: new Date(now - 10 * h) },
        { action: "Resolved", prevValue: "In Progress", newValue: "Resolved", performedBy: "Rachel Green", role: "agent", timestamp: new Date(now - 8 * h) }
      ]
    },
    // 10. High Hardware Malfunction (In Progress)
    {
      user: createdUsers[9]._id, // Lisa Kudrow
      assignedTo: createdAgents[0]._id, // Alex Mercer
      title: "Conference Room 3A Ceiling Projector Flickering",
      description: "HDMI output blinks green every 10 seconds during executive presentations.",
      category: "hardware",
      priority: "high",
      status: "In Progress",
      createdAt: new Date(now - 14 * h),
      slaDeadline: new Date(now + 10 * h),
      slaBreached: false,
      history: [
        { action: "Created", performedBy: "Lisa Kudrow", role: "user", timestamp: new Date(now - 14 * h) },
        { action: "Assigned", prevValue: "Unassigned", newValue: "Alex Mercer", performedBy: "Load Balancer", role: "system", timestamp: new Date(now - 14 * h) }
      ]
    },
    // 11. Medium Electrical / Maintenance (In Progress)
    {
      user: createdUsers[0]._id, // John Doe
      assignedTo: createdAgents[1]._id, // Maya Lin
      title: "HVAC Temperature Sensor Failure Floor 2",
      description: "Air conditioning thermostat is stuck at 16°C causing extreme cold in engineering section.",
      category: "electrical",
      priority: "medium",
      status: "In Progress",
      createdAt: new Date(now - 20 * h),
      slaDeadline: new Date(now + 28 * h),
      slaBreached: false,
      history: [
        { action: "Created", performedBy: "John Doe", role: "user", timestamp: new Date(now - 20 * h) },
        { action: "Assigned", prevValue: "Unassigned", newValue: "Maya Lin", performedBy: "Operations Admin", role: "admin", timestamp: new Date(now - 18 * h) }
      ]
    },
    // 12. High Finance License Charge (Resolved, 5-Star CSAT)
    {
      user: createdUsers[1]._id, // Sarah Connor
      assignedTo: createdAgents[2]._id, // Samuel Vance
      title: "Duplicate SaaS License Charge for Figma Org",
      description: "Figma annual seat renewal was billed twice on corporate card #4492.",
      category: "finance",
      priority: "high",
      status: "Resolved",
      resolutionNote: "Contacted vendor billing department. Reversal of $3,200 confirmed with credit memo #CM-991.",
      createdAt: new Date(now - 22 * h),
      slaDeadline: new Date(now + 2 * h),
      resolvedAt: new Date(now - 3 * h),
      slaBreached: false,
      rating: {
        score: 5,
        feedback: "Vendor dispute was settled within hours. Thanks Samuel!",
        ratedAt: new Date(now - 2 * h)
      },
      history: [
        { action: "Created", performedBy: "Sarah Connor", role: "user", timestamp: new Date(now - 22 * h) },
        { action: "Resolved", prevValue: "In Progress", newValue: "Resolved", performedBy: "Samuel Vance", role: "agent", timestamp: new Date(now - 3 * h) }
      ]
    },
    // 13. Critical Database Deadlock (Overdue)
    {
      user: createdUsers[2]._id, // Michael Chang
      assignedTo: createdAgents[3]._id, // Elena Rostova
      title: "Transaction Deadlocks on Payment Processing Microservice",
      description: "Postgres write locks spike during checkout batch updates resulting in 504 gateway timeouts.",
      category: "software",
      priority: "critical",
      status: "In Progress",
      createdAt: new Date(now - 6 * h),
      slaDeadline: new Date(now - 2 * h),
      slaBreached: true,
      history: [
        { action: "Created", performedBy: "Michael Chang", role: "user", timestamp: new Date(now - 6 * h) },
        { action: "Assigned", prevValue: "Unassigned", newValue: "Elena Rostova", performedBy: "Chief Admin", role: "admin", timestamp: new Date(now - 5 * h) }
      ],
      comments: [
        { user: createdAgents[3]._id, text: "Profiling isolation levels and optimizing SELECT FOR UPDATE row locks.", createdAt: new Date(now - 1 * h) }
      ]
    },
    // 14. Medium HR Benefits Inquiry (Resolved, 4-Star CSAT)
    {
      user: createdUsers[3]._id, // Emily Blunt
      assignedTo: createdAgents[4]._id, // Kevin Hart
      title: "Health Insurance Card Replacement for New Dependent",
      description: "Requested digital copy of policy ID for newly enrolled dependent.",
      category: "hr",
      priority: "medium",
      status: "Resolved",
      resolutionNote: "Digital policy document and temporary member card dispatched via secure email.",
      createdAt: new Date(now - 36 * h),
      slaDeadline: new Date(now + 12 * h),
      resolvedAt: new Date(now - 10 * h),
      slaBreached: false,
      rating: {
        score: 4,
        feedback: "Received the policy cards quickly.",
        ratedAt: new Date(now - 8 * h)
      },
      history: [
        { action: "Created", performedBy: "Emily Blunt", role: "user", timestamp: new Date(now - 36 * h) },
        { action: "Resolved", prevValue: "In Progress", newValue: "Resolved", performedBy: "Kevin Hart", role: "agent", timestamp: new Date(now - 10 * h) }
      ]
    },
    // 15. Low Hardware Peripherals (Open)
    {
      user: createdUsers[4]._id, // David Miller
      assignedTo: null,
      title: "Wireless Mouse Replacement for Workstation 104",
      description: "Left click sensor on Logitech MX Master is double-clicking intermittently.",
      category: "hardware",
      priority: "low",
      status: "Open",
      createdAt: new Date(now - 15 * h),
      slaDeadline: new Date(now + 57 * h),
      slaBreached: false,
      history: [{ action: "Created", performedBy: "David Miller", role: "user", timestamp: new Date(now - 15 * h) }]
    },
    // 16. High Network Bandwidth Cap (In Progress)
    {
      user: createdUsers[5]._id, // Jessica Alba
      assignedTo: createdAgents[5]._id, // Rachel Green
      title: "Video Streaming Throttling on Design Team Subnet",
      description: "Figma and Zoom media streams dropping frames due to traffic policing rules on VLAN 40.",
      category: "network",
      priority: "high",
      status: "In Progress",
      createdAt: new Date(now - 16 * h),
      slaDeadline: new Date(now + 8 * h),
      slaBreached: false,
      history: [
        { action: "Created", performedBy: "Jessica Alba", role: "user", timestamp: new Date(now - 16 * h) },
        { action: "Assigned", prevValue: "Unassigned", newValue: "Rachel Green", performedBy: "Load Balancer", role: "system", timestamp: new Date(now - 16 * h) }
      ]
    },
    // 17. Medium Infrastructure Access (Resolved, 5-Star CSAT)
    {
      user: createdUsers[6]._id, // Robert Downey
      assignedTo: createdAgents[0]._id, // Alex Mercer
      title: "Access Badge Clearance for R&D Prototype Lab",
      description: "Keycard needs clearance added for Security Door 4B in the Hardware Lab.",
      category: "infrastructure",
      priority: "medium",
      status: "Resolved",
      resolutionNote: "Security group badge profile updated and verified at card reader.",
      createdAt: new Date(now - 28 * h),
      slaDeadline: new Date(now + 20 * h),
      resolvedAt: new Date(now - 6 * h),
      slaBreached: false,
      rating: {
        score: 5,
        feedback: "Access activated instantly.",
        ratedAt: new Date(now - 5 * h)
      },
      history: [
        { action: "Created", performedBy: "Robert Downey", role: "user", timestamp: new Date(now - 28 * h) },
        { action: "Resolved", prevValue: "In Progress", newValue: "Resolved", performedBy: "Alex Mercer", role: "agent", timestamp: new Date(now - 6 * h) }
      ]
    },
    // 18. Low General Inquiry (Closed)
    {
      user: createdUsers[7]._id, // Priya Sharma
      assignedTo: createdAgents[1]._id, // Maya Lin
      title: "Visitor Parking Permit Registration for Next Week",
      description: "Requesting parking slot reservation for 3 external auditors visiting on Wednesday.",
      category: "general",
      priority: "low",
      status: "Closed",
      resolutionNote: "Visitor passes #P-101, #P-102, #P-103 reserved at front desk.",
      createdAt: new Date(now - 5 * d),
      slaDeadline: new Date(now - 2 * d),
      resolvedAt: new Date(now - 3 * d),
      slaBreached: false,
      history: [
        { action: "Created", performedBy: "Priya Sharma", role: "user", timestamp: new Date(now - 5 * d) },
        { action: "Closed", prevValue: "Resolved", newValue: "Closed", performedBy: "Operations Admin", role: "admin", timestamp: new Date(now - 2 * d) }
      ]
    },
    // 19. High Software Crash on Export (Open)
    {
      user: createdUsers[8]._id, // Daniel Craig
      assignedTo: null,
      title: "Memory Leak Crash on Large Dataset PDF Export",
      description: "Generating analytics reports with over 5,000 rows causes Chrome tab memory allocation crash.",
      category: "software",
      priority: "high",
      status: "Open",
      createdAt: new Date(now - 8 * h),
      slaDeadline: new Date(now + 16 * h),
      slaBreached: false,
      history: [{ action: "Created", performedBy: "Daniel Craig", role: "user", timestamp: new Date(now - 8 * h) }]
    },
    // 20. Critical Electrical / Power Supply Failure (Resolved, 5-Star CSAT)
    {
      user: createdUsers[9]._id, // Lisa Kudrow
      assignedTo: createdAgents[2]._id, // Samuel Vance
      title: "UPS Battery Backup Audible Alarm in Data Closet 2",
      description: "APC Smart-UPS 3000VA reporting battery replacement required and emitting continuous alert tone.",
      category: "electrical",
      priority: "critical",
      status: "Resolved",
      resolutionNote: "Replaced battery cartridge RBC55 and ran self-test diagnostic. All power rails nominal.",
      createdAt: new Date(now - 5 * h),
      slaDeadline: new Date(now - 1 * h),
      resolvedAt: new Date(now - 2 * h),
      slaBreached: false,
      rating: {
        score: 5,
        feedback: "Samuel replaced the UPS batteries within 3 hours. Critical disaster averted!",
        ratedAt: new Date(now - 1.5 * h)
      },
      history: [
        { action: "Created", performedBy: "Lisa Kudrow", role: "user", timestamp: new Date(now - 5 * h) },
        { action: "Resolved", prevValue: "In Progress", newValue: "Resolved", performedBy: "Samuel Vance", role: "agent", timestamp: new Date(now - 2 * h) }
      ]
    }
  ];

  const createdComplaints = await Promise.all(rawComplaints.map(c => Complaint.create(c)));
  console.log(`Created ${createdComplaints.length} Complaints.`);

  // Generate In-App Notifications for agents and users
  console.log('\n--- 🔔 STEP 4: GENERATING NOTIFICATIONS ---');
  const sampleNotifs = [
    {
      user: createdAgents[0]._id,
      title: "⚡ New Ticket Auto-Assigned",
      message: "You were assigned to #SCR-" + createdComplaints[0]._id.toString().slice(-4).toUpperCase() + ": Core Switch Failure in Server Room B",
      type: "assignment",
      link: "/agent/complaints",
      read: false
    },
    {
      user: createdUsers[0]._id,
      title: "💬 New Reply on Ticket",
      message: "Alex Mercer posted an update on your complaint.",
      type: "comment",
      link: "/complaints",
      read: false
    },
    {
      user: createdAgents[1]._id,
      title: "⚠️ Critical SLA Approaching",
      message: "Ticket #SCR-" + createdComplaints[2]._id.toString().slice(-4).toUpperCase() + " deadline has passed.",
      type: "status",
      link: "/agent/complaints",
      read: false
    }
  ];
  await Promise.all(sampleNotifs.map(n => Notification.create(n)));
  console.log(`Created sample in-app notifications.`);

  console.log('\n--- 📄 STEP 5: WRITING TXT CREDENTIALS FILE ---');

  const txtContent = `========================================================================================
                      SCRS ENTERPRISE — TESTING DATASET & CREDENTIALS
========================================================================================
Generated on: ${new Date().toISOString()}
Database: MongoDB Atlas (scrs_db)
Backend API: http://localhost:5000 / https://scrs-backend-7gmd.onrender.com
Frontend UI: http://localhost:3000 / https://scrs-frontend.onrender.com

----------------------------------------------------------------------------------------
1. ADMINISTRATOR ACCOUNTS (2 Admins)
----------------------------------------------------------------------------------------
[Role: admin] Full system access, users & agents management, analytics, SLA monitoring.

  #1 Chief Admin
     Email:    admin@scrs.com
     Password: adminpassword123
     Role:     admin

  #2 Operations Admin
     Email:    ops.admin@scrs.com
     Password: AdminPass123!
     Role:     admin

----------------------------------------------------------------------------------------
2. SUPPORT ENGINEER / AGENT ACCOUNTS (6 Agents)
----------------------------------------------------------------------------------------
[Role: agent] Queue resolution, ticket claiming, inline status updates, discussions.

  #1 Alex Mercer
     Email:     agent.alex@scrs.com
     Password:  AgentPass123!
     Passkey:   AGNT01

  #2 Maya Lin
     Email:     agent.maya@scrs.com
     Password:  AgentPass123!
     Passkey:   AGNT02

  #3 Samuel Vance
     Email:     agent.samuel@scrs.com
     Password:  AgentPass123!
     Passkey:   AGNT03

  #4 Elena Rostova
     Email:     agent.elena@scrs.com
     Password:  AgentPass123!
     Passkey:   AGNT04

  #5 Kevin Hart
     Email:     agent.kevin@scrs.com
     Password:  AgentPass123!
     Passkey:   AGNT05

  #6 Rachel Green
     Email:     agent.rachel@scrs.com
     Password:  AgentPass123!
     Passkey:   AGNT06

----------------------------------------------------------------------------------------
3. STANDARD USER ACCOUNTS (10 Users)
----------------------------------------------------------------------------------------
[Role: user] Complaint submission, tracking, discussions, 5-star resolution rating.

  #1  John Doe
      Email:    john.doe@scrs.com
      Password: Password123!

  #2  Sarah Connor
      Email:    sarah.connor@scrs.com
      Password: Password123!

  #3  Michael Chang
      Email:    michael.chang@scrs.com
      Password: Password123!

  #4  Emily Blunt
      Email:    emily.blunt@scrs.com
      Password: Password123!

  #5  David Miller
      Email:    david.miller@scrs.com
      Password: Password123!

  #6  Jessica Alba
      Email:    jessica.alba@scrs.com
      Password: Password123!

  #7  Robert Downey
      Email:    robert.downey@scrs.com
      Password: Password123!

  #8  Priya Sharma
      Email:    priya.sharma@scrs.com
      Password: Password123!

  #9  Daniel Craig
      Email:    daniel.craig@scrs.com
      Password: Password123!

  #10 Lisa Kudrow
      Email:    lisa.kudrow@scrs.com
      Password: Password123!

----------------------------------------------------------------------------------------
4. COMPLAINTS DATASET SUMMARY (20 Complaints)
----------------------------------------------------------------------------------------
Total Complaints: 20
- Open:        5
- In Progress: 7
- Resolved:    6
- Closed:      2

SLA Distribution:
- Critical (4h SLA):  5 tickets
- High (24h SLA):      6 tickets
- Medium (48h SLA):    5 tickets
- Low (72h SLA):       4 tickets
- Overdue Tickets:     2 tickets (#3, #13)
- Rated Resolutions:   6 tickets (Avg CSAT: 4.8 ★)

List of 20 Complaints:
  1.  [Critical | In Progress] Core Switch Failure in Server Room B (Assigned: Alex Mercer)
  2.  [High     | Open       ] Overcharged on AWS Enterprise Support Invoice (Unassigned)
  3.  [Critical | In Progress] Production Database SSD RAID Degradation (🔴 Overdue | Maya Lin)
  4.  [Medium   | Resolved   ] SSO Login Token Expiry Loop on Firefox (★ 5.0 | Samuel Vance)
  5.  [Low      | Closed     ] Ergonomic Desk Adjustment on 4th Floor Pod 12 (★ 4.0 | Elena Rostova)
  6.  [High     | In Progress] Missing Overtime Hours on August Payslip (Kevin Hart)
  7.  [Medium   | Open       ] Intermittent VPN Disconnects in Asia-Pacific Region (Unassigned)
  8.  [Low      | Open       ] Dark Mode Contrast Enhancement in Reporting Export (Unassigned)
  9.  [Critical | Resolved   ] Phishing Email Campaign Impersonating IT Support (★ 5.0 | Rachel Green)
  10. [High     | In Progress] Conference Room 3A Ceiling Projector Flickering (Alex Mercer)
  11. [Medium   | In Progress] HVAC Temperature Sensor Failure Floor 2 (Maya Lin)
  12. [High     | Resolved   ] Duplicate SaaS License Charge for Figma Org (★ 5.0 | Samuel Vance)
  13. [Critical | In Progress] Transaction Deadlocks on Payment Processing Microservice (🔴 Overdue | Elena)
  14. [Medium   | Resolved   ] Health Insurance Card Replacement for New Dependent (★ 4.0 | Kevin Hart)
  15. [Low      | Open       ] Wireless Mouse Replacement for Workstation 104 (Unassigned)
  16. [High     | In Progress] Video Streaming Throttling on Design Team Subnet (Rachel Green)
  17. [Medium   | Resolved   ] Access Badge Clearance for R&D Prototype Lab (★ 5.0 | Alex Mercer)
  18. [Low      | Closed     ] Visitor Parking Permit Registration for Next Week (Maya Lin)
  19. [High     | Open       ] Memory Leak Crash on Large Dataset PDF Export (Unassigned)
  20. [Critical | Resolved   ] UPS Battery Backup Audible Alarm in Data Closet 2 (★ 5.0 | Samuel Vance)

========================================================================================
All test credentials and sample datasets are active in MongoDB Atlas!
========================================================================================
`;

  const txtPath = path.join(__dirname, '../TEST_CREDENTIALS_AND_DATA.txt');
  fs.writeFileSync(txtPath, txtContent, 'utf-8');
  console.log(`Saved credentials file to: ${txtPath}`);

  console.log('\n=========================================');
  console.log('🎉 SEEDING & RESET COMPLETE!');
  console.log('=========================================');
  await mongoose.disconnect();
  process.exit(0);
}

seedTestingData().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
