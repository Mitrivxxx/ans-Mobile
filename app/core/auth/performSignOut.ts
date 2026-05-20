import { clearProfilePhotoSessionCache } from '../scraper/features/profile/profilePhotoSessionCache';
import { clearUserAppCache } from '../queryClient/clearUserAppCache';
import { AuthService } from '../scraper/auth/auth.service';
import { clearRememberMe } from './rememberMe.storage';
import { clearLastUsername } from './sessionUser.storage';

export async function performSignOut(): Promise<void> {
  clearProfilePhotoSessionCache();
  const authService = new AuthService();
  await authService.logout();
  await clearRememberMe();
  await clearLastUsername();
  await clearUserAppCache();
}
