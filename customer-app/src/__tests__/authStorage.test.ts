import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthStorageService } from '../services/authStorage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('AuthStorageService Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('persists authenticated customer JWT token after successful authentication', async () => {
    const token = 'mock-jwt-token-12345';
    await AuthStorageService.saveToken(token);

    expect(AsyncStorage.setItem).toHaveBeenCalledWith('@pondfish_customer_jwt', token);
  });

  it('restores persisted JWT token on application startup', async () => {
    const mockToken = 'stored-jwt-token-abc';
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(mockToken);

    const token = await AuthStorageService.getToken();

    expect(token).toBe(mockToken);
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('@pondfish_customer_jwt');
  });

  it('returns null when no token is present in storage', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

    const token = await AuthStorageService.getToken();

    expect(token).toBeNull();
  });

  it('handles corrupted or unreadable storage gracefully by clearing token', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('Storage corrupted'));

    const token = await AuthStorageService.getToken();

    expect(token).toBeNull();
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@pondfish_customer_jwt');
  });

  it('removes persisted authentication state upon logout', async () => {
    await AuthStorageService.clearToken();

    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@pondfish_customer_jwt');
  });
});
