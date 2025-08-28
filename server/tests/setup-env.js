import { vi } from 'vitest';

process.env.NODE_ENV = 'test';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_dummy';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Make sure Stripe never initializes during tests
vi.mock('../lib/stripe', () => {
  return {
    default: {
      checkout: { sessions: { create: vi.fn() } },
      webhooks: { constructEvent: vi.fn(() => ({ type: 'noop', data: { object: {} } })) },
    },
    __esModule: true,
  };
});

