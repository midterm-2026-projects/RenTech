import React from 'react';
import { render, screen, fireEvent, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import '@testing-library/jest-dom';
import SystemSetting from '../../components/SystemSetting.jsx';

describe('SystemSetting Component - Unit Tests', () => {

  const renderAndClearLoading = async () => {
    render(<SystemSetting/>);
    
    const loadingText = screen.getByText(/Loading component states/i);
    await waitForElementToBeRemoved(loadingText);
  };

  describe('Rendering & Visibility', () => {
    test('renders the main layout, header elements, and title banner', async () => {
      await renderAndClearLoading();

      expect(screen.getByText('Account & Settings')).toBeInTheDocument();
      expect(screen.getByText('Manage preferences and system notifications.')).toBeInTheDocument();
    });

    test('renders profile info card with correct user information', async () => {
      await renderAndClearLoading();

      expect(screen.getByText('Admin User')).toBeInTheDocument();
      expect(screen.getByText('Admin Role')).toBeInTheDocument();
      expect(screen.getByText('user@rentech.com')).toBeInTheDocument();
    });

    test('renders system integration statuses', async () => {
      await renderAndClearLoading();

      expect(screen.getByText('Semaphore SMS Gateway')).toBeInTheDocument();
      expect(screen.getByText('PayMongo Payments')).toBeInTheDocument();
      expect(screen.getAllByText('Connected').length).toBeGreaterThan(0);
    });

    test('renders all expected SMS template sub-cards initially', async () => {
      await renderAndClearLoading();

      expect(screen.getByText('Booking Confirmation')).toBeInTheDocument();
      expect(screen.getByText('Return Reminder')).toBeInTheDocument();
      expect(screen.getByText('Overdue Alert')).toBeInTheDocument();
      expect(screen.getByText('Payment Confirmation')).toBeInTheDocument();
    });
  });

  describe('Template Interaction Logic', () => {
    test('smoothly opens edit mode, modifies content, updates state, and toggles back to display mode', async () => {
      await renderAndClearLoading();

      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();

      fireEvent.change(textarea, { target: { value: 'New updated booking text template alert!' } });

      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      expect(screen.getByText('New updated booking text template alert!')).toBeInTheDocument();
      expect(screen.getByText('Template modified successfully (Mock Save)!')).toBeInTheDocument();
    });

    test('allows a user to cancel an active edit without mutating current state', async () => {
      await renderAndClearLoading();

      const originalText = screen.getByText(/Hi {customerName}, your booking for/i).textContent;

      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'Spam text configuration change request.' } });

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(screen.getByText(originalText)).toBeInTheDocument();
    });

    test('does not save template changes if text area is cleared or purely whitespace', async () => {
      await renderAndClearLoading();

      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: '   ' } });

      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      expect(screen.getByText('Template content cannot be blank or empty.')).toBeInTheDocument();
    });

    test('resets an individual template card back to default successfully', async () => {
      await renderAndClearLoading();

      fireEvent.click(screen.getAllByText('Edit')[0]);
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Temporary text' } });
      fireEvent.click(screen.getByText('Save'));

      const resetButtons = screen.getAllByText('Reset');
      fireEvent.click(resetButtons[0]);

      expect(screen.getByText('Template reverted to system default.')).toBeInTheDocument();
    });

    test('resets all templates simultaneously via global reset CTA link', async () => {
      await renderAndClearLoading();

      const globalResetBtn = screen.getByText('Reset all templates to defaults');
      fireEvent.click(globalResetBtn);

      expect(screen.getByText('All templates reset to defaults.')).toBeInTheDocument();
    });
  });
});