// Swagger documentation for admin routes
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Admin API',
    version: '1.0.0',
    description: 'API documentation for admin routes',
  },
  paths: {
    '/admin/users': {
      get: {
        summary: 'Get all users',
        description: 'Retrieve a list of all users',
        tags: ['Admin'],
        responses: {
          '200': {
            description: 'A list of users',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                      email: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/admin/users/{id}': {
      delete: {
        summary: 'Delete a user',
        description: 'Delete a user by ID',
        tags: ['Admin'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
            description: 'ID of the user to delete',
          },
        ],
        responses: {
          '200': {
            description: 'User deleted successfully',
          },
        },
      },
      patch: {
        summary: 'Update user status',
        description: 'Update the status of a user by ID',
        tags: ['Admin'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
            description: 'ID of the user to update',
          },
        ],
        responses: {
          '200': {
            description: 'User status updated successfully',
          },
        },
      },
    },
    '/admin/users/{id}/promote': {
      patch: {
        summary: 'Promote a user',
        description: 'Promote a user to admin by ID',
        tags: ['Admin'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
            description: 'ID of the user to promote',
          },
        ],
        responses: {
          '200': {
            description: 'User promoted successfully',
          },
        },
      },
    },
    '/admin/users/{id}/demote': {
      patch: {
        summary: 'Demote a user',
        description: 'Demote a user from admin to regular user by ID',
        tags: ['Admin'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
            description: 'ID of the user to demote',
          },
        ],
        responses: {
          '200': {
            description: 'User demoted successfully',
          },
        },
      },
    },
  },
};

export default swaggerDocument;