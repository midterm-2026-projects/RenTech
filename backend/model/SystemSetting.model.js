export class ProfileModel {
  constructor(data) {
    this.name = data.name;
    this.role = data.role;
    this.email = data.email;
    this.phone = data.phone;
  }
}

export class IntegrationModel {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.status = data.status;
    this.desc = data.desc;
  }
}

export class TemplateModel {
  constructor(data) {
    this.bookingConfirmation = data.bookingConfirmation;
    this.returnReminder = data.returnReminder;
    this.overdueAlert = data.overdueAlert;
    this.paymentConfirmation = data.paymentConfirmation;
  }
}