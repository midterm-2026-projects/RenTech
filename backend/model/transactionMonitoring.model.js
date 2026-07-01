
export class RentalRecordModel {
  constructor({
    id,
    username,
    itemName,
    pricePerDay,
    daysRented,
    status,
    date,
  }) {
    this.id = id;
    this.username = username.trim().toLowerCase();
    this.itemName = itemName;
    this.pricePerDay = Number(pricePerDay);
    this.daysRented = Number(daysRented);

    this.totalCost = this.pricePerDay * this.daysRented;

    this.status = status || "Pending";

    this.date =
      date || new Date().toISOString().split("T")[0];
  }
}