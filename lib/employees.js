"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
function graphql(owner, team_slug, cursor) {
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
exports.default = (token, team_slug) => __awaiter(this, void 0, void 0, function* () {
    const octokit = new github.GitHub(token);
    const { owner } = github.context.repo;
    let query = graphql(owner, team_slug, "null");
    let results = yield octokit.graphql(query);
    core.debug(`results ${JSON.stringify(results)}`);
    let members = results.organization.teams.nodes[0].members.nodes;
    core.debug(`members ${JSON.stringify(members)}`);
    let paging = results.organization.teams.nodes[0].members.pageInfo.hasNextPage;
    while (paging) {
        let cursor = results.organization.teams.nodes[0].members.pageInfo.endCursor;
        query = graphql(owner, team_slug, cursor);
        results = yield octokit.graphql(query);
        core.debug(`paging results ${JSON.stringify(results)}`);
        members = members.concat(results.organization.teams.nodes[0].members.nodes);
        paging = results.organization.teams.nodes[0].members.pageInfo.hasNextPage;
    }
    const alumni = members
        .filter(member => !member.isEmployee)
        .map(member => member.login);
    core.debug(`alumni ${JSON.stringify(alumni)}`);
    const team_id = results.organization.teams.nodes[0].id;
    core.debug(`team_id ${team_id}`);
    if (alumni.length > 0) {
        core.warning(`Found ${alumni.length} alumni`);
    }
    return { alumni, team_id };
});
