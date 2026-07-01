export class UserModel {
  constructor({ username, password, role }) {
    this.username = username.trim().toLowerCase();
    this.password = password;
    this.role = role || 'Customer'; 
  }
} 
// WEEK 2 DAY 2
export class RentalRecordModel {
  constructor({ id, username, itemName, pricePerDay, daysRented, status, date }) {
    this.id = id;
    this.username = username.trim().toLowerCase();
    this.itemName = itemName;
    this.pricePerDay = Number(pricePerDay);
    this.daysRented = Number(daysRented);
    this.totalCost = this.pricePerDay * this.daysRented;
    this.status = status || 'Pending'; // e.g., 'Pending', 'Active', 'Completed'
    this.date = date || new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  }
}