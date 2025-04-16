import type { Rule } from "../types/rules.js";

export const commentNothingToSay = {
	about: {
		config: "strict",
		description: "Comments should be meaningful, not just '+1' bumps.",
		name: "comment-nothing-to-say",
	},
	issue(/* context, entity */) {
		// TODO...
	},
} satisfies Rule;
