import { Octokit } from "octokit";

import type { RepositoryLocator } from "../types/data";
import type { PullRequestEntity } from "../types/entities";

export async function resolvePullRequestEntity(
	locator: RepositoryLocator,
	octokit: Octokit,
	id: number,
): Promise<PullRequestEntity> {
	const { data } = await octokit.rest.pulls.get({
		owner: locator.owner,
		pull_number: id,
		repo: locator.repository,
	});

	return {
		data,
		id,
		type: "pull_request",
		user: data.user.login,
	};
}
