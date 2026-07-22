import { describe, it, expect, vi, beforeEach } from "vitest";

let userStore = [];

function buildSupabase() {
  let currentEq = null;
  const q = {
    from: () => q,
    select: () => q,
    in: () => q,
    eq: (col, val) => { currentEq = { col, val }; return q; },
    insert: (rows) => { const row = Array.isArray(rows) ? rows[0] : rows; userStore.push(row); return { error: null }; },
    delete: () => q,
    order: () => q,
    maybeSingle: async () => {
      if (!currentEq) return { data: null, error: null };
      const found = userStore.find(u => u[currentEq.col] === currentEq.val);
      currentEq = null;
      return { data: found || null, error: null };
    },
    then: (fn) => {
      const list = userStore.filter(u => u.role === 'Staff' || u.role === 'Admin');
      return Promise.resolve({ data: list.map(({ username, role }) => ({ username, role })), error: null }).then(fn);
    },
  };
  return q;
}

vi.mock('../../config/supabaseClient.js', () => ({
  getSupabase: () => buildSupabase(),
}));

const { getStaffList, addStaff, removeStaff, validateStaffCredentials } = await import('../../service/staffManagement.service.js');
const bcrypt = await import('bcryptjs');

async function seedUser(username, password, role) {
  const hash = await bcrypt.hash(password, 10);
  userStore.push({ username, password_hash: hash, role });
}

describe("Staff Management Service", () => {
  beforeEach(async () => {
    userStore = [];
    await seedUser("admin", "admin123", "Admin");
    await seedUser("staff1", "staff123", "Staff");
    await seedUser("staff2", "staff456", "Staff");
  });

  describe("getStaffList", () => {
    it("should return all staff members without exposing passwords", async () => {
      const list = await getStaffList();
      expect(Array.isArray(list)).toBe(true);
      expect(list.length).toBeGreaterThan(0);
      list.forEach(member => {
        expect(member).toHaveProperty("username");
        expect(member).toHaveProperty("role");
        expect(member).not.toHaveProperty("password");
      });
    });
  });

  describe("addStaff", () => {
    it("should add a new staff member successfully", async () => {
      const result = await addStaff({ username: "newstaff", password: "pass123" });
      expect(result.username).toBe("newstaff");
      expect(result.role).toBe("Staff");
      expect(result.message).toContain("added successfully");
    });

    it("should lowercase the username", async () => {
      const result = await addStaff({ username: "CamelCase", password: "pass123" });
      expect(result.username).toBe("camelcase");
    });

    it("should reject duplicate usernames case-insensitively", async () => {
      await expect(addStaff({ username: "staff1", password: "pass" }))
        .rejects.toThrow("already exists");
    });
  });

  describe("removeStaff", () => {
    it("should remove an existing staff member", async () => {
      await addStaff({ username: "toRemove", password: "pass" });
      const result = await removeStaff("toRemove");
      expect(result.success).toBe(true);
      expect(result.message).toContain("removed");
    });

    it("should throw when removing a non-existent member", async () => {
      await expect(removeStaff("ghostUser")).rejects.toThrow("not found");
    });
  });

  describe("validateStaffCredentials", () => {
    it("should return authenticated true for valid credentials", async () => {
      const result = await validateStaffCredentials("admin", "admin123");
      expect(result.authenticated).toBe(true);
      expect(result.username).toBe("admin");
      expect(result.role).toBe("Admin");
    });

    it("should throw for non-existent username", async () => {
      await expect(validateStaffCredentials("nobody", "pass"))
        .rejects.toThrow("not found");
    });

    it("should throw for wrong password", async () => {
      await expect(validateStaffCredentials("admin", "wrongpass"))
        .rejects.toThrow("Invalid password");
    });
  });
});