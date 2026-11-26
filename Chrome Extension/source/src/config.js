// Build-time configuration (automatically set by scripts/build.mjs)
// Since version 2, DEV_MODE is true in both builds: it unlocks "Check Everything".
// PRIVATE_BUILD is true only in dev/, which talks to a local server.
export const EXTENSION_CONFIG = {
  DEV_MODE: true,
  PRIVATE_BUILD: false,
  DEFAULT_API_BASE: 'https://scamhisn-ai-v2.onrender.com',
  MAX_AUTO_LINKS_PER_PAGE: 6,
};
