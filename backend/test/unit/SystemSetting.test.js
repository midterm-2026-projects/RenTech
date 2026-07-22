import { describe, it, expect, vi } from 'vitest';

const DEFAULTS = {
  bookingConfirmation: "Hi {customerName}, your booking for {itemName} on {rentalDate} is confirmed! Show this QR when you pick up your item: {qrCode}. Thank you for choosing RENTECH.",
  returnReminder: "Hi {customerName}, this is a friendly reminder to return your rented item '{itemName}' by {returnDate}. Late returns are subject to penalties. - RENTECH",
  overdueAlert: "URGENT: {customerName}, your rental for '{itemName}' is overdue. Please return it immediately to avoid additional charges. - RENTECH",
  paymentConfirmation: "Hi {customerName}, we received your downpayment of ₱{downpaymentAmount} for '{itemName}'. Remaining balance ₱{balanceAmount} is due at pickup. - RENTECH",
};

function buildSupabase() {
  let prefix = '';
  const q = {
    from: () => q,
    select: () => q,
    ilike: (_col, val) => { prefix = val.replace('%', ''); return q; },
    upsert: async ({ key, value }) => { DEFAULTS[key] = value; return { error: null }; },
    order: () => q,
    range: () => q,
    then: (fn) => {
      const entries = Object.entries(DEFAULTS)
        .filter(([k]) => k.startsWith(prefix))
        .map(([key, value]) => ({ key, value }));
      return Promise.resolve({ data: entries, error: null }).then(fn);
    },
  };
  return q;
}

vi.mock('../../config/supabaseClient.js', () => ({
  getSupabase: () => buildSupabase(),
}));

const {
  getProfile,
  getIntegrations,
  getTemplates,
  updateTemplate,
  resetTemplate,
  resetAllTemplates,
  signOut,
} = await import('../../service/SystemSetting.service.js');

describe('Week 3 Day 2 - SystemSetting Unit Tests', () => {
  it('should fetch the system administrator profile details', async () => {
    const profile = await getProfile();
    expect(profile).toBeDefined();
    expect(profile.name).toBe('Admin User');
    expect(profile.role).toBe('Admin Role');
    expect(profile.email).toBe('user@rentech.com');
  });

  it('should retrieve all configured third-party active integrations', async () => {
    const integrations = await getIntegrations();
    expect(integrations).toHaveLength(2);
    expect(integrations[0]).toEqual({
      id: 1,
      name: 'Semaphore SMS Gateway',
      status: 'Connected',
      desc: 'Automated return reminders & booking confirmations.',
    });
  });

  it('should return initial message templates matching system baseline defaults', async () => {
    const templates = await getTemplates();
    expect(templates.bookingConfirmation).toContain('{customerName}');
    expect(templates.overdueAlert).toContain('URGENT:');
  });

  it('should update the specified template value successfully', async () => {
    const newTemplateText = "Hi {customerName}, your custom reminder is here!";
    const updated = await updateTemplate('returnReminder', newTemplateText);
    expect(updated.returnReminder).toBe(newTemplateText);

    const verifyData = await getTemplates();
    expect(verifyData.returnReminder).toBe(newTemplateText);
  });

  it('should throw an error when trying to update a non-existent template key', async () => {
    await expect(
      updateTemplate('invalidKeyName', 'Some random content string')
    ).rejects.toThrow('Template not found.');
  });

  it('should revert a single customized template back to its initial value', async () => {
    await updateTemplate('bookingConfirmation', 'Customized text body');
    const reverted = await resetTemplate('bookingConfirmation');
    expect(reverted.bookingConfirmation).toContain('Hi {customerName}, your booking for');
  });

  it('should throw an error when trying to reset an invalid template key', async () => {
    await expect(
      resetTemplate('ghostKey')
    ).rejects.toThrow('Template not found.');
  });

  it('should flush all template changes and reset the full set to baseline defaults', async () => {
    await updateTemplate('bookingConfirmation', 'Poisoned Booking String');
    await updateTemplate('paymentConfirmation', 'Poisoned Payment String');

    const freshTemplates = await resetAllTemplates();

    expect(freshTemplates.bookingConfirmation).not.toBe('Poisoned Booking String');
    expect(freshTemplates.bookingConfirmation).toContain('Hi {customerName}, your booking for');
    expect(freshTemplates.paymentConfirmation).toContain('we received your downpayment');
  });

  it('should handle clean user log out session responses', async () => {
    const sessionResult = await signOut();
    expect(sessionResult).toEqual({
      success: true,
      message: 'User signed out successfully.',
    });
  });
});