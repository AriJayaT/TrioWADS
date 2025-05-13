const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Sample data for authentication (in a real app, this would be in a database)
const users = [
  { id: 1, email: 'admin@jellycat.com', password: 'admin123', role: 'admin', name: 'System Admin' },
  { id: 2, email: 'user@jellycat.com', password: 'user123', role: 'user', name: 'Regular User' }
];

// Sample data for dashboard
const dashboardData = {
  agents: [
    {
      id: 1,
      initials: 'SA',
      name: 'Sarah Anderson',
      responseTime: '6m',
      tickets: 28,
      resolution: '94%',
      status: 'Online'
    },
    {
      id: 2,
      initials: 'MT',
      name: 'Mike Thompson',
      responseTime: '11m',
      tickets: 23,
      resolution: '91%',
      status: 'Online'
    },
    {
      id: 3,
      initials: 'LC',
      name: 'Lisa Chen',
      responseTime: '15m',
      tickets: 19,
      resolution: '88%',
      status: 'Away'
    },
    {
      id: 4,
      initials: 'JW',
      name: 'James Wilson',
      responseTime: '10m',
      tickets: 25,
      resolution: '93%',
      status: 'Offline'
    }
  ],
  metrics: {
    activeAgents: '24/30',
    ticketVolume: 847,
    systemResponse: '99.9%',
    overallCSAT: 4.8
  },
  ticketDistribution: [
    {
      name: 'Product Issues',
      count: 245,
      change: '+5%',
      changeType: 'positive'
    },
    {
      name: 'Billing Support',
      count: 187,
      change: '-2%',
      changeType: 'negative'
    },
    {
      name: 'Technical Help',
      count: 156,
      change: '+8%',
      changeType: 'positive'
    },
    {
      name: 'General Inquiry',
      count: 259,
      change: '+3%',
      changeType: 'positive'
    }
  ]
};

// Routes
// Authentication endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    // In a real app, you would generate a JWT token here
    const token = 'sample-jwt-token';
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }
});

// Registration endpoint
app.post('/api/auth/signup', (req, res) => {
  const { name, email, phone, password } = req.body;
  
  // Check if user already exists
  if (users.find(u => u.email === email)) {
    return res.status(400).json({
      success: false,
      message: 'User with this email already exists'
    });
  }
  
  // Create new user (in a real app, save to database)
  const newUser = {
    id: users.length + 1,
    name,
    email,
    phone,
    password,
    role: 'user'
  };
  
  users.push(newUser);
  
  res.status(201).json({
    success: true,
    message: 'User created successfully',
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    }
  });
});

// Dashboard data endpoint
app.get('/api/dashboard', (req, res) => {
  res.json(dashboardData);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});