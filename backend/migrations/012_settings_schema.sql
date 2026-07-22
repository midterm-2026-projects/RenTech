CREATE TABLE IF NOT EXISTS settings (
  key VARCHAR(255) PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default templates
INSERT INTO settings (key, value) VALUES
('bookingConfirmation', 'Hi {customerName}, your booking for {itemName} on {rentalDate} is confirmed! Show this QR when you pick up your item: {qrCode}. Thank you for choosing RENTECH.'),
('returnReminder', 'Hi {customerName}, this is a friendly reminder to return your rented item ''{itemName}'' by {returnDate}. Late returns are subject to penalties. - RENTECH'),
('overdueAlert', 'URGENT: {customerName}, your rental for ''{itemName}'' is overdue. Please return it immediately to avoid additional charges. - RENTECH'),
('paymentConfirmation', 'Hi {customerName}, we received your downpayment of ₱{downpaymentAmount} for ''{itemName}''. Remaining balance ₱{balanceAmount} is due at pickup. - RENTECH'),
('profile_name', 'Admin User'),
('profile_role', 'Admin Role'),
('profile_email', 'user@rentech.com'),
('profile_phone', '+63 917 123 4567'),
('integration_semaphore_name', 'Semaphore SMS Gateway'),
('integration_semaphore_status', 'Connected'),
('integration_semaphore_desc', 'Automated return reminders & booking confirmations.'),
('integration_paymongo_name', 'PayMongo Payments'),
('integration_paymongo_status', 'Active'),
('integration_paymongo_desc', 'Secure GCash & Credit Card downpayments.')
ON CONFLICT (key) DO NOTHING;
