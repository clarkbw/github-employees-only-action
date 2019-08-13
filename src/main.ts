import * as core from "@actions/core";
import * as github from "@actions/github";

async function run() {
  try {
    const token = core.getInput("repo-token", { required: true });
    const team_slug = core.getInput("team_slug", { required: true });
    core.debug(`checking team #${team_slug}`);
    const octokit = new github.GitHub(token);

    const { owner: org } = github.context.repo;
    const {
      data: { id: team_id }
    } = await octokit.teams.getByName({
      org,
      team_slug
    });
    core.debug(`team_id ${team_id}`);
    const { data: members } = await octokit.teams.listMembers({
      team_id
    });
    core.debug(`members ${members}`);
    const query = `query {
      organization(login:"maintainers") {
        teams(query:"github-employees", first:1){
          nodes {
            name,
            id,
            members {
              nodes {
                login,
                isEmployee
              }
            }
          }
        }
      }
    }`;
    const result = await octokit.graphql(query);
    core.debug(`result ${result}`);
    // members.forEach(member => {
    //   if (member.isEmployee) {
    //     core.debug(`employee! ${member}`);
    //   } else {
    //     core.debug(`NOT AN EMPLOYEE! ${member}`);
    //     // octokit.teams.removeMembership({
    //     //   team_id: id,
    //     //   username: member.login
    //     // });
    //   }
    // });
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
