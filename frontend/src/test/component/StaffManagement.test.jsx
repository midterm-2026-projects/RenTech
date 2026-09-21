import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from '@testing-library/react';

import '@testing-library/jest-dom';

import { vi } from 'vitest';

vi.mock('../../services/inventoryApiClient', () => ({
  getStaffList: vi.fn(async () => []),
  addStaff: vi.fn(async () => ({ message: 'Staff added successfully' })),
  removeStaff: vi.fn(async () => ({ message: 'Staff removed' })),
}));

import StaffManagement from '../../components/StaffManagement.jsx';

describe('Staff Management - Video Validation Test Suite', () => {
  test('should display Both fields are required if the username field is left empty', () => {
    render(<StaffManagement />);

    const passwordInput =
      screen.getByPlaceholderText('Password');

    fireEvent.change(passwordInput, {
      target: {
        value: 'password123',
      },
    });

    fireEvent.click(
      screen.getByText('+ Add')
    );

    expect(
      screen.getByText('Both fields are required')
    ).toBeInTheDocument();
  });

  test('should display Both fields are required if the password field is left empty', () => {
    render(<StaffManagement />);

    const usernameInput =
      screen.getByPlaceholderText('Username');

    fireEvent.change(usernameInput, {
      target: {
        value: 'teststaff',
      },
    });

    fireEvent.click(
      screen.getByText('+ Add')
    );

    expect(
      screen.getByText('Both fields are required')
    ).toBeInTheDocument();
  });

  test('should clear out the entry input text boxes immediately following a successful add', async () => {
    render(<StaffManagement />);

    const usernameInput =
      screen.getByPlaceholderText('Username');

    const passwordInput =
      screen.getByPlaceholderText('Password');

    fireEvent.change(usernameInput, {
      target: {
        value: 'newstaff',
      },
    });

    fireEvent.change(passwordInput, {
      target: {
        value: 'password123',
      },
    });

    fireEvent.click(
      screen.getByText('+ Add')
    );

    await waitFor(() => {
      expect(usernameInput.value).toBe('');
      expect(passwordInput.value).toBe('');
    });
  });
});