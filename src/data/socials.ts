// ─────────────────────────────────────────────────────────────
//  SOCIAL PROFILES — add one line per profile.
//  - platform: 'instagram' or 'x'
//  - handle:   the username WITHOUT the @ (e.g. 'sana.rajpoot')
//  - name:     optional display name (falls back to the handle)
//  Copy a line, change the values, done. Keep the comma at the end.
// ─────────────────────────────────────────────────────────────
export type Social = {
  platform: 'instagram' | 'x';
  handle: string;
  name?: string;
};

export const socials: Social[] = [
  { platform: 'instagram', handle: 'sana.rajpoot', name: 'Sana Rajpoot' },
  { platform: 'instagram', handle: 'aliya.dances', name: 'Aliya' },
  { platform: 'instagram', handle: 'reema.official' },
  { platform: 'x', handle: 'reema_x', name: 'Reema' },
  { platform: 'x', handle: 'nadia_perform', name: 'Nadia' },
];
