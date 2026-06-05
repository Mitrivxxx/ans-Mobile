import { SPLASH_BACKGROUND_LIGHT, SPLASH_IMAGE_WIDTH } from '../../theme/splashTheme.constants';

/** Tło natywnego splash i AppSplashView — jedno źródło z splashTheme.constants */
export const SPLASH_BACKGROUND = SPLASH_BACKGROUND_LIGHT;

/** Szerokość logo — ta sama co imageWidth w pluginie expo-splash-screen. */
export { SPLASH_IMAGE_WIDTH };

/** Ten sam asset co w app.config.ts / expo-splash-screen. */
export const splashIcon = require('../../../assets/splash-icon.png');
