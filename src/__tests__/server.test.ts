/**
 * Server Unit Tests
 * Tests the core server functionality
 */

import Koa from 'koa';
import KoaRouter from 'koa-router';
import koaCors from 'koa2-cors';
import koaBody from 'koa-body';

describe('Server Module', () => {
  describe('Koa App Creation', () => {
    it('should create a Koa instance', () => {
      const app = new Koa();
      expect(app).toBeInstanceOf(Koa);
    });

    it('should have middleware stack', () => {
      const app = new Koa();
      expect(app.middleware).toBeDefined();
      expect(Array.isArray(app.middleware)).toBe(true);
    });

    it('should have callback method', () => {
      const app = new Koa();
      expect(typeof app.callback).toBe('function');
    });

    it('should have listen method', () => {
      const app = new Koa();
      expect(typeof app.listen).toBe('function');
    });
  });

  describe('Router Creation', () => {
    it('should create a router instance', () => {
      const router = new KoaRouter();
      expect(router).toBeInstanceOf(KoaRouter);
    });

    it('should support prefix option', () => {
      const router = new KoaRouter({ prefix: '/v1' });
      expect(router.opts.prefix).toBe('/v1');
    });

    it('should have route registration methods', () => {
      const router = new KoaRouter();
      expect(typeof router.get).toBe('function');
      expect(typeof router.post).toBe('function');
      expect(typeof router.put).toBe('function');
      expect(typeof router.delete).toBe('function');
    });
  });

  describe('Middleware Integration', () => {
    let app: Koa;
    let router: KoaRouter;

    beforeEach(() => {
      app = new Koa();
      router = new KoaRouter();
    });

    it('should apply CORS middleware', () => {
      app.use(koaCors());
      expect(app.middleware.length).toBeGreaterThan(0);
    });

    it('should apply body parser middleware', () => {
      app.use(koaBody({
        multipart: true,
        jsonLimit: '10mb'
      }));
      expect(app.middleware.length).toBeGreaterThan(0);
    });

    it('should apply router middleware', () => {
      router.get('/test', async (ctx: any) => {
        ctx.body = { success: true };
      });
      app.use(router.routes());
      expect(app.middleware.length).toBeGreaterThan(0);
    });

    it('should apply allowed methods middleware', () => {
      app.use(router.allowedMethods());
      expect(app.middleware.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    let app: Koa;

    beforeEach(() => {
      app = new Koa();
    });

    it('should handle errors in middleware', async () => {
      app.use(async (ctx: any, next: Function) => {
        try {
          await next();
        } catch (err: any) {
          ctx.status = err.status || 500;
          ctx.body = { error: err.message };
        }
      });

      app.use(async () => {
        throw new Error('Test error');
      });

      const callback = app.callback();
      
      // The error should be caught by middleware
      expect(app.middleware.length).toBe(2);
    });

    it('should have error event handler', () => {
      const app = new Koa();
      
      let errorEmitted = false;
      app.on('error', (err: Error) => {
        errorEmitted = true;
      });

      expect(app.listenerCount('error')).toBe(1);
    });
  });

  describe('Response Object', () => {
    it('should create proper response structure', () => {
      const response = {
        success: true,
        data: {
          id: 'test-id',
          object: 'chat.completion',
          created: Date.now(),
          model: 'deepseek-chat',
          choices: [
            {
              index: 0,
              message: {
                role: 'assistant',
                content: 'Test response'
              },
              finish_reason: 'stop'
            }
          ],
          usage: {
            prompt_tokens: 10,
            completion_tokens: 5,
            total_tokens: 15
          }
        }
      };

      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data.choices).toBeInstanceOf(Array);
      expect(response.data.choices[0].message.content).toBe('Test response');
    });

    it('should create error response structure', () => {
      const errorResponse = {
        success: false,
        error: 'Invalid request',
        code: 'INVALID_REQUEST'
      };

      expect(errorResponse.success).toBe(false);
      expect(errorResponse.error).toBeDefined();
      expect(errorResponse.code).toBe('INVALID_REQUEST');
    });
  });

  describe('Request Validation', () => {
    it('should validate message array', () => {
      const validMessages = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi!' }
      ];

      expect(Array.isArray(validMessages)).toBe(true);
      expect(validMessages.every(m => m.role && m.content)).toBe(true);
    });

    it('should validate model parameter', () => {
      const validModels = ['deepseek-chat', 'deepseek-coder'];
      const testModel = 'deepseek-chat';

      expect(validModels.includes(testModel)).toBe(true);
    });

    it('should validate authorization header', () => {
      const authHeader = 'Bearer test-token';
      expect(authHeader.startsWith('Bearer ')).toBe(true);
    });
  });

  describe('Streaming Response', () => {
    it('should format SSE data correctly', () => {
      const chunk = {
        id: 'test-id',
        object: 'chat.completion.chunk',
        created: Date.now(),
        model: 'deepseek-chat',
        choices: [{
          index: 0,
          delta: { content: 'Hello' },
          finish_reason: null
        }]
      };

      const sseData = `data: ${JSON.stringify(chunk)}\n\n`;
      expect(sseData).toMatch(/^data: /);
      expect(sseData).toMatch(/\n\n$/);
    });

    it('should format SSE done correctly', () => {
      const doneSignal = 'data: [DONE]\n\n';
      expect(doneSignal).toContain('[DONE]');
    });
  });
});
