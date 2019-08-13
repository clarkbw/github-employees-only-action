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
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const token = core.getInput("repo-token", { required: true });
            const team_slug = core.getInput("team-slug", { required: true });
            core.debug(`checking team #${team_slug}`);
            const octokit = new github.GitHub(token);
            const { owner: org } = github.context.repo;
            const { data: { id: team_id } } = yield octokit.teams.getByName({
                org,
                team_slug
            });
            core.debug(`team_id ${team_id}`);
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
            function kenny(logins) {
                return logins.map(a => a.login).join(",");
            }
            const results = yield octokit.graphql(query);
            core.debug(`STRINGIFY ${JSON.stringify(results)}`);
            const members = results.organization.teams.nodes[0].members.nodes;
            core.debug(`members ${kenny(members)}`);
            const alumni = members.filter(member => member.isEmployee);
            core.debug(`alumni ${kenny(alumni)}`);
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
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
run();
