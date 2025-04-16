import { Octokit } from "octokit";

import type { RepositoryLocator } from "../types/data";
import type { CommentEntity, IssueData } from "../types/entities";

export async function resolveCommentEntity(
	locator: RepositoryLocator,
	octokit: Octokit,
	issueData: IssueData,
	commentId: number,
): Promise<CommentEntity> {
	const { data } = await octokit.rest.issues.getComment({
		comment_id: commentId,
		owner: locator.owner,
		repo: locator.repository,
	});

	return {
		commentId,
		data,
		parent: issueData,
		type: "comment",
		user: data.user?.login,
	};
}
