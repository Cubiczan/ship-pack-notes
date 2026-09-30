export const FREE_PACK_LIMIT = 1;
export const TAGLINE_MAX = 60;

export const EXAMPLE_ASKS = [
  {
    label: 'Home screen pin',
    ask: 'Let people pin a ship note to their home screen widget so the latest pack is one glance away.',
  },
  {
    label: 'Slack when shipped',
    ask: 'Add Slack alerts when a feature ask is marked shipped.',
  },
  {
    label: 'Export markdown',
    ask: 'Export the ship pack as a markdown file the team can paste into the PR.',
  },
] as const;

export type Recommendation = 'build' | 'fake-door';

export type ReplyTemplate = {
  id: 'asker' | 'design' | 'defer';
  label: string;
  body: string;
};

export type ShipPack = {
  id: string;
  createdAt: string;
  ask: string;
  title: string;
  recommendation: Recommendation;
  recommendationLabel: string;
  reason: string;
  scope: string[];
  changelog: string;
  productHuntTagline: string;
  replies: ReplyTemplate[];
};

type Signal = {
  label: string;
};

const LEAD_INS = [
  'allow people to',
  'allow users to',
  'i would like to',
  "i'd like to",
  'let people',
  'let users',
  'we should',
  'could we',
  'can we',
  'i want to',
  "let's",
  'let us',
  'please',
  'implement',
  'create',
  'build',
  'ship',
  'make',
  'lets',
  'add',
].sort((a, b) => b.length - a.length);

const PLATFORM_SIGNALS: { term: string; label: string }[] = [
  { term: 'push notification', label: 'push notifications' },
  { term: 'home screen widget', label: 'a home screen widget' },
  { term: 'widget', label: 'a home screen widget' },
  { term: 'slack', label: 'Slack' },
  { term: 'stripe', label: 'Stripe' },
  { term: 'notion', label: 'Notion' },
  { term: 'discord', label: 'Discord' },
  { term: 'github', label: 'GitHub' },
  { term: 'linear', label: 'Linear' },
  { term: 'zapier', label: 'Zapier' },
  { term: 'calendar', label: 'a calendar' },
  { term: 'webhook', label: 'webhooks' },
  { term: 'email', label: 'email' },
  { term: 'oauth', label: 'OAuth' },
  { term: 'sso', label: 'SSO' },
  { term: 'jira', label: 'Jira' },
  { term: 'sms', label: 'SMS' },
];

const HEAVY_SIGNALS: { term: string; label: string }[] = [
  { term: 'machine learning', label: 'a model' },
  { term: 'real-time', label: 'realtime sync' },
  { term: 'realtime', label: 'realtime sync' },
  { term: 'subscription', label: 'subscriptions' },
  { term: 'notifications', label: 'notifications' },
  { term: 'notification', label: 'notifications' },
  { term: 'multiplayer', label: 'multiplayer' },
  { term: 'permission', label: 'permissions' },
  { term: 'dashboard', label: 'a dashboard' },
  { term: 'analytics', label: 'analytics' },
  { term: 'payment', label: 'payments' },
  { term: 'offline', label: 'offline sync' },
  { term: 'admin', label: 'an admin surface' },
  { term: 'roles', label: 'roles' },
  { term: 'llm', label: 'an LLM' },
  { term: 'ai', label: 'AI' },
];

function includesTerm(text: string, term: string): boolean {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
  return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i').test(text);
}

function uniqueLabels(signals: Signal[]): string[] {
  const seen = new Set<string>();
  const labels: string[] = [];
  for (const signal of signals) {
    if (seen.has(signal.label)) continue;
    seen.add(signal.label);
    labels.push(signal.label);
  }
  return labels;
}

