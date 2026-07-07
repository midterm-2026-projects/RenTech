import { UserModel, RentalRecordModel } from '../model/transactionMonitoring.model.js';

// WEEK2 DAY2
const mockRentalsDb = [
  new RentalRecordModel({ id: 'r1', username: 'customer', itemName: 'Laptop', pricePerDay: 20, daysRented: 5, status: 'Completed', date: '2026-06-15' }),
  new RentalRecordModel({ id: 'r2', username: 'customer', itemName: 'Camera', pricePerDay: 35, daysRented: 2, status: 'Active', date: '2026-06-28' }),
  new RentalRecordModel({ id: 'r3', username: 'alice', itemName: 'Projector', pricePerDay: 50, daysRented: 3, status: 'Pending', date: '2026-07-01' })
];

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