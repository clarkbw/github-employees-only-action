jest.mock("@actions/github");

import * as github from "@actions/github";
import employees from "../src/employees";

const slug = "githubbers";
const token = "lkjasdf0a89uasdlfkjasdlf";

const owner = "ZMaintainers";
const repo = "BAccess";

// github.context.mockResolvedValue({ repo: { owner }});

// process.env.GITHUB_REPOSITORY = `${owner}/${repo}`;

// const github = jest.fn();
//
// github.context = {
//     repo: {
//       owner
//     }
// };

describe("TODO - Add a test suite", () => {
  it("TODO - Add a test", async () => {
    const { alumni, team_id } = await employees(token, slug);
  });
});
