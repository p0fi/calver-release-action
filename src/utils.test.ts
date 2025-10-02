import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import * as sinon from 'sinon';
import {
  generateReleaseTitle,
  generateVersionPrefix,
  matchVersionPattern,
  toBoolean,
} from './utils';

describe('matchVersionPattern', () => {
  describe('supported CalVer', () => {
    it('CalVer matches YYYY.0M.MINOR pattern is supported', () => {
      expect(matchVersionPattern('2022.10.10001')).toBe(true);
    });
  });
  describe('unsupported CalVer', () => {
    it('CalVer pattern with one-digit month is not supported', () => {
      expect(matchVersionPattern('2022.1.10001')).toBe(false);
    });
    it('CalVer with six-digits minor is not supported', () => {
      expect(matchVersionPattern('2022.12.100001')).toBe(false);
    });
    it('CalVer without minor', () => {
      expect(matchVersionPattern('2022.12')).toBe(false);
    });
    it('CalVer with non-digit minor', () => {
      expect(matchVersionPattern('2022.12.a')).toBe(false);
    });
    it('CalVer with year-earlier-than-1000', () => {
      expect(matchVersionPattern('999.12.1')).toBe(false);
    });
  });
});

describe('generateVersionPrefix', () => {
  let clock: sinon.SinonFakeTimers;
  beforeEach(() => {
    clock = sinon.useFakeTimers({
      now: 1483228800000, // January 1st 2017
    });
  });
  afterEach(() => {
    clock.restore();
  });
  it('generates YYYY.MM.', () => {
    expect(generateVersionPrefix('utc')).toMatch(/\d{4}\.\d{2}./);
    expect(generateVersionPrefix('utc')).toBe('2017.01.');
  });
  it('supports different timezones', () => {
    expect(generateVersionPrefix('America/Los_Angeles')).toBe('2016.12.');
    expect(generateVersionPrefix('Australia/Sydney')).toBe('2017.01.');
  });
});

describe('toBoolean', () => {
  it('true string should be converted to true', () => {
    expect(toBoolean('true')).toBe(true);
  });
  it('false string should be converted to false', () => {
    expect(toBoolean('false')).toBe(false);
  });
  it('any string except true should be converted to false', () => {
    expect(toBoolean('any')).toBe(false);
  });
});

describe('generateReleaseTitle', () => {
  it('returns string', () => {
    expect(generateReleaseTitle('Hello world')).toBe('Hello world');
  });
  it('replaces tag name', () => {
    expect(generateReleaseTitle('Release ${version}', '2023.01.1')).toBe('Release 2023.01.1');
    expect(generateReleaseTitle('Release ${version}')).toBe('Release ');
  });
  it('supports complex pattern', () => {
    expect(generateReleaseTitle('[${version}] リリース 📙 ${version}', '2023.01.1')).toBe(
      '[2023.01.1] リリース 📙 2023.01.1',
    );
  });
});
