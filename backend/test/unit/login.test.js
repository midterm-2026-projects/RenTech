import { describe, it, expect } from 'vitest';
import { authenticateUser, registerNewCustomer, verifyRolePermission, assignUserRole } from '../../service/login.service.js';

describe('Week 2 Day 1 - Login & Role Management Testing', () => {

  it('should accept valid mock credentials and return correct user profiles', async () => {
    const session = await authenticateUser('admin', 'admin');
    
    expect(session).not.toBeNull();
    expect(session.role).toBe('Admin');
    expect(session.username).toBe('admin');
  });

  it('should deny invalid credentials and return null', async () => {
    const session = await authenticateUser('admin', 'wrongpassword');
    
    expect(session).toBeNull();
  });

  it('should allow new users to register successfully and set default Customer role', async () => {
    const signupSession = await registerNewCustomer('newuser', 'securepass');
    
    expect(signupSession).not.toBeNull();
    expect(signupSession.username).toBe('newuser');
    expect(signupSession.role).toBe('Customer'); 
  });

  it('should block registration if username already exists in system data structure', async () => {
    const duplicateSession = await registerNewCustomer('staff', 'anypassword');
    
    expect(duplicateSession).toBeNull();
  });

  it('should authorize correct roles when checking access permissions', () => {
    const hasAccess = verifyRolePermission('Admin', ['Admin', 'Staff']);
    
    expect(hasAccess).toBe(true);
  });

  it('should fail permission verification if the role is not authorized', () => {
    const hasAccess = verifyRolePermission('Customer', ['Admin', 'Staff']);
    
    expect(hasAccess).toBe(false); 
  });

  describe("Role Assignment Backend Models & Logic", () => {
      it("should allow an Admin to successfully change a user's role", async () => {
        const updatedUser = await assignUserRole("customer", "Staff", "Admin");
        expect(updatedUser).toBeDefined();
        expect(updatedUser.username).toBe("customer");
        expect(updatedUser.role).toBe("Staff");
      });
  
      it("should throw an error if a non-Admin tries to change a role", async () => {
        await expect(
          assignUserRole("customer", "Admin", "Staff")
        ).rejects.toThrow("Unauthorized: Only Admins can assign roles");
      });
  
      it("should throw an error if an invalid role is assigned", async () => {
        await expect(
          assignUserRole("customer", "SuperUser", "Admin")
        ).rejects.toThrow("Invalid role specified");
      });
    });
});

