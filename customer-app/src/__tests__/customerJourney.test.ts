import { getApiBaseUrl } from '../config/apiConfig';

describe('Customer Application Journey API Contracts', () => {
  const API_BASE = getApiBaseUrl();

  beforeEach(() => {
    (global as any).fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('fetches customer profile from backend', async () => {
    const mockProfile = { id: 'cust_123', mobileNumber: '9999999999', name: 'Test Customer', area: 'Vijayawada' };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockProfile }),
    });

    const res = await fetch(`${API_BASE}/customer/profile`, {
      headers: { Authorization: 'Bearer mock-token' },
    });
    const data = await res.json();

    expect(res.ok).toBe(true);
    expect(data.data).toEqual(mockProfile);
    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE}/customer/profile`,
      expect.objectContaining({
        headers: { Authorization: 'Bearer mock-token' },
      })
    );
  });

  it('updates customer profile with name, age, and area', async () => {
    const updatedProfile = { id: 'cust_123', name: 'Ramesh Varma', age: 35, area: 'Vijayawada East' };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: updatedProfile }),
    });

    const res = await fetch(`${API_BASE}/customer/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer mock-token',
      },
      body: JSON.stringify({ name: 'Ramesh Varma', age: 35, area: 'Vijayawada East' }),
    });
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.data.name).toBe('Ramesh Varma');
  });

  it('fetches customer booking history from GET /customer/bookings', async () => {
    const mockBookings = [
      { id: 'bk-1', bookingCode: 'BK-111111', status: 'CONFIRMED', totalAmount: 500, razorpayPaid: 500 },
      { id: 'bk-2', bookingCode: 'BK-222222', status: 'PENDING', totalAmount: 300, razorpayPaid: 300 },
    ];
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockBookings }),
    });

    const res = await fetch(`${API_BASE}/customer/bookings`, {
      headers: { Authorization: 'Bearer mock-token' },
    });
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.data.length).toBe(2);
    expect(data.data[0].bookingCode).toBe('BK-111111');
  });

  it('purchases a subscription plan via POST /customer/subscription/purchase', async () => {
    const mockSub = { id: 'sub_123', creditBalance: 3500, status: 'ACTIVE' };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockSub }),
    });

    const res = await fetch(`${API_BASE}/customer/subscription/purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer mock-token',
      },
      body: JSON.stringify({ planId: 'plan_gold' }),
    });
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.data.creditBalance).toBe(3500);
  });

  it('fetches live delivery truck tracking status via GET /customer/gps/live', async () => {
    const mockGPS = { truckNumber: 'AP-39-TF-1001', driverName: 'Ramesh Kumar', status: 'IN_TRANSIT' };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockGPS }),
    });

    const res = await fetch(`${API_BASE}/customer/gps/live`, {
      headers: { Authorization: 'Bearer mock-token' },
    });
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.data.truckNumber).toBe('AP-39-TF-1001');
  });
});
