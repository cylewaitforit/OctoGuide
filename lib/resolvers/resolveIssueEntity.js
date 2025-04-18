export async function resolveIssueEntity(locator, octokit, id) {
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
