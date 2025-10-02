import * as core from '@actions/core';
import { createRelease, listTags } from './github';
import {
  generateReleaseTitle,
  generateVersionPrefix,
  matchVersionPattern,
  toBoolean,
} from './utils';

async function run(): Promise<void> {
  try {
    const isDryRun = toBoolean(core.getInput('dry_run'));
    const isGenerateReleaseNotes = toBoolean(core.getInput('generate_release_notes'));
    const timezone = core.getInput('timezone');
    const targetCommitish = core.getInput('target_commitish');
    const releaseTitleFormat = core.getInput('release_title');

    const tags = await listTags();
    const versionPrefix = generateVersionPrefix(timezone);

    const matchedVersions = tags
      .map((it) => it.name)
      .filter((it) => matchVersionPattern(it))
      .filter((it) => it.startsWith(versionPrefix));

    let newVersion: string;
    if (matchedVersions.length > 0) {
      const descSortFn = (a: number, b: number): number => b - a;
      const newMinor =
        matchedVersions.map((it) => Number(it.replace(versionPrefix, ''))).sort(descSortFn)[0] + 1;
      newVersion = `${versionPrefix}${newMinor}`;
    } else {
      newVersion = `${versionPrefix}1`;
    }
    core.info(`New version: ${newVersion}`);
    core.setOutput('version', newVersion);
    const releaseTitle = generateReleaseTitle(releaseTitleFormat, newVersion);
    core.setOutput('title', releaseTitle);
    if (!isDryRun) {
      const releaseUrl = await createRelease(
        newVersion,
        isGenerateReleaseNotes,
        targetCommitish,
        releaseTitle,
      );
      core.setOutput('url', releaseUrl);
    }
  } catch (e) {
    if (e instanceof Error) core.setFailed(e.message);
  }
}

run();
