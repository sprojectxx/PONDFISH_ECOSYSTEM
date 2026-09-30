import * as React from 'react';
import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import App from '../App';
import { WorkerAuthStorageService } from '../services/authStorage';

// @ts-ignore
global.IS_REACT_ACT_ENVIRONMENT = true;

// Helper to set controlled React input value in JSDOM environment
const setReactInputValue = (input: HTMLInputElement, value: string) => {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
  nativeInputValueSetter?.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
};

const originalFetch = global.fetch;

describe('Worker Portal JWT & Session Error Handling Unit Tests (Scenarios A - H)', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    document.body.removeChild(container);
    global.fetch = originalFetch;
  });

  // TEST A: Valid JWT
  it('TEST A - Valid JWT loads bookings, preserves token and AUTHENTICATED state', async () => {
    WorkerAuthStorageService.saveToken('valid-jwt-token-123');

    global.fetch = jest.fn().mockImplementation((url: string) => {
      if (url.includes('/worker/bookings')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ success: true, data: [{ id: 'b1', bookingCode: 'BK-101', status: 'CONFIRMED', totalAmount: 100, subCreditUsed: 0, razorpayPaid: 100, expiresAt: '', createdAt: '', bookingItems: [] }] }),
        } as Response);
      }
      if (url.includes('/public/fish')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ success: true, data: [] }),
        } as Response);
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    await act(async () => {
      root.render(React.createElement(App));
    });

    expect(WorkerAuthStorageService.getToken()).toBe('valid-jwt-token-123');
    expect(container.textContent).toContain('PONDFISH STORE WORKER TABLET');
    expect(container.textContent).toContain('BK-101');
  });

  // TEST B: HTTP 401
  it('TEST B - HTTP 401 clears token, sets AUTHENTICATION_REQUIRED, renders login with session expired message', async () => {
    WorkerAuthStorageService.saveToken('expired-invalid-jwt-999');

    global.fetch = jest.fn().mockImplementation((url: string) => {
      if (url.includes('/worker/bookings')) {
        return Promise.resolve({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ error: { code: 'ERR_UNAUTHORIZED', message: 'Expired or invalid authentication session token.' } }),
        } as Response);
      }
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ success: true, data: [] }) } as Response);
    });

    await act(async () => {
      root.render(React.createElement(App));
    });

    expect(WorkerAuthStorageService.getToken()).toBeNull();
    expect(localStorage.getItem('pondfish_worker_jwt')).toBeNull();
    expect(container.textContent).toContain('Your session has expired. Please sign in again.');
    expect(container.textContent).toContain('Sign In to Worker Station');
  });

  // TEST C: HTTP 403
  it('TEST C - HTTP 403 preserves token and AUTHENTICATED state', async () => {
    WorkerAuthStorageService.saveToken('valid-token-insufficient-perm');

    global.fetch = jest.fn().mockImplementation((url: string) => {
      if (url.includes('/worker/bookings')) {
        return Promise.resolve({
          ok: false,
          status: 403,
          json: () => Promise.resolve({ error: { code: 'ERR_FORBIDDEN', message: 'Worker role required.' } }),
        } as Response);
      }
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ success: true, data: [] }) } as Response);
    });

    await act(async () => {
      root.render(React.createElement(App));
    });

    expect(WorkerAuthStorageService.getToken()).toBe('valid-token-insufficient-perm');
    expect(container.textContent).toContain('Worker role required.');
    expect(container.textContent).toContain('PONDFISH STORE WORKER TABLET');
  });

  // TEST D: HTTP 500
  it('TEST D - HTTP 500 preserves token and AUTHENTICATED state', async () => {
    WorkerAuthStorageService.saveToken('valid-token-server-error');

    global.fetch = jest.fn().mockImplementation((url: string) => {
      if (url.includes('/worker/bookings')) {
        return Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ error: { code: 'ERR_INTERNAL', message: 'Database connection failed.' } }),
        } as Response);
      }
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ success: true, data: [] }) } as Response);
    });

    await act(async () => {
      root.render(React.createElement(App));
    });

    expect(WorkerAuthStorageService.getToken()).toBe('valid-token-server-error');
    expect(container.textContent).toContain('Database connection failed.');
    expect(container.textContent).toContain('PONDFISH STORE WORKER TABLET');
  });

  // TEST E: Network failure
  it('TEST E - Network failure preserves token and allows retry', async () => {
    WorkerAuthStorageService.saveToken('valid-token-network-drop');

    global.fetch = jest.fn().mockImplementation((url: string) => {
      if (url.includes('/worker/bookings')) {
        return Promise.reject(new Error('Failed to fetch'));
      }
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ success: true, data: [] }) } as Response);
    });

    await act(async () => {
      root.render(React.createElement(App));
    });

    expect(WorkerAuthStorageService.getToken()).toBe('valid-token-network-drop');
    expect(container.textContent).toContain('Network connection error.');
    expect(container.textContent).toContain('PONDFISH STORE WORKER TABLET');
  });

  // TEST F: Re-login after 401
  it('TEST F - Re-login stores new JWT and loads bookings', async () => {
    WorkerAuthStorageService.saveToken('old-expired-token');

    let loginCalls = 0;
    global.fetch = jest.fn().mockImplementation((url: string) => {
      if (url.includes('/worker/bookings')) {
        if (WorkerAuthStorageService.getToken() === 'new-valid-jwt-555') {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ success: true, data: [{ id: 'b2', bookingCode: 'BK-202', status: 'CONFIRMED', totalAmount: 150, subCreditUsed: 0, razorpayPaid: 150, expiresAt: '', createdAt: '', bookingItems: [] }] }),
          } as Response);
        }
        return Promise.resolve({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ error: { message: 'Token expired' } }),
        } as Response);
      }
      if (url.includes('/worker/auth/login')) {
        loginCalls++;
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ success: true, data: { token: 'new-valid-jwt-555' } }),
        } as Response);
      }
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ success: true, data: [] }) } as Response);
    });

    await act(async () => {
      root.render(React.createElement(App));
    });

    expect(WorkerAuthStorageService.getToken()).toBeNull();
    expect(container.textContent).toContain('Sign In to Worker Station');

    const mobileInput = container.querySelector('input[type="tel"]') as HTMLInputElement;
    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    const form = container.querySelector('form') as HTMLFormElement;

    act(() => {
      setReactInputValue(mobileInput, '9876543210');
      setReactInputValue(passwordInput, 'Worker@123');
    });

    await act(async () => {
      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    });

    expect(loginCalls).toBe(1);
    expect(WorkerAuthStorageService.getToken()).toBe('new-valid-jwt-555');
  });

  // TEST G: Booking completion with 401
  it('TEST G - Booking completion receiving 401 clears token safely without JSON parsing error', async () => {
    WorkerAuthStorageService.saveToken('token-expiring-during-completion');

    global.fetch = jest.fn().mockImplementation((url: string) => {
      if (url.includes('/worker/bookings') && !url.includes('/complete')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ success: true, data: [{ id: 'b3', bookingCode: 'BK-303', status: 'CONFIRMED', totalAmount: 200, subCreditUsed: 0, razorpayPaid: 200, expiresAt: '', createdAt: '', bookingItems: [] }] }),
        } as Response);
      }
      if (url.includes('/complete')) {
        return Promise.resolve({
          ok: false,
          status: 401,
          json: () => Promise.reject(new SyntaxError('Unexpected token < in JSON')),
        } as Response);
      }
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ success: true, data: [] }) } as Response);
    });

    await act(async () => {
      root.render(React.createElement(App));
    });

    expect(container.textContent).toContain('BK-303');

    const bookingCard = container.querySelector('div[style*="cursor: pointer"]') as HTMLElement;
    act(() => {
      bookingCard.click();
    });

    const completeBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Verify & Complete Pickup Handover'));
    expect(completeBtn).toBeDefined();

    await act(async () => {
      completeBtn!.click();
    });

    expect(WorkerAuthStorageService.getToken()).toBeNull();
    expect(container.textContent).toContain('Your session has expired. Please sign in again.');
  });

  // TEST H: Cash checkout with 401
  it('TEST H - Cash checkout receiving 401 clears token safely', async () => {
    WorkerAuthStorageService.saveToken('token-expiring-during-cash-checkout');

    global.fetch = jest.fn().mockImplementation((url: string) => {
      if (url.includes('/worker/bookings')) {
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ success: true, data: [] }) } as Response);
      }
      if (url.includes('/public/fish')) {
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ success: true, data: [{ id: 'f1', name: 'Rohu', unitPrice: 200, physicalAvailable: true }] }) } as Response);
      }
      if (url.includes('/worker/transactions/collect-cash')) {
        return Promise.resolve({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ error: { message: 'Session expired' } }),
        } as Response);
      }
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ success: true, data: [] }) } as Response);
    });

    await act(async () => {
      root.render(React.createElement(App));
    });

    const cashTabBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('In-Store Cash Checkout'));
    act(() => {
      cashTabBtn!.click();
    });

    const customerInput = container.querySelector('input[placeholder*="Customer UUID"]') as HTMLInputElement;
    const form = container.querySelector('form') as HTMLFormElement;

    act(() => {
      setReactInputValue(customerInput, '9876543210');
    });

    await act(async () => {
      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    });

    expect(WorkerAuthStorageService.getToken()).toBeNull();
    expect(container.textContent).toContain('Your session has expired. Please sign in again.');
  });
});