function listWords(items: string[]): string {
  if (items.length === 0) return 'the platform plumbing behind this ask';
  if (items.length === 1) return items[0] ?? '';
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

function capitalize(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  const sliced = value.slice(0, max).replace(/\s+\S*$/, '').trim();
  return sliced.length > 12 ? sliced : value.slice(0, max).trim();
}

function tidyEnding(value: string): string {
  let text = value.replace(/[.]+$/, '').trim();
  for (let i = 0; i < 3; i += 1) {
    const next = text.replace(/\s+(the|a|an|to|into|for|and|or|with|on|of|in)$/i, '').trim();
    if (next === text) break;
    text = next;
  }
  return text;
}

function featureTitle(ask: string): string {
  let text = ask.trim().replace(/\s+/g, ' ');
  text = (text.split(/[.!?]/)[0] ?? text).trim();
  let stripped = true;
  while (stripped) {
    stripped = false;
    const lower = text.toLowerCase();
    for (const lead of LEAD_INS) {
      if (lower.startsWith(`${lead} `)) {
        text = text.slice(lead.length).trim();
        stripped = true;
        break;
      }
    }
  }
  for (let i = 0; i < 3; i += 1) {
    const next = text
      .replace(
        /\s+(so|when|because|before|after|once|if|that|which|where|for the|into the|the team|people can|users can)\b[\s\S]*$/i,
        '',
      )
      .trim();
    if (next.length < 8 || next === text) break;
    text = next;
  }
  return tidyEnding(truncate(capitalize(tidyEnding(text)), 64));
}

function clampTagline(value: string): string {
  const clean = value.replace(/\s+/g, ' ').trim();
  if (clean.length <= TAGLINE_MAX) return clean;
  const sliced = clean.slice(0, TAGLINE_MAX - 1);
  const word = sliced.replace(/\s+\S*$/, '').trim();
  const base = (word.length >= 12 ? word : sliced.trim()).replace(/[.,;:—-]+$/, '');
  return `${base}…`;
}

function taglineFor(title: string, kind: Recommendation): string {
  const short = tidyEnding(truncate(title, 42));
  const startsWithVerb = /^(ship|export|add|pin|send|show|make|build)\b/i.test(short);
  const candidates =
    kind === 'build'
      ? [
          startsWithVerb ? `${short}, same day.` : `${short} — shipped the day you asked.`,
          startsWithVerb ? `${short} — out today.` : `Ship ${short} today.`,
          `${short}, same day.`,
        ]
      : [
          `Try ${short} before you build it.`,
          `Fake door: ${tidyEnding(truncate(title, 46))}.`,
          `${tidyEnding(truncate(title, 28))} — door open, build waits.`,
        ];
  for (const candidate of candidates) {
    if (candidate.length <= TAGLINE_MAX) return candidate;
  }
  return clampTagline(candidates[candidates.length - 1] ?? short);
}

function makeId(now: Date): string {
  const stamp = now.getTime().toString(36);
  const suffix = Math.random().toString(36).slice(2, 6);
  return `sp_${stamp}${suffix}`;
}

export function generateShipPack(ask: string, now: Date = new Date()): ShipPack | null {
  const cleaned = ask.trim().replace(/\s+/g, ' ');
  if (cleaned.length < 8) return null;

  const title = featureTitle(cleaned);
  if (title.length < 3) return null;

  const platform = PLATFORM_SIGNALS.filter((signal) => includesTerm(cleaned, signal.term));
  const heavy = HEAVY_SIGNALS.filter((signal) => includesTerm(cleaned, signal.term)).filter(
    (signal) => signal.label !== 'notifications' || !platform.some((item) => item.label === 'push notifications'),
  );
  const blockers = uniqueLabels([...platform, ...heavy]);
  const kind: Recommendation = blockers.length > 0 ? 'fake-door' : 'build';
  const mentionsExport =
    includesTerm(cleaned, 'export') ||
    includesTerm(cleaned, 'markdown') ||
    includesTerm(cleaned, 'copy');
  const dependencyText = listWords(blockers);
  const cuts = 'accounts, notifications, and any new backend';

  const reason =
    kind === 'build'
      ? mentionsExport
        ? 'This is a local transform of a pack you already have. No account, no review queue, no second service. Ship the file today.'
        : 'This fits on one surface, on this device. No store review, no second service, no permission dialog. Cut it today and write the changelog as if it already shipped.'
      : `This is not a one-day build. It needs ${dependencyText}. Put the door up today, count who asks twice, and keep the real work on the other side of that number.`;

  const scope =
    kind === 'build'
      ? [
          `Ship the visible slice of “${title}” where the ask already points.`,
          'Write the empty state in one sentence so the first run is obvious.',
          'Keep the result on device. It still opens with no network.',
          mentionsExport
            ? 'End on copy. Markdown leaves the device, and that is the whole success path.'
            : 'End on one success action: save or share. That is the whole path.',
          `Leave out today: ${cuts}.`,
        ]
      : [
          `Add “${title}” as a real entry point in the current flow.`,
          'The tap opens a finished panel: two lines on what it will do, then “Notify me”.',
          'Store the confirm on device and show “You’re on the list.”',
          'Build the real thing only after 25 confirms, or after 15% of taps confirm.',
          `Do not build today: ${dependencyText}.`,
        ];

  const changelog =
    kind === 'build'
      ? `Shipped: ${title}. The same-day slice is visible, works offline, and can be copied. Not in this release: ${cuts}.`
      : `Shipped a fake door for ${title}. The entry point is real. ${capitalize(dependencyText)} waits until the confirm rate says to build.`;

  const replies: ReplyTemplate[] =
    kind === 'build'
      ? [
          {
            id: 'asker',
            label: 'To the person who asked',
            body: `Yes — ${title} ships today. You get the visible slice, an empty state, and a copy action. Accounts and extra services stay out of this pack.`,
          },
          {
            id: 'design',
            label: 'To design',
            body: `Before pixels: where does “${title}” sit, what is the one success state, and which sentence explains the empty screen? We are not designing settings today.`,
          },
          {
            id: 'defer',
            label: 'If it grows past today',
            body: `If this wants ${cuts}, that is a new pack. Today stops at the local slice so the changelog can be true by tonight.`,
          },
        ]
      : [
          {
            id: 'asker',
            label: 'To the person who asked',
            body: `Not the full build today. ${title} depends on ${dependencyText}. I’ll ship the entry point and a notify step so we know it’s wanted before we take on that work.`,
          },
          {
            id: 'design',
            label: 'To design',
            body: `Design the door, not the system. One entry, two lines of promise, one confirm. Make it look finished. Do not draw the ${dependencyText} flow.`,
          },
          {
            id: 'defer',
            label: 'If they push for the real build',
            body: `We can build ${title} after the signal: 25 confirms, or 15% of taps. Until then the honest changelog is the fake door, not the integration.`,
          },
        ];

  return {
    id: makeId(now),
    createdAt: now.toISOString(),
    ask: cleaned,
    title,
    recommendation: kind,
    recommendationLabel: kind === 'build' ? 'BUILD TODAY' : 'FAKE DOOR',
    reason,
    scope,
    changelog,
    productHuntTagline: taglineFor(title, kind),
    replies,
  };
}

export function packToMarkdown(pack: ShipPack): string {
  const scope = pack.scope.map((item) => `- ${item}`).join('\n');
  const replies = pack.replies.map((reply) => `### ${reply.label}\n\n${reply.body}`).join('\n\n');
  return [
    `# ${pack.title}`,
    '',
    `**Call:** ${pack.recommendationLabel}`,
    '',
    `> ${pack.ask}`,
    '',
    '## Scope',
    '',
    scope,
    '',
    '## Why',
    '',
    pack.reason,
    '',
    '## Changelog',
    '',
    pack.changelog,
    '',
    '## Product Hunt',
    '',
    pack.productHuntTagline,
    '',
    '## Replies',
    '',
    replies,
    '',
  ].join('\n');
}

export function formatManifestDate(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
    .format(new Date(iso))
    .toUpperCase();
}
