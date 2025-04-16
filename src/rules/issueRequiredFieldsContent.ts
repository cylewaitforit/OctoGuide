import type { Rule } from "../types/rules.js";

export const issueRequiredFieldsContent = {
	about: {
		config: "strict",
		description:
			"Tasks lists from the pull request template should be [x] filled out.",
		name: "issue-required-fields-content",
	},
	issue(/* context, entity */) {
		// TODO...
	},
} satisfies Rule;
