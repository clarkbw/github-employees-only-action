import * as core from "@actions/core";

import employees from "./employees";

async function run() {
  try {
    const token: string = core.getInput("repo-token", { required: true });
    const team_slug: string = core.getInput("team-slug", { required: true });
    core.debug(`checking team #${team_slug}`);

    const { alumni, team_id } = await employees(token, team_slug);

    core.setOutput("non-employees", JSON.stringify(alumni));
    core.setOutput("team-id", JSON.stringify(team_id));
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
