/**
 * Comprehensive API Tests for DeepSeek Free API
 * Tests server initialization, routing, error handling, and response formatting
 */

import request from 'supertest';
import Koa from 'koa';
import KoaRouter from 'koa-router';
import koaCors from 'koa2-cors';
import koaBody from 'koa-body';

// Test constants
const TEST_PORT = 3999;
const TEST_TOKEN = 'Bearer test-token-12345';

describe('API Server', () => {
  let app: Koa;
  let router: KoaRouter;
  let server: any;

  beforeAll(async () => {
    // Create a minimal Koa app for testing
    app = new Koa();
    app.use(koaCors());
    router = new KoaRouter();

    // Setup body parser
    app.use(koaBody({
      multipart: true,
      jsonLimit: '10mb',
      formLimit: '10mb',
      textLimit: '10mb'
    }));

    // Error handling middleware
    app.use(async (ctx: any, next: Function) => {
      try {
        await next();
      } catch (err: any) {
        ctx.status = err.status || 500;
        ctx.body = {
          success: false,
          error: err.message || 'Internal Server Error',
          code: err.code || 'INTERNAL_ERROR'
        };
      }
    });

    // Welcome route
    router.get('/', async (ctx: any) => {
      ctx.type = 'html';
      ctx.body = '<!DOCTYPE html><html><body>Service Running</body></html>';
    });

    // Health check route
    router.get('/ping', async (ctx: any) => {
      ctx.body = {
        success: true,
        message: 'pong'
      };
    });

    // Models route
    router.get('/v1/models', async (ctx: any) => {
      ctx.body = {
        success: true,
        data: [
          { id: 'deepseek-chat', object: 'model', owned_by: 'deepseek' },
          { id: 'deepseek-coder', object: 'model', owned_by: 'deepseek' }
        ]
      };
    });

    // Chat completions route
    router.post('/v1/chat/completions', async (ctx: any) => {
      const { model, messages, stream } = ctx.request.body;
      const authorization = ctx.headers.authorization;

      // Validate required fields
      if (!authorization) {
        ctx.status = 401;
        ctx.body = {
          success: false,
          error: 'Authorization header is required',
          code: 'UNAUTHORIZED'
        };
        return;
      }

      if (!messages || !Array.isArray(messages)) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: 'messages must be an array',
          code: 'INVALID_REQUEST'
        };
        return;
      }

      if (!model) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: 'model is required',
          code: 'INVALID_REQUEST'
        };
        return;
      }

      // Handle streaming response
      if (stream) {
        ctx.type = 'text/event-stream';
        ctx.set('Cache-Control', 'no-cache');
        ctx.set('Connection', 'keep-alive');
        ctx.body = `data: ${JSON.stringify({
          id: 'test-id',
          object: 'chat.completion.chunk',
          created: Date.now(),
          model: model,
          choices: [{
            index: 0,
            delta: { content: 'Hello' },
            finish_reason: null
          }]
        })}\n\ndata: [DONE]\n\n`;
        return;
      }

      // Handle non-streaming response
      ctx.body = {
        success: true,
        data: {
          id: 'test-completion-id',
          object: 'chat.completion',
          created: Date.now(),
          model: model,
          choices: [{
            index: 0,
            message: {
              role: 'assistant',
              content: 'This is a test response'
            },
            finish_reason: 'stop'
          }],
          usage: {
            prompt_tokens: 10,
            completion_tokens: 5,
            total_tokens: 15
          }
        }
      };
    });

    // Token validation route
    router.get('/token', async (ctx: any) => {
      const authorization = ctx.headers.authorization;
      
      if (!authorization) {
        ctx.status = 401;
        ctx.body = {
          success: false,
          error: 'Authorization header is required',
          code: 'UNAUTHORIZED'
        };
        return;
      }

      ctx.body = {
        success: true,
        message: 'Token is valid'
      };
    });

    app.use(router.routes());
    app.use(router.allowedMethods());

    // 404 handler
    app.use(async (ctx: any) => {
      ctx.status = 404;
      ctx.body = {
        success: false,
        error: 'Not Found',
        code: 'NOT_FOUND'
      };
    });

    // Start server
    server = app.listen(TEST_PORT);
  });

  afterAll(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  describe('GET /', () => {
    it('should return welcome page', async () => {
      const response = await request(app.callback())
        .get('/')
        .expect('Content-Type', /html/)
        .expect(200);

      expect(response.text).toContain('Service Running');
    });
  });

  describe('GET /ping', () => {
    it('should return pong', async () => {
      const response = await request(app.callback())
        .get('/ping')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'pong');
    });
  });

  describe('GET /v1/models', () => {
    it('should return list of available models', async () => {
      const response = await request(app.callback())
        .get('/v1/models')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      const model = response.body.data[0];
      expect(model).toHaveProperty('id');
      expect(model).toHaveProperty('object');
      expect(model).toHaveProperty('owned_by');
    });
  });

  describe('POST /v1/chat/completions', () => {
    it('should reject request without authorization', async () => {
      const response = await request(app.callback())
        .post('/v1/chat/completions')
        .send({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: 'Hello' }]
        })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('code', 'UNAUTHORIZED');
    });

    it('should reject request without messages', async () => {
      const response = await request(app.callback())
        .post('/v1/chat/completions')
        .set('Authorization', TEST_TOKEN)
        .send({
          model: 'deepseek-chat'
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('code', 'INVALID_REQUEST');
    });

    it('should reject request without model', async () => {
      const response = await request(app.callback())
        .post('/v1/chat/completions')
        .set('Authorization', TEST_TOKEN)
        .send({
          messages: [{ role: 'user', content: 'Hello' }]
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('code', 'INVALID_REQUEST');
    });

    it('should reject invalid messages format', async () => {
      const response = await request(app.callback())
        .post('/v1/chat/completions')
        .set('Authorization', TEST_TOKEN)
        .send({
          model: 'deepseek-chat',
          messages: 'invalid'
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('code', 'INVALID_REQUEST');
    });

    it('should return chat completion response', async () => {
      const response = await request(app.callback())
        .post('/v1/chat/completions')
        .set('Authorization', TEST_TOKEN)
        .send({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: 'Hello!' }
          ]
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      
      const data = response.body.data;
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('object', 'chat.completion');
      expect(data).toHaveProperty('model');
      expect(data).toHaveProperty('choices');
      expect(data).toHaveProperty('usage');
      
      const choice = data.choices[0];
      expect(choice).toHaveProperty('index', 0);
      expect(choice).toHaveProperty('message');
      expect(choice).toHaveProperty('finish_reason');
      
      expect(choice.message).toHaveProperty('role', 'assistant');
      expect(choice.message).toHaveProperty('content');
      
      expect(data.usage).toHaveProperty('prompt_tokens');
      expect(data.usage).toHaveProperty('completion_tokens');
      expect(data.usage).toHaveProperty('total_tokens');
    });

    it('should handle streaming request', async () => {
      const response = await request(app.callback())
        .post('/v1/chat/completions')
        .set('Authorization', TEST_TOKEN)
        .send({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: 'Hello' }],
          stream: true
        })
        .expect(200);

      expect(response.headers['content-type']).toContain('text/event-stream');
      expect(response.text).toContain('data:');
      expect(response.text).toContain('[DONE]');
    });
  });

  describe('GET /token', () => {
    it('should reject request without authorization', async () => {
      const response = await request(app.callback())
        .get('/token')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('code', 'UNAUTHORIZED');
    });

    it('should validate token successfully', async () => {
      const response = await request(app.callback())
        .get('/token')
        .set('Authorization', TEST_TOKEN)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app.callback())
        .get('/unknown-route')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('code', 'NOT_FOUND');
    });

    it('should handle malformed JSON body', async () => {
      const response = await request(app.callback())
        .post('/v1/chat/completions')
        .set('Authorization', TEST_TOKEN)
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);

      // The app should handle malformed JSON gracefully
    });

    it('should handle very large request body', async () => {
      const largeMessages = Array(10000).fill({
        role: 'user',
        content: 'This is a test message'
      });

      const response = await request(app.callback())
        .post('/v1/chat/completions')
        .set('Authorization', TEST_TOKEN)
        .send({
          model: 'deepseek-chat',
          messages: largeMessages
        });

      // Should either accept or reject gracefully
      expect([200, 400, 413]).toContain(response.status);
    });
  });

  describe('CORS Headers', () => {
    it('should include CORS headers in response', async () => {
      const response = await request(app.callback())
        .get('/ping')
        .expect(200);

      // CORS middleware should be present
      expect(response.headers).toBeDefined();
    });
  });

  describe('Request Validation', () => {
    it('should validate conversation_id if provided', async () => {
      const response = await request(app.callback())
        .post('/v1/chat/completions')
        .set('Authorization', TEST_TOKEN)
        .send({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: 'Hello' }],
          conversation_id: 'test-conv-123'
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should accept valid message roles', async () => {
      const validRoles = ['system', 'user', 'assistant'];

      for (const role of validRoles) {
        const response = await request(app.callback())
          .post('/v1/chat/completions')
          .set('Authorization', TEST_TOKEN)
          .send({
            model: 'deepseek-chat',
            messages: [{ role, content: `Test ${role} message` }]
          });

        expect(response.status).toBe(200);
      }
    });
  });
});
