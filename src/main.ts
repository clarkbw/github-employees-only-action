import * as core from "@actions/core";
import * as github from "@actions/github";

async function run() {
  try {
    const token = core.getInput("repo-token", { required: true });
    const team_slug = core.getInput("team-slug", { required: true });
    core.debug(`checking team #${team_slug}`);
    const octokit = new github.GitHub(token);

    const { owner } = github.context.repo;
    const query = `query {
      organization(login:"${owner}") {
        teams(query:"${team_slug}", first:1){
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
    const results = await octokit.graphql(query);
    core.debug(`results ${JSON.stringify(results)}`);
    const members = results.organization.teams.nodes[0].members.nodes;
    core.debug(`members ${JSON.stringify(members)}`);
    const alumni = members.filter(member => !member.isEmployee);
    core.debug(`alumni ${JSON.stringify(alumni)}`);
    const team_id = results.organization.teams.nodes[0].id;
    core.debug(`team_id ${team_id}`);

    if (alumni.length > 0) { core.warning(`Found ${alumni.length} alumni`); }

    core.setOutput("non-employees", JSON.stringify(alumni));
    core.setOutput("team-id", JSON.stringify(team_id));
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
