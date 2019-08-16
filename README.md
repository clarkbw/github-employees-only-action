# GitHub Employees Only

This is a GitHub Action that outputs all the non-employees in a given team.  The non-employee `login` identities as an array in the `non-employees` output along with the team id `team-id` of the team slug given.  This information allows you to do something useful in a followup Action like remove these users from the team or file an issue.

The Action is intended to be run as a [scheduled event](https://help.github.com/en/articles/events-that-trigger-workflows#scheduled-events).

## Configuring

This requires [PAT](https://github.com/settings/tokens) with the *admin:org* permission which is stored in the repository secrets ( https://github.com/USER/REPOSITORY/settings/secrets ). In the example below the PAT was saved with the secret name `GITHUB_PAT`.

2 required inputs:

- `repo-token` : The [PAT](https://github.com/settings/tokens) created with the *admin:org* permission in your Secrets store
- `team-slug` : Your team slug can be found in the URL for the team.  The URL looks like this: https://github.com/orgs/YOUR-ORG/teams/TEAM-SLUG

```yml
name: "Remove non-employees"
on:
  schedule:
  # run every 24 hours
  - cron:  '* */23 * * *'

jobs:
  president-business:
    runs-on: ubuntu-latest
    steps:
    - uses: clarkbw/github-employees-only-action@master
      with:
        repo-token: "${{ secrets.GITHUB_PAT }}"
        team-slug: "github-employees"
```

## Debugging

See [Action debugging](https://github.com/actions/toolkit/blob/master/docs/action-debugging.md#step-debug-logs) for the most updated materials.

In your repository create the secret `ACTIONS_STEP_DEBUG` with the value `true` to turn on debug output. ( Secrets can be found: https://github.com/USER/REPOSITORY/settings/secrets )
