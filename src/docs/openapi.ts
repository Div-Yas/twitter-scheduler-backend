const bearerAuth = {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT"
};

export const swaggerSpec = {
  openapi: "3.0.0",
  info: { title: "Twitter Scheduler API", version: "1.0.0" },
  components: {
    securitySchemes: { bearerAuth },
    schemas: {
      StandardResponse: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          data: {},
          message: { type: "string" }
        }
      },
      AuthResponse: {
        type: "object",
        properties: {
          _id: { type: "string" },
          email: { type: "string" },
          token: { type: "string" }
        }
      },
      Tweet: {
        type: "object",
        properties: {
          _id: { type: "string" },
          content: { type: "string" },
          scheduledAt: { type: "string", format: "date-time" },
          status: { type: "string", enum: ["draft", "scheduled", "posted"] },
          media: { type: "array", items: { type: "string", format: "uri" } },
          likes: { type: "number" },
          retweets: { type: "number" },
          impressions: { type: "number" }
        }
      }
    }
  },
  security: [{ bearerAuth: [] }],
  paths: {
    "/api/auth/register": {
      post: {
        summary: "Register",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object", required: ["email", "password"], properties: { email: { type: "string" }, password: { type: "string", minLength: 6 } } }
            }
          }
        },
        responses: { "200": { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } } } }
      }
    },
    "/api/auth/login": {
      post: {
        summary: "Login",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object", required: ["email", "password"], properties: { email: { type: "string" }, password: { type: "string" } } }
            }
          }
        },
        responses: { "200": { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } } } }
      }
    },
    "/api/tweets": {
      get: {
        summary: "Get my tweets",
        responses: { "200": { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } } } }
      },
      post: {
        summary: "Create tweet",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object", required: ["content", "scheduledAt"], properties: { content: { type: "string", maxLength: 280 }, scheduledAt: { type: "string", format: "date-time" }, status: { type: "string" }, media: { type: "array", items: { type: "string" } } } }
            }
          }
        },
        responses: { "201": { description: "Created", content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } } } }
      }
    },
    "/api/tweets/{id}": {
      put: {
        summary: "Update tweet",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/Tweet" } } } },
        responses: { "200": { description: "OK" } }
      },
      delete: {
        summary: "Delete tweet",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "OK" } }
      }
    },
    "/api/analytics": {
      get: { summary: "Get analytics", responses: { "200": { description: "OK" } } }
    },
    "/api/ai/suggest": {
      post: {
        summary: "AI suggestions",
        requestBody: { content: { "application/json": { schema: { type: "object", properties: { topic: { type: "string" } } } } } },
        responses: { "200": { description: "OK" } }
      }
    },
    "/api/upload": {
      post: {
        summary: "Upload media",
        requestBody: { content: { "multipart/form-data": { schema: { type: "object", properties: { media: { type: "string", format: "binary" } } } } } },
        responses: { "200": { description: "OK" } }
      }
    },
    "/api/users/settings": {
      put: {
        summary: "Update user settings",
        requestBody: { content: { "application/json": { schema: { type: "object", required: ["timeZone"], properties: { timeZone: { type: "string" } } } } } },
        responses: { "200": { description: "OK" } }
      }
    },
    "/api/schedule/recommend": {
      get: { summary: "Recommend schedule times", responses: { "200": { description: "OK" } } }
    }
  }
};

export default swaggerSpec;

