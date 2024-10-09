const core = require('@actions/core');

module.exports = {
  findIssue: (prefix, title, description, branch) => {
    const titleRegex = RegExp(`(${prefix}-\\d{1,}) ?`);
    const branchRegex = RegExp(`(${prefix.toLowerCase()}-\\d{1,})-?`);
    const urlRegex = RegExp(`https://linear\\.app/\\w+/issue/(${prefix}-\\d+)/\\S*`, 'i');

    core.info(`Searching for issue with prefix: ${prefix}`);
    core.info(`Title: ${title}`);
    core.info(`Description: ${description}`);
    core.info(`Branch: ${branch}`);

    if (titleRegex.test(title)) {
      const issue = title.match(titleRegex)[1];
      core.info(`Issue found in title: ${issue}`);
      return issue;
    } else if (titleRegex.test(description)) {
      const issue = description.match(titleRegex)[1];
      core.info(`Issue found in description: ${issue}`);
      return issue;
    } else if (urlRegex.test(description)) {
      const issue = urlRegex.exec(description)[1].toUpperCase();
      core.info(`Issue found in URL: ${issue}`);
      return issue;
    } else if (branchRegex.test(branch)) {
      const issue = branch.match(branchRegex)[1].toUpperCase();
      core.info(`Issue found in branch name: ${issue}`);
      return issue;
    }

    core.info('No issue found in any of the checked locations');
    throw("Issue not found");
  }
}