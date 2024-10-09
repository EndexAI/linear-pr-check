module.exports = {
  findIssue: (prefix, title, description, branch) => {
    const titleRegex = RegExp(`(${prefix}-\\d{1,}) ?`);
    const branchRegex = RegExp(`(${prefix.toLowerCase()}-\\d{1,})-?`);
    const urlRegex = RegExp(`https://linear\\.app/\\w+/issue/(${prefix}-\\d+)/\\S*`, 'i');

    if (titleRegex.test(title)) {
      return title.match(titleRegex)[1];
    } else if (titleRegex.test(description)) {
      return description.match(titleRegex)[1];
    } else if (urlRegex.test(description)) {
      return urlRegex.exec(description)[1].toUpperCase();
    } else if (branchRegex.test(branch)) {
      return branch.match(branchRegex)[1].toUpperCase();
    }

    throw("Issue not found");
  }
}