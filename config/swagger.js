const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Qaran Baby Shop API',
      version: '1.0.0',
      description: 'API documentation for Qaran Baby Shop'
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000',
        description: 'Development server'
      }
    ]
  },
  apis: ['./routes/*.js']
};

module.exports = swaggerJsdoc(options);