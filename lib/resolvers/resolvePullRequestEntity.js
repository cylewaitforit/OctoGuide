export async function resolvePullRequestEntity(locator, octokit, id) {
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
