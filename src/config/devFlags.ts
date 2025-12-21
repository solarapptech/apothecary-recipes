export const ENABLE_DEV_RESET = (() => {
  const raw = (process.env.EXPO_PUBLIC_ENABLE_DEV_RESET ?? '').trim().toLowerCase();
  return raw === 'true' || raw === '1' || raw === 'yes';
})();
