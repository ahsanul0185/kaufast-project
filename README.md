# InmobiMobi

A real estate platform built with modern web technologies.

## Environment Setup

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL
- Stripe account (for payment processing)

### Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd inmobimobi
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your actual values
# Never commit .env to the repository
```

4. Start the development server:
```bash
npm run dev
```

### Environment Variables

The following environment variables are required:

- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret key for session management
- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook secret
- `VITE_STRIPE_PUBLIC_KEY`: Your Stripe public key
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)

### Security Notes

- Never commit `.env` files to the repository
- Keep your environment variables secure
- Use different keys for development and production
- Rotate sensitive keys periodically

## Development

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run test`: Run tests

## License

[Your License] 