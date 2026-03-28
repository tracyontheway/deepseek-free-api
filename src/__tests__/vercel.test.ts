/**
 * Vercel Configuration Tests
 * Verifies that the Vercel deployment configuration is correct
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Vercel Configuration', () => {
  const projectRoot = path.resolve(__dirname, '../..');
  const vercelConfigPath = path.join(projectRoot, 'vercel.json');
  const apiIndexPath = path.join(projectRoot, 'api', 'index.ts');
  const packageJsonPath = path.join(projectRoot, 'package.json');

  describe('vercel.json', () => {
    let vercelConfig: any;

    beforeAll(() => {
      const configContent = fs.readFileSync(vercelConfigPath, 'utf-8');
      vercelConfig = JSON.parse(configContent);
    });

    it('should exist', () => {
      expect(fs.existsSync(vercelConfigPath)).toBe(true);
    });

    it('should be valid JSON', () => {
      expect(() => JSON.parse(fs.readFileSync(vercelConfigPath, 'utf-8'))).not.toThrow();
    });

    it('should not use deprecated builds configuration', () => {
      expect(vercelConfig.builds).toBeUndefined();
    });

    it('should have functions configuration', () => {
      expect(vercelConfig.functions).toBeDefined();
      expect(vercelConfig.functions['api/index.ts']).toBeDefined();
    });

    it('should have correct runtime configuration', () => {
      const apiFunction = vercelConfig.functions['api/index.ts'];
      expect(apiFunction.runtime).toBe('@vercel/node@3');
    });

    it('should have rewrites configuration', () => {
      expect(vercelConfig.rewrites).toBeDefined();
      expect(Array.isArray(vercelConfig.rewrites)).toBe(true);
    });

    it('should rewrite all paths to api/index', () => {
      const rootRewrite = vercelConfig.rewrites.find((r: any) => r.source === '/(.*)');
      expect(rootRewrite).toBeDefined();
      expect(rootRewrite.destination).toBe('/api/index');
    });

    it('should have CORS headers configuration', () => {
      expect(vercelConfig.headers).toBeDefined();
      expect(Array.isArray(vercelConfig.headers)).toBe(true);
    });

    it('should have build command', () => {
      expect(vercelConfig.buildCommand).toBe('npm run build');
    });

    it('should have output directory', () => {
      expect(vercelConfig.outputDirectory).toBe('dist');
    });
  });

  describe('api/index.ts', () => {
    it('should exist', () => {
      expect(fs.existsSync(apiIndexPath)).toBe(true);
    });

    it('should export default handler', () => {
      const content = fs.readFileSync(apiIndexPath, 'utf-8');
      expect(content).toContain('export default');
    });

    it('should import from dist directory', () => {
      const content = fs.readFileSync(apiIndexPath, 'utf-8');
      expect(content).toContain('../dist/');
    });

    it('should attach routes', () => {
      const content = fs.readFileSync(apiIndexPath, 'utf-8');
      expect(content).toContain('server.attachRoutes');
    });

    it('should export app callback', () => {
      const content = fs.readFileSync(apiIndexPath, 'utf-8');
      expect(content).toContain('app.callback()');
    });
  });

  describe('package.json', () => {
    let packageJson: any;

    beforeAll(() => {
      const content = fs.readFileSync(packageJsonPath, 'utf-8');
      packageJson = JSON.parse(content);
    });

    it('should have build script', () => {
      expect(packageJson.scripts.build).toBeDefined();
    });

    it('should have test script', () => {
      expect(packageJson.scripts.test).toBeDefined();
    });

    it('should have test:coverage script', () => {
      expect(packageJson.scripts['test:coverage']).toBeDefined();
    });

    it('should have koa dependency', () => {
      expect(packageJson.dependencies.koa).toBeDefined();
    });

    it('should have jest in devDependencies', () => {
      expect(packageJson.devDependencies.jest).toBeDefined();
    });

    it('should have supertest in devDependencies', () => {
      expect(packageJson.devDependencies.supertest).toBeDefined();
    });

    it('should have ts-jest in devDependencies', () => {
      expect(packageJson.devDependencies['ts-jest']).toBeDefined();
    });
  });

  describe('Jest Configuration', () => {
    const jestConfigPath = path.join(projectRoot, 'jest.config.js');
    const jestSetupPath = path.join(projectRoot, 'jest.setup.js');

    it('should have jest.config.js', () => {
      expect(fs.existsSync(jestConfigPath)).toBe(true);
    });

    it('should have jest.setup.js', () => {
      expect(fs.existsSync(jestSetupPath)).toBe(true);
    });
  });
});

describe('Environment Detection', () => {
  it('should detect Node.js environment', () => {
    expect(process.env.NODE_ENV).toBeDefined();
  });

  it('should have access to process.env', () => {
    expect(process.env).toBeDefined();
  });
});
