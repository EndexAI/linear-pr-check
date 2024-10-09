const core = require('@actions/core');
const github = require('@actions/github');
const issuecheck = require('./issuecheck.js')

async function run() {
  const authToken = core.getInput('github_token', {required: true});
  const client = new github.GitHub(authToken);
  const owner = github.context.payload.pull_request.base.user.login;
  const repo = github.context.payload.pull_request.base.repo.name;
  const pr_number = github.context.payload.pull_request.number;

  try {
    const {data: pullRequest} = await client.pulls.get({
      owner,
      repo,
      pull_number: pr_number
    });

    const title = pullRequest.title;
    const description = pullRequest.body;
    const branch = pullRequest.head.ref;

    const issue = issuecheck.findIssue(core.getInput("prefix"), title, description, branch);
    core.info(`Issue ${issue} found`);

    // Check if there's an existing comment from our action and remove it
    await removeExistingComment(client, owner, repo, pr_number);

  } catch (error) {
    core.setFailed("Issue not found in PR: All PRs must have an associated issue");
    
    const errorMessage = `
Linear supports four ways to link issues with your pull requests:

1. Include *issue ID* in the branch name
2. Include *issue ID* in the PR title
3. Include *issue ID* with a magic word in the PR description (e.g., Fixes ENG-123) similar to GitHub Issues
4. Include the issue URL in the PR description (e.g., https://linear.app/yourteam/issue/ENG-123/issue-title)
`;

    core.info(errorMessage);

    // Leave a comment on the PR
    await client.issues.createComment({
      owner,
      repo,
      issue_number: pr_number,
      body: "Issue not found in PR: All PRs must have an associated issue.\n\n" + errorMessage
    });
  }
}

async function removeExistingComment(client, owner, repo, pr_number) {
  const {data: comments} = await client.issues.listComments({
    owner,
    repo,
    issue_number: pr_number
  });

  const botComment = comments.find(comment => 
    comment.user.type === 'Bot' && 
    comment.body.startsWith("Issue not found in PR: All PRs must have an associated issue.")
  );

  if (botComment) {
    await client.issues.deleteComment({
      owner,
      repo,
      comment_id: botComment.id
    });
    core.info('Removed previous error comment');
  }
}

run();