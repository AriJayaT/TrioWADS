// src/utils/seeder.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load models
const User = require('../models/User');
const Agent = require('../models/Agent');
const Ticket = require('../models/Ticket');

// Load env vars
dotenv.config({ path: './.env' });

// Make sure we have a MONGO_URI
if (!process.env.MONGO_URI) {
  console.error('MONGO_URI is not defined in environment variables');
  console.log('Please create a .env file with MONGO_URI defined');
  process.exit(1);
}

console.log('Connecting to MongoDB...');
// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Import sample data
const seedUsers = [
  {
    name: 'System Admin',
    email: 'admin@jellycat.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    name: 'Regular User',
    email: 'user@jellycat.com',
    password: 'user123',
    role: 'user'
  }
];

const seedAgents = [
  {
    name: 'Sarah Anderson',
    initials: 'SA',
    responseTime: '6m',
    tickets: 28,
    resolution: '94%',
    status: 'Online'
  },
  {
    name: 'Mike Thompson',
    initials: 'MT',
    responseTime: '11m',
    tickets: 23,
    resolution: '91%',
    status: 'Online'
  },
  {
    name: 'Lisa Chen',
    initials: 'LC',
    responseTime: '15m',
    tickets: 19,
    resolution: '88%',
    status: 'Away'
  },
  {
    name: 'James Wilson',
    initials: 'JW',
    responseTime: '10m',
    tickets: 25,
    resolution: '93%',
    status: 'Offline'
  }
];

// Import into DB
const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Agent.deleteMany();
    await Ticket.deleteMany();

    console.log('Data cleared...');

    // Hash passwords
    const hashedUsers = await Promise.all(
      seedUsers.map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        return user;
      })
    );

    // Create users
    const createdUsers = await User.create(hashedUsers);
    console.log('Users imported...');

    // Create agents
    await Agent.create(seedAgents);
    console.log('Agents imported...');

    // Create sample tickets
    const admin = createdUsers[0];
    const user = createdUsers[1];

    const sampleTickets = [
      {
        category: 'Product Issues',
        subject: 'Broken item received',
        description: 'I received a damaged Jellycat toy in the mail today.',
        status: 'Open',
        priority: 'High',
        createdBy: user._id
      },
      {
        category: 'Billing Support',
        subject: 'Double charged for order',
        description: 'I was charged twice for order #12345 on my credit card.',
        status: 'In Progress',
        priority: 'Urgent',
        createdBy: user._id
      },
      {
        category: 'Technical Help',
        subject: 'Cannot access my account',
        description: 'I am unable to log in to my account after changing my password.',
        status: 'Open',
        priority: 'Medium',
        createdBy: user._id
      },
      {
        category: 'General Inquiry',
        subject: 'Product availability question',
        description: 'When will the limited edition dragon be back in stock?',
        status: 'Closed',
        priority: 'Low',
        createdBy: user._id
      }
    ];

    await Ticket.create(sampleTickets);
    console.log('Tickets imported...');

    console.log('Data import complete!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await User.deleteMany();
    await Agent.deleteMany();
    await Ticket.deleteMany();

    console.log('Data destroyed...');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Check command line arguments
if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
} else {
  console.log('Please use -i to import or -d to delete data');
  process.exit();
}