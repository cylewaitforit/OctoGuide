export async function resolveCommentEntity(locator, octokit, issueData, commentId) {
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
