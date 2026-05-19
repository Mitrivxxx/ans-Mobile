import { clearUserAppCache } from '../queryClient/clearUserAppCache';
import { AuthService } from '../scraper/auth/auth.service';
import { clearRememberMe } from './rememberMe.storage';

export async function performSignOut(): Promise<void> {
  const authService = new AuthService();
  await authService.logout();
  await clearRememberMe();
  await clearUserAppCache();
}
