import { UserModel, RentalRecordModel } from '../model/login.model.js'; 

const mockUsersDb = [
  new UserModel({ username: 'admin', password: 'admin', role: 'Admin' }),
  new UserModel({ username: 'staff', password: 'staff', role: 'Staff' }),
  new UserModel({ username: 'customer', password: 'customer', role: 'Customer' })
];

// WEEK2 DAY2
const mockRentalsDb = [
  new RentalRecordModel({ id: 'r1', username: 'customer', itemName: 'Laptop', pricePerDay: 20, daysRented: 5, status: 'Completed', date: '2026-06-15' }),
  new RentalRecordModel({ id: 'r2', username: 'customer', itemName: 'Camera', pricePerDay: 35, daysRented: 2, status: 'Active', date: '2026-06-28' }),
  new RentalRecordModel({ id: 'r3', username: 'alice', itemName: 'Projector', pricePerDay: 50, daysRented: 3, status: 'Pending', date: '2026-07-01' })
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

export const getRentalHistory = async (filters = {}) => {
  let filteredRecords = [...mockRentalsDb];

  if (filters.username) {
    const cleanUser = filters.username.trim().toLowerCase();
    filteredRecords = filteredRecords.filter(r => r.username === cleanUser);
  }

  if (filters.status) {
    filteredRecords = filteredRecords.filter(r => r.status.toLowerCase() === filters.status.toLowerCase());
  }

  if (filters.itemName) {
    filteredRecords = filteredRecords.filter(r => r.itemName.toLowerCase().includes(filters.itemName.toLowerCase()));
  }

  return filteredRecords;
};

export const getTransactionSummary = async (username = null) => {
  let targetRecords = [...mockRentalsDb];

  if (username) {
    const cleanUser = username.trim().toLowerCase();
    targetRecords = targetRecords.filter(r => r.username === cleanUser);
  }

  const totalTransactions = targetRecords.length;
  const totalRevenue = targetRecords.reduce((sum, record) => sum + record.totalCost, 0);
  
  const statusCounts = targetRecords.reduce((acc, record) => {
    acc[record.status] = (acc[record.status] || 0) + 1;
    return acc;
  }, {});

  return {
    totalTransactions,
    totalRevenue,
    statusCounts
  };
};