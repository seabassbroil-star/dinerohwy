// Dinero Hwy — line icon set.
// Every glyph is authored on a 24px grid, stroke-based (fill:none), so it
// inherits `currentColor` and the street-sign line aesthetic. Inner SVG only.

export const icons = {
  // Products / solutions
  website:
    '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M6.5 6.5h.01M9 6.5h.01"/>',
  assistant:
    '<path d="M4 5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"/><path d="M8.5 10.5h.01M12 10.5h.01M15.5 10.5h.01"/>',
  quote:
    '<path d="M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9Z"/><path d="M13 3v6h6"/><path d="M12 12v5M10 13.2c0-.8.9-1.2 2-1.2s2 .5 2 1.3-.9 1.1-2 1.2-2 .5-2 1.2.9 1.3 2 1.3 2-.4 2-1.2"/>',
  email:
    '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
  ordering:
    '<path d="M6 8h12l-1 12H7L6 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  seo:
    '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m20 20-4.8-4.8"/><path d="M8 11.5v-1M10.5 11.5v-3M13 11.5v-2"/>',
  intel:
    '<circle cx="12" cy="12" r="2"/><path d="M8.5 15.5a5 5 0 0 1 0-7"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M6 18a9 9 0 0 1 0-12"/><path d="M18 6a9 9 0 0 1 0 12"/>',
  review:
    '<path d="M12 21s-6.5-5.5-6.5-10.5a6.5 6.5 0 0 1 13 0C18.5 15.5 12 21 12 21Z"/><circle cx="12" cy="10.5" r="2.4"/>',
  book:
    '<path d="M12 6C10.5 4.8 8.5 4.3 4 4.5v13c4.5-.2 6.5.3 8 1.5 1.5-1.2 3.5-1.7 8-1.5v-13c-4.5-.2-6.5.3-8 1.5Z"/><path d="M12 6v13"/>',

  // UI / motifs
  pin:
    '<path d="M12 21s-6.5-5.5-6.5-10.5a6.5 6.5 0 0 1 13 0C18.5 15.5 12 21 12 21Z"/><circle cx="12" cy="10.5" r="2"/>',
  waypoint: '<path d="M12 3 21 12 12 21 3 12 12 3Z"/>',
  route:
    '<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 16.5 16 7.5" stroke-dasharray="2 3"/>',
  star: '<path d="M12 3.5 14.6 9l6 .6-4.5 4.1 1.3 5.9L12 16.5 6.6 19.6l1.3-5.9L3.4 9.6l6-.6L12 3.5Z"/>',
  'arrow-right': '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
  'arrow-up-right': '<path d="M7 17 17 7"/><path d="M8 7h9v9"/>',
  check: '<path d="m4 12 5 5L20 6"/>',
  upload:
    '<path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/>',
  code: '<path d="m9 8-5 4 5 4"/><path d="m15 8 5 4-5 4"/>',
  cloud:
    '<path d="M7 18a4 4 0 0 1-.5-7.97A6 6 0 0 1 18 9.5a3.5 3.5 0 0 1-.5 8.5H7Z"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',

  // socials
  x: '<path d="M4 4l6.5 8.5L4.5 20M5 4h4l10 16h-4L5 4Z"/>',
  instagram:
    '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17 6.9h.01"/>',
  facebook:
    '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><path d="M14.6 8H13c-.8 0-1.4.6-1.4 1.5V12M10 12h4M12.6 12v5.5"/>',
} as const;

export type IconName = keyof typeof icons;
