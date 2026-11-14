// Design tokens pulled from the Yumban Figma file.
export const colors = {
  brand: '#FF3389', // splash / login background, stepper active dot
  brandButton: '#F73888', // primary CTA buttons, section headings
  brandDeep: '#E1156B', // inputs on pink background
  brandCircle: '#EA2F7D', // decorative circle on pink screens
  brandText: '#F1277D', // text on white button over pink
  brandPlaceholder: '#FF9DC7', // input placeholder on pink
  brandSoft: '#FFE0ED', // muted text on pink
  brandTint: '#FFD4E7', // gradient end on Start screen

  purple: '#7C3AE3', // selected option
  purpleSoft: '#A66FFC', // option track

  white: '#FFFFFF',
  title: '#7B6270', // big step titles
  body: '#676767',
  label: '#726E6E',
  muted: '#A7A4A4',
  placeholder: '#BEBEBE',
  optionText: '#463B41',
  field: '#F5F5F9',
  cardStackA: '#ECECF4',
  cardStackB: '#E5E5F0',
  chip: '#7B604A',
  danger: '#D92D20',
} as const;

export const fonts = {
  kalam: 'Kalam_400Regular',
  kalamBold: 'Kalam_700Bold',
  inter: 'Inter_400Regular',
  interSemi: 'Inter_600SemiBold',
  interSemiItalic: 'Inter_600SemiBold_Italic',
} as const;

export const radius = {
  pill: 53,
  card: 20,
} as const;

/** Horizontal gutter used on every Figma screen (24px on a 360px frame). */
export const GUTTER = 24;
