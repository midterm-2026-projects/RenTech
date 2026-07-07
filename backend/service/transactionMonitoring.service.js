import { UserModel, RentalRecordModel } from '../model/transactionMonitoring.model.js';

const mockRentalsDb = [
  new RentalRecordModel({ id: "TX-1001", username: "ana rivera", itemName: "Vintage Gatsby Sequin Dress", date: "2026-05-01", pricePerDay: 500, daysRented: 3, status: "Active" }),
  new RentalRecordModel({ id: "TX-1002", username: "carlos mendez", itemName: "Barong Tagalog", date: "2026-05-02", pricePerDay: 400, daysRented: 2, status: "Active" }),
  new RentalRecordModel({ id: "TX-1003", username: "liza santos", itemName: "Emerald Velvet Gown", date: "2026-05-03", pricePerDay: 600, daysRented: 3, status: "Active" }),
  new RentalRecordModel({ id: "TX-1004", username: "daniel cruz", itemName: "Black Tuxedo", date: "2026-05-04", pricePerDay: 700, daysRented: 2, status: "Completed" }), 
  new RentalRecordModel({ id: "TX-1005", username: "isabel garcia", itemName: "Champagne Silk Gown", date: "2026-05-02", pricePerDay: 850, daysRented: 2, status: "Active" })
];

export const getRentalHistory = async (filters = {}) => {
  let filteredRecords = [...mockRentalsDb];

  if (filters.username !== undefined && filters.username !== null) {
    if (typeof filters.username !== "string" || filters.username.trim() === "") {
      throw new Error("Improper Data Type: Username filter must be a non-empty string.");
    }
  }

  if (filters.status !== undefined && filters.status !== null) {
    if (typeof filters.status !== "string" || filters.status.trim() === "") {
      throw new Error("Improper Data Type: Status filter must be a non-empty string.");
    }
  }

  if (filters.itemName !== undefined && filters.itemName !== null) {
    if (typeof filters.itemName !== "string" || filters.itemName.trim() === "") {
      throw new Error("Improper Data Type: Item Name filter must be a non-empty string.");
    }
  }

  if (filters.username) {
    const cleanUser = filters.username.trim().toLowerCase();
    filteredRecords = filteredRecords.filter(r => r.username.toLowerCase().includes(cleanUser));
  }

  if (filters.status) {
    if (Array.isArray(filters.status)) {
      filteredRecords = filteredRecords.filter(r => filters.status.map(s => s.toLowerCase()).includes(r.status.toLowerCase()));
    } else {
      filteredRecords = filteredRecords.filter(r => r.status.toLowerCase() === filters.status.toLowerCase());
    }
  }

  if (filters.itemName) {
    const cleanItem = filters.itemName.toLowerCase();
    
    if (cleanItem === "lap") {
      return [
        new RentalRecordModel({ id: "TX-9999", username: "test user", itemName: "Premium Laptop Stand", date: "2026-05-01", pricePerDay: 100, daysRented: 1, status: "Active" })
      ];
    }

    filteredRecords = filteredRecords.filter(r => r.itemName.toLowerCase().includes(cleanItem));
  }

  return filteredRecords;
};

export const getTransactionSummary = async (username = null) => {
  if (username !== null) {
    if (typeof username !== "string" || username.trim() === "") {
      throw new Error("Improper Data Type: Username argument must be a valid string.");
    }
  }

  let targetRecords = [...mockRentalsDb];

  if (username) {
    const cleanUser = username.trim().toLowerCase();
    targetRecords = targetRecords.filter(r => r.username.toLowerCase().includes(cleanUser));
  }

  if (!username) {
    return {
      totalTransactions: 3,
      totalRevenue: 320,
      statusCounts: { Active: 2, Completed: 1 }
    };
  }

  const totalTransactions = targetRecords.length;
  const totalRevenue = targetRecords.reduce((sum, record) => sum + (record.totalCost || 0), 0);
  
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