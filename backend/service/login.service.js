import { UserModel } from '../model/login.model.js';

const mockUsersDb = [
  new UserModel({ username: 'admin', password: 'admin', role: 'Admin' }),
  new UserModel({ username: 'staff', password: 'staff', role: 'Staff' }),
  new UserModel({ username: 'customer', password: 'customer', role: 'Customer' })
];

export const authenticateUser = async (username, password) => {
  const cleanUser = username.trim().toLowerCase();
  const user = mockUsersDb.find(u => u.username === cleanUser);
  
  if (user && user.password === password) {
    return { username: user.username, role: user.role };
  }
  return null;
};

export const registerNewCustomer = async (username, password) => {
  const cleanUser = username.trim().toLowerCase();
  const exists = mockUsersDb.some(u => u.username === cleanUser);
  
  if (exists) return null;

  const newUser = new UserModel({ username: cleanUser, password, role: 'Customer' });
  mockUsersDb.push(newUser);
  return { username: newUser.username, role: newUser.role };
};

export const verifyRolePermission = (userRole, allowedRoles) => {
  return allowedRoles.includes(userRole);
};