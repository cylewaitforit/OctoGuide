import * as core from "@actions/core";
import * as github from "@actions/github";

import { runOctoGuide } from "../index.js";
import { cliReporter } from "../reporters/cli.js";

// TODO :)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function runOctoGuideAction(context: typeof github.context) {
	const reports = await runOctoGuide({
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
