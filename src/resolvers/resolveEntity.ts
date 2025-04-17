import { Octokit } from "octokit";
import parseGitHubUrl from "parse-github-url";

import type { RepositoryLocator } from "../types/data.js";
import type { Entity } from "../types/entities.js";

import { resolveCommentEntity } from "./resolveCommentEntity.js";
import { resolveIssueEntity } from "./resolveIssueEntity.js";
import { resolvePullRequestEntity } from "./resolvePullRequestEntity.js";

export interface ResolvedLintable {
	entity: Entity;
	locator: RepositoryLocator;
}

export async function resolveLintable(
	octokit: Octokit,
	url: string,
): Promise<ResolvedLintable | undefined> {
	const parsed = parseGitHubUrl(url);
	if (!parsed?.owner || !parsed.name) {
		return undefined;
	}

	const id = /(?:issues|pull)\/(\d+)/.exec(url)?.[1];
	if (!id) {
		return undefined;
	}

	const commentId = /#issuecomment-(\d+)/.exec(url)?.[1];

	const locator = {
		owner: parsed.owner,
		repository: parsed.name,
	};

	const { data: issueData } = await octokit.rest.issues.get({
		issue_number: +id,
		owner: parsed.owner,
		repo: parsed.name,
	});

	if (commentId) {
		return {
			entity: await resolveCommentEntity(
				locator,
				octokit,
				issueData,
				+commentId,
			),
			locator,
		};
	}

	return {
		entity: await (issueData.pull_request
			? resolvePullRequestEntity(locator, octokit, +id)
			: resolveIssueEntity(locator, octokit, +id)),
		locator,
	};
}
