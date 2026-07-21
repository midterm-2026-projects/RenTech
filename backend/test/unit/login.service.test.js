import { describe, it, expect } from 'vitest';
import {
  authenticateUser,
  verifyRolePermission,
  assignUserRole,
} from '../../service/login.service.js';

describe('authenticateUser', () => {
  it('returns the role for valid admin credentials', async () => {
    const user = await authenticateUser('admin', 'admin');
    expect(user).toEqual({ username: 'admin', role: 'Admin' });
  });

  it('normalizes username casing', async () => {
    const user = await authenticateUser('ADMIN', 'admin');
    expect(user.role).toBe('Admin');
  });

  it('returns null for bad credentials', async () => {
    expect(await authenticateUser('admin', 'wrong')).toBeNull();
  });
});

describe('verifyRolePermission', () => {
  it('is true when the role is allowed', () => {
    expect(verifyRolePermission('Staff', ['Admin', 'Staff'])).toBe(true);
  });
  it('is false when the role is not allowed', () => {
    expect(verifyRolePermission('Customer', ['Admin'])).toBe(false);
  });
});

describe('assignUserRole', () => {
  it('throws when the updater is not an Admin', async () => {
    await expect(assignUserRole('customer', 'Staff', 'Staff'))
      .rejects.toThrow(/Only Admins can assign roles/i);
  });

  it('throws on an invalid role', async () => {
    await expect(assignUserRole('customer', 'Wizard', 'Admin'))
      .rejects.toThrow(/Invalid role specified/i);
  });

  it('updates the role when called by an Admin', async () => {
    const updated = await assignUserRole('customer', 'Staff', 'Admin');
    expect(updated.role).toBe('Staff');
  });
});
