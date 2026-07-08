import {ProfileModel, IntegrationModel,TemplateModel} from "../model/SystemSetting.model.js";

let profile = new ProfileModel({
  name: "Admin User",
  role: "Admin Role",
  email: "user@rentech.com",
  phone: "+63 917 123 4567"
});

let integrations = [
  new IntegrationModel({
    id: 1,
    name: "Semaphore SMS Gateway",
    status: "Connected",
    desc: "Automated return reminders & booking confirmations."
  }),

  new IntegrationModel({
    id: 2,
    name: "PayMongo Payments",
    status: "Active",
    desc: "Secure GCash & Credit Card downpayments."
  })
];

let templates = new TemplateModel({
  bookingConfirmation:
    "Hi {customerName}, your booking for {itemName} on {rentalDate} is confirmed! Show this QR when you pick up your item: {qrCode}. Thank you for choosing RENTECH.",

  returnReminder:
    "Hi {customerName}, this is a friendly reminder to return your rented item '{itemName}' by {returnDate}. Late returns are subject to penalties. - RENTECH",

  overdueAlert:
    "URGENT: {customerName}, your rental for '{itemName}' is overdue. Please return it immediately to avoid additional charges. - RENTECH",

  paymentConfirmation:
    "Hi {customerName}, we received your downpayment of ₱{downpaymentAmount} for '{itemName}'. Remaining balance ₱{balanceAmount} is due at pickup. - RENTECH"
});

export const getProfile = async () => {
  return profile;
};

export const getIntegrations = async () => {
  return integrations;
};

export const getTemplates = async () => {
  return templates;
};

export const updateTemplate = async (key, value) => {

  if (!templates[key]) {
    throw new Error("Template not found.");
  }

  templates[key] = value;

  return templates;
};

const defaultTemplates = { ...templates };

export const resetTemplate = async (key) => {

  if (!defaultTemplates[key]) {
    throw new Error("Template not found.");
  }

  templates[key] = defaultTemplates[key];

  return templates;
};

export const resetAllTemplates = async () => {

  templates = new TemplateModel(defaultTemplates);

  return templates;
};

export const signOut = async () => {
  return {
    success: true,
    message: "User signed out successfully."
  };
};