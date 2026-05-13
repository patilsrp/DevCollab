// server/tests/utils/idGenerator.test.js
import { describe, it, expect } from 'vitest';
import {
  createSecureRoomId,
  createFriendlyRoomCode,
  createSessionId,
  createUserId,
  hashRoomId,
  isValidRoomId,
  createTimedRoomId,
  RoomIdGenerator
} from '../../src/utils/idGenerator.js';

describe('idGenerator', () => {
  describe('createSecureRoomId', () => {
    it('should generate a 10-character room ID', () => {
      const id = createSecureRoomId();
      expect(id).toHaveLength(10);
    });

    it('should generate unique IDs', () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(createSecureRoomId());
      }
      expect(ids.size).toBe(100);
    });

    it('should only contain valid characters', () => {
      const id = createSecureRoomId();
      expect(id).toMatch(/^[a-zA-Z0-9]+$/);
    });
  });

  describe('createFriendlyRoomCode', () => {
    it('should generate a 6-character code', () => {
      const code = createFriendlyRoomCode();
      expect(code).toHaveLength(6);
    });

    it('should only use uppercase letters and numbers', () => {
      const code = createFriendlyRoomCode();
      expect(code).toMatch(/^[A-Z0-9]+$/);
    });
  });

  describe('isValidRoomId', () => {
    it('should validate correct room IDs', () => {
      expect(isValidRoomId('abc123')).toBe(true);
      expect(isValidRoomId('valid-room-id')).toBe(true);
      expect(isValidRoomId('user_room_1')).toBe(true);
    });

    it('should reject invalid room IDs', () => {
      expect(isValidRoomId('')).toBe(false);
      expect(isValidRoomId(null)).toBe(false);
      expect(isValidRoomId(undefined)).toBe(false);
      expect(isValidRoomId('abc')).toBe(false); // too short
      expect(isValidRoomId('a'.repeat(21))).toBe(false); // too long
      expect(isValidRoomId('invalid@id')).toBe(false); // special chars
      expect(isValidRoomId('invalid id')).toBe(false); // spaces
    });

    it('should reject non-string values', () => {
      expect(isValidRoomId(123)).toBe(false);
      expect(isValidRoomId({})).toBe(false);
      expect(isValidRoomId([])).toBe(false);
    });
  });

  describe('hashRoomId', () => {
    it('should return an 8-character hash', () => {
      const hash = hashRoomId('test-room-id');
      expect(hash).toHaveLength(8);
    });

    it('should return same hash for same input', () => {
      const hash1 = hashRoomId('test-room');
      const hash2 = hashRoomId('test-room');
      expect(hash1).toBe(hash2);
    });

    it('should return different hashes for different inputs', () => {
      const hash1 = hashRoomId('room-1');
      const hash2 = hashRoomId('room-2');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('createTimedRoomId', () => {
    it('should include the prefix', () => {
      const id = createTimedRoomId('test');
      expect(id).toMatch(/^test_/);
    });

    it('should use default prefix when not specified', () => {
      const id = createTimedRoomId();
      expect(id).toMatch(/^room_/);
    });

    it('should generate unique IDs', () => {
      const id1 = createTimedRoomId();
      const id2 = createTimedRoomId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('createUserId', () => {
    it('should start with user_ prefix', () => {
      const id = createUserId();
      expect(id).toMatch(/^user_/);
    });

    it('should generate unique user IDs', () => {
      const ids = new Set();
      for (let i = 0; i < 50; i++) {
        ids.add(createUserId());
      }
      expect(ids.size).toBe(50);
    });
  });

  describe('RoomIdGenerator', () => {
    it('should expose all generator methods', () => {
      expect(RoomIdGenerator.secure).toBeDefined();
      expect(RoomIdGenerator.friendly).toBeDefined();
      expect(RoomIdGenerator.timed).toBeDefined();
      expect(RoomIdGenerator.validate).toBeDefined();
      expect(RoomIdGenerator.hash).toBeDefined();
    });

    it('should generate valid IDs through the interface', () => {
      const secureId = RoomIdGenerator.secure();
      const friendlyId = RoomIdGenerator.friendly();
      expect(RoomIdGenerator.validate(secureId)).toBe(true);
      expect(RoomIdGenerator.validate(friendlyId)).toBe(true);
    });
  });
});