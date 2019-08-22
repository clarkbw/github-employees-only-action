import * as core from "@actions/core";
import * as github from "@actions/github";

interface TeamMember {
  login: string;
  isEmployee: boolean;
}

interface Team {
  name: string;
  id: string;
  members: {
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string;
    };
    nodes: Array<TeamMember>;
  };
}

interface Results {
  organization: {
    teams: {
      nodes: Array<Team>;
    };
  };
}

function graphql(
  owner: string,
  team_slug: string,
  cursor: string
): string {
  return `query {
  organization(login:"${owner}") {
    teams(query:"${team_slug}", first:1){
      nodes {
        name,
        id,
        members(after:${cursor}) {
          pageInfo {
            hasNextPage,
            endCursor
          },
          nodes {
            login,
            isEmployee
          }
        }
      }
    }
  }
}`;
}

//: Promise<{string[], string}>
export default async (token: string, team_slug: string) => {
  const octokit = new github.GitHub(token);

  const { owner } = github.context.repo;

  let query = graphql(owner, team_slug, "null");

  let results: Results = await octokit.graphql(query);
  core.debug(`results ${JSON.stringify(results)}`);

  const members: TeamMember[] =
    results.organization.teams.nodes[0].members.nodes;
  core.debug(`members ${JSON.stringify(members)}`);

  let paging = results.organization.teams.nodes[0].members.pageInfo.hasNextPage;

  while (paging) {
    let cursor = results.organization.teams.nodes[0].members.pageInfo.endCursor;
    query = graphql(owner, team_slug, cursor);

    results = await octokit.graphql(query);
    core.debug(`paging results ${JSON.stringify(results)}`);

    members.concat(results.organization.teams.nodes[0].members.nodes);

    paging = results.organization.teams.nodes[0].members.pageInfo.hasNextPage;
  }

  const alumni: string[] = members
    .filter(member => !member.isEmployee)
    .map(member => member.login);
  core.debug(`alumni ${JSON.stringify(alumni)}`);

  const team_id: string = results.organization.teams.nodes[0].id;
  core.debug(`team_id ${team_id}`);

  if (alumni.length > 0) {
    core.warning(`Found ${alumni.length} alumni`);
  }
  return { alumni, team_id };
};
