# Jellycat Support Server

Backend server for Jellycat Support customer service portal.

## Setup Instructions

### Prerequisites

- Node.js (v14+)
- MongoDB (local or remote instance)

### Installation

1. Install dependencies:

```bash
cd server
npm install
```

2. Create a `.env` file in the `/server` directory with the following variables:

```
# Database Connection
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority

# JWT Secret for authentication
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRATION=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# Cloudflare Tunnel Configuration (if using Cloudflare Zero Trust)
# TUNNEL_TOKEN=your_tunnel_token_here
```

3. Start the development server:

```bash
npm run dev
```

### MongoDB Atlas Setup

1. Create an account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Set up a database user with appropriate permissions
4. Get your connection string and add it to the `.env` file

### API Documentation

The API documentation is available at `http://localhost:5000/api-docs` when the server is running.

## Cloudflare Tunnel Integration

To use Cloudflare Tunnel Zero for secure remote access:

1. Install the Cloudflare CLI:

```bash
brew install cloudflare/cloudflare/cloudflared
```

2. Authenticate with Cloudflare:

```bash
cloudflared tunnel login
```

3. Create a tunnel:

```bash
cloudflared tunnel create jellycat-support
```

4. Configure your tunnel (create a config file named `config.yml`):

```yaml
tunnel: <tunnel-id>
credentials-file: /path/to/credentials.json
ingress:
  - hostname: api.yourdomain.com
    service: http://localhost:5000
  - service: http_status:404
```

5. Start the tunnel:

```bash
cloudflared tunnel run jellycat-support
```

6. Ensure your DNS records are set up to point to your tunnel.

## API Routes

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/password` - Change password

### Tickets

- `GET /api/tickets` - Get all tickets (filtered by role)
- `POST /api/tickets` - Create a new ticket
- `GET /api/tickets/:id` - Get specific ticket
- `PUT /api/tickets/:id` - Update ticket
- `POST /api/tickets/:id/replies` - Add reply to ticket
- `GET /api/tickets/stats` - Get ticket statistics (admin/agent)

### Knowledge Base

- `GET /api/articles` - Get all articles
- `GET /api/articles/:id` - Get specific article
- `POST /api/articles` - Create new article (admin/agent)
- `PUT /api/articles/:id` - Update article (admin/agent)
- `DELETE /api/articles/:id` - Delete article (admin/agent)
- `POST /api/articles/:id/rate` - Rate article (helpful/unhelpful) 