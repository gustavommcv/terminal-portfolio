import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import { projectsData } from '../../src/app/data/projects.data.ts';
import { planBadges, renderBadge } from './badge.mjs';

const badgesDirectory = join('public', 'images', 'badges');
const angular = { label: 'Angular', slug: 'angular', color: 'DD0031' };

describe('renderBadge', () => {
  it('draws the label on a block of the badge colour, with the logo', () => {
    const svg = renderBadge(angular);

    assert.match(svg, /^<svg /);
    assert.ok(svg.includes('Angular'));
    assert.ok(svg.toLowerCase().includes('fill="#dd0031"'));
    assert.ok(svg.includes('<image'), 'the Simple Icons logo is embedded');
  });

  it('is deterministic, so a regenerated file only changes when the data does', () => {
    assert.equal(renderBadge(angular), renderBadge({ ...angular }));
  });

  it('draws a badge with no logo when Simple Icons has none for the slug', () => {
    const svg = renderBadge({ label: 'Old Tool', slug: 'no-such-icon-anywhere', color: '123456' });

    assert.ok(svg.includes('Old Tool'));
    assert.ok(!svg.includes('<image'));
  });

  it('draws a badge with no logo when it has no slug at all', () => {
    const svg = renderBadge({ label: 'Plain', color: '123456' });

    assert.ok(svg.includes('Plain'));
    assert.ok(!svg.includes('<image'));
  });

  it('uses the logo colour it is given', () => {
    const white = renderBadge({ ...angular, logoColor: 'white' });
    const black = renderBadge({ ...angular, logoColor: 'black' });

    assert.notEqual(white, black);
  });
});

describe('planBadges', () => {
  it('plans a badge once however many projects use it', () => {
    const planned = planBadges([{ badges: [angular] }, { badges: [angular] }]);

    assert.deepEqual([...planned.keys()], ['angular.svg']);
  });

  it('refuses two different badges that would share a file, instead of letting one replace the other', () => {
    assert.throws(
      () => planBadges([{ badges: [angular, { ...angular, color: '000000' }] }]),
      /two different badges/,
    );
  });

  it('flags a logo that Simple Icons no longer has', () => {
    const planned = planBadges([{ badges: [{ label: 'Old Tool', slug: 'no-such-icon-anywhere', color: '123456' }] }]);

    assert.equal(planned.get('no-such-icon-anywhere.svg').missingLogo, true);
  });
});

describe('the committed badge files', () => {
  const planned = planBadges(projectsData);
  const onDisk = readdirSync(badgesDirectory).filter((name) => name.endsWith('.svg'));
  // Git may check files out with CRLF on Windows.
  const read = (name) => readFileSync(join(badgesDirectory, name), 'utf8').replace(/\r\n/g, '\n');

  it('include one for every badge the projects use, as the data defines it', () => {
    for (const [name, { svg }] of planned) {
      assert.ok(onDisk.includes(name), `${name} is missing; run npm run badges`);
      assert.equal(read(name), svg, `${name} is out of date; run npm run badges`);
    }
  });

  it('include nothing that no project uses any more', () => {
    const unused = onDisk.filter((name) => !planned.has(name));

    assert.deepEqual(unused, [], 'run npm run badges to remove them');
  });
});
