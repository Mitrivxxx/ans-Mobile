export const ACCESSIBLE = {
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WHEN_UNLOCKED_THIS_DEVICE_ONLY',
} as const;

export async function getGenericPassword(): Promise<false> {
  return false;
}

export async function setGenericPassword(): Promise<true> {
  return true;
}

export async function resetGenericPassword(): Promise<true> {
  return true;
}

export default {
  ACCESSIBLE,
  getGenericPassword,
  setGenericPassword,
  resetGenericPassword,
};
