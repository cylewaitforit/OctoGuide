import * as core from "@actions/core";
import * as github from "@actions/github";

import { hublint } from "../index.js";
import { cliReporter } from "../reporters/cli.js";

export async function runHublintAction(context: typeof github.context) {
	const reports = await hublint({
		githubToken: core.getInput("github-token"),

		// will need to get the locator somehow,
		// how does the context expose this?
		// owner: context.repo.owner,
		// repository: context.repo.repo,
		// maybe pass in entity directly...?
		url: "todo",
	});

	cliReporter(reports);

	for (const report of reports) {
		core.error(
			[
				report.data.primary,
				...(report.data.secondary?.map((line) => `  ${line}`) ?? []),
			].join("\n"),
		);
	}
}
