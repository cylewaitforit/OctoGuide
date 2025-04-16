import type { Rule } from "../types/rules.js";

export const prBranchNonDefault = {
	about: {
		config: "strict",
		description:
			"PRs must not be sent from their head repository's default branch.",
		name: "pr-branch-non-default",
	},
	async pullRequest(context, entity) {
		const { data } = await context.octokit.rest.repos.get({
			owner: context.locator.owner,
			repo: context.locator.repository,
		});

		if (entity.data.head.ref === data.default_branch) {
			context.report({
				primary: "This PR is sent from the head repository's default branch",
				secondary: [
					`Sending a PR from a default branch means the head repository can't easily be updated after the PR is merged.`,
					`Please create a new branch and send the PR from there.`,
				],
			});
		}
	},
} satisfies Rule;
