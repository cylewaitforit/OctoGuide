import { Octokit } from "octokit";

import type { RepositoryLocator } from "../types/data";
import type { IssueEntity } from "../types/entities";

export async function resolveIssueEntity(
	locator: RepositoryLocator,
	octokit: Octokit,
	id: number,
): Promise<IssueEntity> {
	const { data } = await octokit.rest.issues.get({
		issue_number: id,
		owner: locator.owner,
		repo: locator.repository,
	});

	return {
		data,
		id,
		type: "issue",
		user: data.user?.login,
	};
}
