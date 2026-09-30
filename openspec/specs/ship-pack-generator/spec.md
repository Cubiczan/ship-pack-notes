# ship-pack-generator

## Purpose

Turn one feature ask into a same-day ship pack on the device, with a one-pack free limit.

## Requirements

### Requirement: Generate a pack from an ask

The app SHALL generate a ship pack on the device from a feature ask of at least 8 characters. The pack SHALL include a title, exactly five scope bullets, a recommendation of build or fake-door with a reason, a changelog blurb, a Product Hunt tagline of at most 60 characters, and three reply templates. The generator SHALL NOT call a network API.

#### Scenario: A concrete ask

- GIVEN the ask is a concrete sentence
- WHEN the person generates a pack
- THEN the manifest shows scope, the call, the changelog, the tagline, and the replies

#### Scenario: An empty ask

- GIVEN the ask is blank or shorter than 8 characters
- WHEN the person tries to generate
- THEN no pack is saved and the desk asks for one concrete sentence

### Requirement: Recommend a fake door when the ask needs another system

The generator SHALL recommend a fake door when the ask depends on an external product or a heavy platform capability such as Slack, a home screen widget, payments, or realtime sync. It SHALL recommend building today when the ask is a local slice.

#### Scenario: Slack alerts

- GIVEN the ask is to send Slack when something ships
- WHEN a pack is generated
- THEN the recommendation is fake-door and the reason names Slack

#### Scenario: Export markdown

- GIVEN the ask is to export the pack as markdown
- WHEN a pack is generated
- THEN the recommendation is build today

### Requirement: Free tier is one pack

A person without the unlimited entitlement SHALL be able to generate one pack. A further ask SHALL open the paywall and SHALL NOT create another pack.

#### Scenario: Second ask on the free tier

- GIVEN one pack has already been generated and unlimited is not unlocked
- WHEN the person submits another ask
- THEN the paywall is shown and the pack count stays at one
