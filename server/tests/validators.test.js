// server/tests/validators.test.js
import { describe, it, expect } from 'vitest';
import { sanitizeInput, validateSocketEvent } from '../src/validators.js';

describe('validators', () => {
  describe('sanitizeInput', () => {
    it('should remove HTML tags', () => {
      const input = '<script>alert("xss")</script>Hello';
      const result = sanitizeInput(input);
      expect(result).not.toContain('<script>');
      expect(result).toContain('Hello');
    });

    it('should handle non-string input', () => {
      expect(sanitizeInput(123)).toBe(123);
      expect(sanitizeInput(null)).toBe(null);
      expect(sanitizeInput(undefined)).toBe(undefined);
    });

    it('should preserve safe text', () => {
      const safe = 'Hello World 123';
      expect(sanitizeInput(safe)).toBe(safe);
    });
  });

  describe('validateSocketEvent', () => {
    describe('join-room', () => {
      it('should validate correct join-room data', () => {
        const result = validateSocketEvent('join-room', {
          roomId: 'test-room',
          username: 'testuser'
        });
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should reject missing roomId', () => {
        const result = validateSocketEvent('join-room', {
          username: 'testuser'
        });
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Invalid room ID');
      });

      it('should reject missing username', () => {
        const result = validateSocketEvent('join-room', {
          roomId: 'test-room'
        });
        expect(result.isValid).toBe(false);
      });

      it('should reject short username', () => {
        const result = validateSocketEvent('join-room', {
          roomId: 'test-room',
          username: 'a'
        });
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Username must be 2-30 characters');
      });
    });

    describe('code-change', () => {
      it('should validate correct code-change data', () => {
        const result = validateSocketEvent('code-change', {
          roomId: 'test-room',
          code: 'const x = 1;'
        });
        expect(result.isValid).toBe(true);
      });

      it('should reject code exceeding max length', () => {
        const result = validateSocketEvent('code-change', {
          roomId: 'test-room',
          code: 'a'.repeat(100001)
        });
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Code exceeds maximum length');
      });
    });

    describe('language-change', () => {
      it('should validate supported languages', () => {
        const validLanguages = ['javascript', 'typescript', 'python', 'java'];
        validLanguages.forEach(language => {
          const result = validateSocketEvent('language-change', {
            roomId: 'test-room',
            language
          });
          expect(result.isValid).toBe(true);
        });
      });

      it('should reject unsupported languages', () => {
        const result = validateSocketEvent('language-change', {
          roomId: 'test-room',
          language: 'invalidlang'
        });
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Invalid programming language');
      });
    });

    describe('send-message', () => {
      it('should validate correct message', () => {
        const result = validateSocketEvent('send-message', {
          roomId: 'test-room',
          message: 'Hello',
          username: 'testuser'
        });
        expect(result.isValid).toBe(true);
      });

      it('should reject empty messages', () => {
        const result = validateSocketEvent('send-message', {
          roomId: 'test-room',
          message: '',
          username: 'testuser'
        });
        expect(result.isValid).toBe(false);
      });

      it('should reject messages exceeding max length', () => {
        const result = validateSocketEvent('send-message', {
          roomId: 'test-room',
          message: 'a'.repeat(501),
          username: 'testuser'
        });
        expect(result.isValid).toBe(false);
      });
    });
  });
});