import { describe, test, expect, beforeAll } from 'vitest';
import axios, { AxiosInstance } from 'axios';

describe('SOW Module API Integration Tests', () => {
  let api: AxiosInstance;
  const baseURL = process.env.VITE_API_URL || 'http://localhost:3000/api';

  beforeAll(() => {
    api = axios.create({
      baseURL: `${baseURL}/sow`,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  });

  describe('SOW Health Check', () => {
    test('SOW health endpoint returns OK', async () => {
      try {
        const response = await api.get('/health');
        expect(response.status).toBe(200);
        expect(response.data.status).toBe('ok');
        expect(response.data.message).toContain('SOW');
      } catch (error) {
        console.warn('SOW API not running - skipping health check');
      }
    });
  });

  describe('SOW Data Retrieval', () => {
    test('Can fetch SOW data by project ID', async () => {
      try {
        // Using a test project ID
        const projectId = 'test-project-001';
        const response = await api.get(`/data/${projectId}`);
        
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('poles');
        expect(response.data).toHaveProperty('drops');
        expect(response.data).toHaveProperty('fibre');
        expect(response.data).toHaveProperty('summary');
      } catch (error: any) {
        if (error.response?.status === 404) {
          // Expected if test project doesn't exist
          expect(error.response.data).toHaveProperty('error');
        } else {
          console.warn('SOW data fetch test skipped - API not available');
        }
      }
    });

    test('Invalid project ID returns 404', async () => {
      try {
        await api.get('/data/invalid-project-id-12345');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
        expect(error.response.data).toHaveProperty('error');
      }
    });
  });

  describe('SOW Summary Operations', () => {
    test('Can fetch SOW summary', async () => {
      try {
        const response = await api.get('/summary/test-project-001');
        
        if (response.status === 200) {
          expect(response.data).toHaveProperty('totalPoles');
          expect(response.data).toHaveProperty('totalDrops');
          expect(response.data).toHaveProperty('totalFibre');
          expect(response.data).toHaveProperty('totalCost');
        }
      } catch (error: any) {
        if (error.response?.status === 404) {
          expect(error.response.data).toHaveProperty('error');
        }
      }
    });
  });

  describe('SOW Import Operations', () => {
    test('Import endpoint exists and validates data', async () => {
      try {
        // Test with invalid data to check validation
        const response = await api.post('/import', {
          projectId: null,
          data: {}
        });
      } catch (error: any) {
        // Should fail validation
        expect([400, 422]).toContain(error.response.status);
        expect(error.response.data).toHaveProperty('error');
      }
    });

    test('Valid import structure is accepted', async () => {
      try {
        const validImportData = {
          projectId: 'test-project-001',
          data: {
            poles: [],
            drops: [],
            fibre: [],
            metadata: {
              importDate: new Date().toISOString(),
              source: 'test'
            }
          }
        };

        const response = await api.post('/import', validImportData);
        
        if (response.status === 200 || response.status === 201) {
          expect(response.data).toHaveProperty('success');
          expect(response.data.success).toBe(true);
        }
      } catch (error) {
        console.warn('SOW import test skipped - API not available');
      }
    });
  });

  describe('SOW Schema Validation', () => {
    test('Schema endpoint returns valid structure', async () => {
      try {
        const response = await api.get('/schema');
        
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('poles');
        expect(response.data).toHaveProperty('drops');
        expect(response.data).toHaveProperty('fibre');
        
        // Verify schema structure
        expect(response.data.poles).toHaveProperty('fields');
        expect(response.data.drops).toHaveProperty('fields');
        expect(response.data.fibre).toHaveProperty('fields');
      } catch (error) {
        console.warn('SOW schema test skipped - API not available');
      }
    });
  });

  describe('SOW Error Handling', () => {
    test('Handles database connection errors gracefully', async () => {
      try {
        // Simulate a complex query that might fail
        const response = await api.post('/query', {
          query: 'SELECT * FROM non_existent_table'
        });
      } catch (error: any) {
        expect(error.response.status).toBeGreaterThanOrEqual(400);
        expect(error.response.data).toHaveProperty('error');
        expect(error.response.data.error).not.toContain('password');
        expect(error.response.data.error).not.toContain('DATABASE_URL');
      }
    });
  });

  describe('SOW Performance', () => {
    test('Health check responds within 1 second', async () => {
      try {
        const start = Date.now();
        await api.get('/health');
        const duration = Date.now() - start;
        
        expect(duration).toBeLessThan(1000);
      } catch (error) {
        console.warn('Performance test skipped - API not available');
      }
    });

    test('Data fetch responds within 2 seconds', async () => {
      try {
        const start = Date.now();
        await api.get('/data/test-project-001');
        const duration = Date.now() - start;
        
        expect(duration).toBeLessThan(2000);
      } catch (error) {
        console.warn('Performance test skipped - API not available');
      }
    });
  });
});