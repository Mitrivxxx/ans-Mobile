import { clearAnnouncementsArchive } from '../announcements/archive/announcementsArchive.storage';
import { clearProfilePhotoSessionCache } from '../scraper/features/profile/profilePhotoSessionCache';
import { clearProfilePhotoForUser } from '../scraper/features/profile/profileSummaryPhoto';
import { clearUserAppCache } from '../queryClient/clearUserAppCache';
import { AuthService } from '../scraper/auth/auth.service';
import { clearLastLoginContext } from './lastLoginContext.storage';
import { clearRememberMe, getSavedCredentials } from './rememberMe.storage';
import { clearLastUsername, getLastUsername } from './sessionUser.storage';

/**
 * Pełne lokalne wylogowanie: cookies WD, cache RQ/persist, zdjęcie profilu, remember me.
 * Używane przy przycisku Wyloguj oraz przy cold starcie po sesji bez „Zapamiętaj mnie”.
 */
export async function clearLocalUserSessionData(): Promise<void> {
  clearProfilePhotoSessionCache();

  const creds = await getSavedCredentials();
  const userKey = creds?.username?.trim() ?? (await getLastUsername());
  if (userKey) {
    await clearProfilePhotoForUser(userKey);
    await clearAnnouncementsArchive(userKey);
    await clearLastLoginContext(userKey);
  }

  const authService = new AuthService();
  await authService.logout();
  await clearRememberMe();
  await clearLastUsername();
  await clearUserAppCache();
}
