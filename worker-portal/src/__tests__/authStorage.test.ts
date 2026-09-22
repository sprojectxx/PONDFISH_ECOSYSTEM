import { WorkerAuthStorageService } from '../services/authStorage';

describe('WorkerAuthStorageService Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('persists worker JWT token after successful authentication', () => {
    const token = 'worker-jwt-token-12345';
    WorkerAuthStorageService.saveToken(token);

    expect(localStorage.getItem('pondfish_worker_jwt')).toBe(token);
  });

  it('restores stored worker JWT token on application startup', () => {
    const token = 'stored-worker-jwt-999';
    localStorage.setItem('pondfish_worker_jwt', token);

    const restoredToken = WorkerAuthStorageService.getToken();
    expect(restoredToken).toBe(token);
  });

  it('returns null when no worker token is stored', () => {
    const restoredToken = WorkerAuthStorageService.getToken();
    expect(restoredToken).toBeNull();
  });

  it('removes stored worker JWT token upon logout', () => {
    localStorage.setItem('pondfish_worker_jwt', 'token-to-delete');
    WorkerAuthStorageService.clearToken();

    expect(localStorage.getItem('pondfish_worker_jwt')).toBeNull();
  });
});
