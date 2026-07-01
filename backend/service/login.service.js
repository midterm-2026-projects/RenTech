import { UserModel, RentalRecordModel } from '../model/login.model.js'; 

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


// WEEK2 DAY2
export const assignUserRole = async (targetUsername, newRole, updaterRole) => {
  if (updaterRole !== 'Admin') {
    throw new Error('Unauthorized: Only Admins can assign roles');
  }

  const validRoles = ['Admin', 'Staff', 'Customer'];
  if (!validRoles.includes(newRole)) {
    throw new Error('Invalid role specified');
  }

  const cleanUser = targetUsername.trim().toLowerCase();
  const user = mockUsersDb.find(u => u.username === cleanUser);

  if (!user) {
    throw new Error('User not found');
  }

  user.role = newRole; 
  return { username: user.username, role: user.role };
};

