import { isRememberMeEnabled } from './rememberMe.storage';
import { hasAppLoginRecord } from './sessionUser.storage';

/** Czy cold start może od razu pokazać dashboard (silent login w tle). */
export async function isRememberMeRestoreEligible(): Promise<boolean> {
  if (!(await isRememberMeEnabled())) {
    return false;
  }
  return hasAppLoginRecord();
}
