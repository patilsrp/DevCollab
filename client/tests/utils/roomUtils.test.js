// client/tests/utils/roomUtils.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isValidRoomId, generateRoomId, formatRoomUrl } from '../../src/utils/roomUtils';

describe('roomUtils', () => {
  describe('isValidRoomId', () => {
    it('should validate correct room IDs', () => {
      expect(isValidRoomId('abc123')).toBe(true);
      expect(isValidRoomId('valid-room')).toBe(true);
      expect(isValidRoomId('user_room_1')).toBe(true);
    });

    it('should reject invalid room IDs', () => {
      expect(isValidRoomId('')).toBe(false);
      expect(isValidRoomId(null)).toBe(false);
      expect(isValidRoomId(undefined)).toBe(false);
      expect(isValidRoomId('abc')).toBe(false);
      expect(isValidRoomId('a'.repeat(21))).toBe(false);
      expect(isValidRoomId('invalid@id')).toBe(false);
      expect(isValidRoomId('has spaces')).toBe(false);
    });
  });

  describe('generateRoomId', () => {
    it('should generate a 10-character room ID', () => {
      const id = generateRoomId();
      expect(id).toHaveLength(10);
    });

    it('should generate unique IDs', () => {
      const ids = new Set();
      for (let i = 0; i < 50; i++) {
        ids.add(generateRoomId());
      }
      expect(ids.size).toBe(50);
    });
  });

  describe('formatRoomUrl', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'location', {
        value: { origin: 'https://example.com' },
        writable: true
      });
    });

    it('should format room URL correctly', () => {
      const url = formatRoomUrl('test-room');
      expect(url).toBe('https://example.com/editor/test-room');
    });
  });
});