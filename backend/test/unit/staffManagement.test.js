import { describe, it, expect, beforeEach } from "vitest";
import { getStaffList, addStaff, removeStaff, validateStaffCredentials } from "../../service/staffManagement.service.js";

describe("Staff Management Service", () => {

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
      await expect(addStaff({ username: "admin", password: "pass" }))
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

    it("should be case-insensitive when removing", async () => {
      await addStaff({ username: "caseTest", password: "pass" });
      const result = await removeStaff("CASETEST");
      expect(result.success).toBe(true);
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

    it("should be case-insensitive for username", async () => {
      const result = await validateStaffCredentials("ADMIN", "admin123");
      expect(result.authenticated).toBe(true);
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
