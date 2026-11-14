// Static assets exported from the Yumban Figma file (assets/figma).
export const figma = {
  splashEllipse: require('@/assets/figma/splash-ellipse.svg'),
  /** New Yumban logo (heart with Y), white, splash size 125x111 */
  logoWhite: require('@/assets/figma/logo-white.svg'),
  /** logo-white.svg recoloured #EA2F7D: the large cropped heart on the splash */
  splashHeartBg: require('@/assets/figma/splash-heart-bg.svg'),
  /** Same logo exported at login size 90x80 */
  logoWhiteLogin: require('@/assets/figma/logo-white-login.svg'),
  /** Pink logo ("Icon", 2206:75), for use on light backgrounds */
  logoPink: require('@/assets/figma/logo-pink.svg'),
  ringGold: require('@/assets/figma/ring-gold.png'),
  ringShadow: require('@/assets/figma/ring-shadow.png'),
  couple: require('@/assets/figma/couple.png'),
  arrow: require('@/assets/figma/arrow.svg'),
  prefHeartStroke: require('@/assets/figma/pref-heart-stroke.svg'),
  prefWordmark: require('@/assets/figma/pref-wordmark.svg'),
  prefHeart: require('@/assets/figma/pref-heart.svg'),
  avatarPlaceholder: require('@/assets/figma/avatar-placeholder.svg'),
  verifiedBadge: require('@/assets/figma/verified-badge.svg'),
  steppers: [
    require('@/assets/figma/stepper-1.svg'),
    require('@/assets/figma/stepper-2.svg'),
    require('@/assets/figma/stepper-3.svg'),
    require('@/assets/figma/stepper-4.svg'),
  ],
} as const;
