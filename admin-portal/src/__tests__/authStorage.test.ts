import { AdminAuthStorageService } from '../services/authStorage';

describe('AdminAuthStorageService Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('persists admin JWT token after successful authentication', () => {
    const token = 'admin-jwt-token-998877';
    AdminAuthStorageService.saveToken(token);

    expect(localStorage.getItem('pondfish_admin_jwt')).toBe(token);
  });

  it('restores stored admin JWT token on application startup', () => {
    const token = 'stored-admin-jwt-554433';
    localStorage.setItem('pondfish_admin_jwt', token);

    const restoredToken = AdminAuthStorageService.getToken();
    expect(restoredToken).toBe(token);
  });

  it('returns null when no admin token is stored', () => {
    const restoredToken = AdminAuthStorageService.getToken();
    expect(restoredToken).toBeNull();
  });

  it('removes stored admin JWT token upon logout', () => {
    localStorage.setItem('pondfish_admin_jwt', 'admin-token-to-delete');
    AdminAuthStorageService.clearToken();

    expect(localStorage.getItem('pondfish_admin_jwt')).toBeNull();
  });

  it('safely handles unreadable storage', () => {
    const spy = jest.spyOn(Storage.prototype, 'getItem').mockImplementationOnce(() => {
      throw new Error('Access denied');
    });

    const token = AdminAuthStorageService.getToken();
    expect(token).toBeNull();

    spy.mockRestore();
  });
});
