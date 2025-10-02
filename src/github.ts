import * as core from '@actions/core';
import { context, getOctokit } from '@actions/github';

// Inspired by https://github.com/mathieudutour/github-tag-action
// Refs:
// - https://octokit.github.io/rest.js/v19
// - https://docs.github.com/ja/rest/repos/repos?apiVersion=2022-11-28

type Tag = {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  zipball_url: string;
  tarball_url: string;
  node_id: string;
};

type Release = {
  url: string;
};

let octokitSingleton: ReturnType<typeof getOctokit>;

function getOctokitSingleton(): ReturnType<typeof getOctokit> {
  if (octokitSingleton) {
    return octokitSingleton;
  }
  const githubToken = core.getInput('api_token');
  octokitSingleton = getOctokit(githubToken);
  return octokitSingleton;
}

export async function listTags(fetchedTags: Tag[] = [], page = 1): Promise<Tag[]> {
  const octokit = getOctokitSingleton();

  const tags = await octokit.rest.repos.listTags({
    ...context.repo,
    per_page: 100,
    page,
  });

  if (tags.data.length < 100) {
    return [...fetchedTags, ...tags.data];
  }

  return listTags([...fetchedTags, ...tags.data], page + 1);
}

export async function createRelease(
  tagName: string,
  isGenerateReleaseNotes: boolean,
  targetCommitish: string,
  releaseName: string,
): Promise<Release> {
  const octokit = getOctokitSingleton();
  const releaseCommitish = targetCommitish === '' ? context.sha : targetCommitish;
  core.info(`Create release based on ${releaseCommitish}`);
  return octokit.rest.repos.createRelease({
    tag_name: tagName,
    name: releaseName,
    generate_release_notes: isGenerateReleaseNotes,
    target_commitish: releaseCommitish,
    ...context.repo,
  });
}
