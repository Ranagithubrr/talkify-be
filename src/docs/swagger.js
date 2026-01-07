const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Talkify API',
    version: '1.0.0',
    description: 'Backend API for Talkify',
  },
  servers: [
    { url: '/', description: 'Root server' },
    { url: '/api', description: 'API base' },
  ],
  paths: {
    '/': {
      get: {
        summary: 'Root status',
        responses: {
          200: { description: 'API is running' },
        },
      },
    },
    '/health': {
      get: {
        summary: 'Health check',
        responses: {
          200: {
            description: 'Service health',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { status: { type: 'string', example: 'ok' } },
                },
              },
            },
          },
        },
      },
    },
    '/api/auth/register': {
      post: {
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'User created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          400: { description: 'Validation error' },
          409: { description: 'Email already registered' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        summary: 'Login user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Login success',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          400: { description: 'Validation error' },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/api/auth/refresh': {
      post: {
        summary: 'Refresh access token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RefreshRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Tokens refreshed',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    tokens: { $ref: '#/components/schemas/Tokens' },
                  },
                },
              },
            },
          },
          400: { description: 'Missing refresh token' },
          401: { description: 'Invalid refresh token' },
        },
      },
    },
    '/api/messages': {
      post: {
        summary: 'Send a message',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SendMessageRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Message created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { $ref: '#/components/schemas/Message' },
                  },
                },
              },
            },
          },
          400: { description: 'Validation error' },
        },
      },
      get: {
        summary: 'Get conversation between two users',
        parameters: [
          {
            name: 'userA',
            in: 'query',
            required: true,
            schema: { type: 'string' },
          },
          {
            name: 'userB',
            in: 'query',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Messages list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    messages: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Message' },
                    },
                  },
                },
              },
            },
          },
          400: { description: 'Validation error' },
        },
      },
    },
    '/api/conversations': {
      get: {
        summary: 'List conversations for a user',
        parameters: [
          {
            name: 'userId',
            in: 'query',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Conversations list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    conversations: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Conversation' },
                    },
                  },
                },
              },
            },
          },
          400: { description: 'Validation error' },
        },
      },
      post: {
        summary: 'Create or get a 1:1 conversation',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateConversationRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Conversation created or returned',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    conversation: { $ref: '#/components/schemas/Conversation' },
                  },
                },
              },
            },
          },
          400: { description: 'Validation error' },
        },
      },
    },
    '/api/users': {
      get: {
        summary: 'List all users',
        responses: {
          200: {
            description: 'Users list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    users: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/User' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      RegisterRequest: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          photo: { type: 'string', nullable: true },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
      },
      RefreshRequest: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string' },
        },
      },
      SendMessageRequest: {
        type: 'object',
        required: ['senderId', 'recipientId', 'content'],
        properties: {
          senderId: { type: 'string' },
          recipientId: { type: 'string' },
          content: { type: 'string' },
        },
      },
      CreateConversationRequest: {
        type: 'object',
        required: ['memberA', 'memberB'],
        properties: {
          memberA: { type: 'string' },
          memberB: { type: 'string' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          photo: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Tokens: {
        type: 'object',
        properties: {
          accessToken: { type: 'string' },
          refreshToken: { type: 'string' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/User' },
          tokens: { $ref: '#/components/schemas/Tokens' },
        },
      },
      Message: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          sender: { type: 'string' },
          recipient: { type: 'string' },
          content: { type: 'string' },
          sentAt: { type: 'string', format: 'date-time' },
        },
      },
      Conversation: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          members: { type: 'array', items: { type: 'string' } },
          lastMessage: { $ref: '#/components/schemas/Message' },
          lastMessageAt: { type: 'string', format: 'date-time', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
};

module.exports = swaggerSpec;
