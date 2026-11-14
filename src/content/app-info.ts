/**
 * App information and legal copy shown in Settings.
 *
 * IMPORTANT: the Terms and Privacy text below are starting drafts written for
 * this prototype. Have them reviewed by a lawyer and update the company details
 * before publishing to the App Store / Google Play.
 */

export const APP_INFO = {
  name: 'Yumban',
  company: 'Neopath',
  /** Placeholder: replace with the real support address. */
  supportEmail: 'support@yumban.app',
  /** Shown at the top of the Terms and Privacy pages. */
  legalUpdated: '14 November 2026',
};

export interface InfoSection {
  heading?: string;
  body: string;
}

export interface InfoPage {
  title: string;
  intro?: string;
  sections: InfoSection[];
}

export const ABOUT: InfoPage = {
  title: 'About Yumban',
  intro: 'Manipur’s first matrimony app, built to help Muslims find a life partner in an easy and 100% halal way.',
  sections: [
    {
      heading: 'Our purpose',
      body: 'Finding the right partner shouldn’t mean endless travel and expense. Yumban lets you meet people near you who share your values, then take things forward with your families, the halal way.',
    },
    {
      heading: 'How it works',
      body: 'Create your profile, tell us who you’re looking for, and swipe right on people you like. When you both favourite each other, it’s a match, and you can get in touch.',
    },
    {
      heading: 'Safety first',
      body: 'Profiles marked with the verified badge have been checked by the Yumban team. Never send money to anyone you meet on the app, and report anything that doesn’t feel right.',
    },
  ],
};

export const TERMS: InfoPage = {
  title: 'Terms of Service',
  intro: `Last updated ${APP_INFO.legalUpdated}. Draft: to be reviewed before launch.`,
  sections: [
    { heading: '1. Who can use Yumban', body: 'You must be at least 18 years old and legally able to marry. Yumban is for people sincerely seeking marriage. You may only create one account, and the information you give must be true.' },
    { heading: '2. Your account', body: 'You are responsible for keeping your login details safe and for everything that happens under your account. Tell us straight away if you think someone else has used it.' },
    { heading: '3. Respectful conduct', body: 'Treat other members with respect. Harassment, hate speech, explicit content, scams, impersonation and asking others for money are not allowed. We may suspend or remove accounts that break these rules.' },
    { heading: '4. Premium', body: 'Premium is a paid subscription that unlocks extra features. Payments are handled by the App Store or Google Play and renew automatically unless cancelled in your store account settings at least 24 hours before the period ends. Refunds follow the store’s policy.' },
    { heading: '5. Content', body: 'You keep ownership of the photos and text you add, and give Yumban permission to show them to other members in order to run the service.' },
    { heading: '6. No guarantees', body: 'We work hard to keep Yumban safe, but we can’t guarantee the identity, intentions or conduct of other members. Please meet in public, involve your family, and use your judgement.' },
    { heading: '7. Ending your account', body: 'You can delete your account at any time from Settings. We may close accounts that break these terms.' },
    { heading: '8. Changes', body: 'We may update these terms. If the changes are important we’ll let you know in the app.' },
    { heading: '9. Contact', body: `Questions? Email ${APP_INFO.supportEmail}.` },
  ],
};

export const PRIVACY: InfoPage = {
  title: 'Privacy Policy',
  intro: `Last updated ${APP_INFO.legalUpdated}. Draft: to be reviewed before launch.`,
  sections: [
    { heading: 'What we collect', body: 'The details you give us: name, phone, email (optional), date of birth, address, profession, photo, height, hobbies, faith answers and partner preferences. We also record who you favourite or pass so we don’t show the same people again.' },
    { heading: 'What other members see', body: 'Your name, photo, age, height, town, profession, relationship status, hobbies, faith answers and “about” text. Your phone number is only shared with people you have matched with, and only when you or they use the Call or WhatsApp buttons.' },
    { heading: 'How we use it', body: 'To run Yumban: showing you suitable profiles, matching you, sending you notifications, keeping the community safe and providing support. We do not sell your personal data.' },
    { heading: 'Where it’s stored', body: 'Your data is stored securely. Passwords are never stored in plain text.' },
    { heading: 'Your choices', body: 'You can edit your profile at any time, and you can delete your account from Settings. Deleting your account removes your profile, favourites and matches.' },
    { heading: 'Children', body: 'Yumban is only for people aged 18 and over.' },
    { heading: 'Contact', body: `For privacy questions or requests, email ${APP_INFO.supportEmail}.` },
  ],
};

export const FAQ: { q: string; a: string }[] = [
  { q: 'How do matches work?', a: 'Swipe right (or tap the heart) on someone you like. If they favourite you too, it’s a match and you’ll get a notification.' },
  { q: 'How many profiles can I see each day?', a: 'Free members can see 10 profiles a day. The count resets at midnight. Premium members can keep discovering without a limit.' },
  { q: 'How do I contact a match?', a: 'Open their profile and tap Call or WhatsApp. Contacting matches is a Premium feature.' },
  { q: 'What does the verified badge mean?', a: 'The blue badge means the Yumban team has checked that person’s identity.' },
  { q: 'Who can see my phone number?', a: 'Only people you’ve matched with, through the Call and WhatsApp buttons. It is never shown on your public profile.' },
  { q: 'How do I change who I see?', a: 'Tap the filters button on Discover, or go to Settings → Partner preferences. You can set age, verified only and faith preferences.' },
  { q: 'How do I cancel Premium?', a: 'Subscriptions are managed by the App Store or Google Play. Cancel from your store account’s subscription settings.' },
  { q: 'How do I delete my account?', a: 'Go to Settings → Delete account. This permanently removes your profile, favourites and matches.' },
];
