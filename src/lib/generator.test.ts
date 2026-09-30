import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  EXAMPLE_ASKS,
  FREE_PACK_LIMIT,
  TAGLINE_MAX,
  generateShipPack,
  packToMarkdown,
} from './generator';

const now = new Date('2026-09-30T18:00:00.000Z');

test('free tier is a single pack', () => {
  assert.equal(FREE_PACK_LIMIT, 1);
});

test('rejects a blank or tiny ask', () => {
  assert.equal(generateShipPack('   ', now), null);
  assert.equal(generateShipPack('hi', now), null);
});

test('example asks produce a same-day pack with a short tagline', () => {
  for (const example of EXAMPLE_ASKS) {
    const pack = generateShipPack(example.ask, now);
    assert.ok(pack);
    if (!pack) return;
    assert.equal(pack.scope.length, 5);
    assert.equal(pack.replies.length, 3);
    assert.ok(pack.productHuntTagline.length <= TAGLINE_MAX);
    assert.ok(pack.changelog.startsWith('Shipped'));
    assert.match(packToMarkdown(pack), new RegExp(pack.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('a widget or Slack ask is a fake door', () => {
  const widget = generateShipPack(EXAMPLE_ASKS[0].ask, now);
  const slack = generateShipPack(EXAMPLE_ASKS[1].ask, now);
  assert.equal(widget?.recommendation, 'fake-door');
  assert.match(widget?.reason ?? '', /widget/i);
  assert.equal(slack?.recommendation, 'fake-door');
  assert.match(slack?.reason ?? '', /Slack/);
});

test('exporting markdown is a local build', () => {
  const pack = generateShipPack(EXAMPLE_ASKS[2].ask, now);
  assert.equal(pack?.recommendation, 'build');
  assert.match(pack?.scope.join(' ') ?? '', /[Mm]arkdown/);
});

test('a heavy platform ask stays behind a fake door', () => {
  const pack = generateShipPack(
    'Build a realtime collaborative dashboard with roles, analytics, and Slack plus email digests for every admin who needs SSO.',
    now,
  );
  assert.equal(pack?.recommendation, 'fake-door');
  assert.ok((pack?.productHuntTagline.length ?? 0) <= TAGLINE_MAX);
});

test('the same ask and clock produce the same call', () => {
  const first = generateShipPack('Add a tooltip on the save button.', now);
  const second = generateShipPack('Add a tooltip on the save button.', now);
  assert.equal(first?.recommendation, 'build');
  assert.equal(first?.title, second?.title);
  assert.equal(first?.changelog, second?.changelog);
});
