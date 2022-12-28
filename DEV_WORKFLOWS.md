# Development workflow

https://docs.gitlab.com/ee/topics/gitlab_flow.html

We run a modified version of the GitLab branching workflow.

1. `main` contains the latest code from development that is ready to be deployed
2. We fork `main` and work on `feature/*` or `bug-fix/*` or `hotfix/*` branches
3. We use a PR to merge these branches back into `main` when they're ready
4. When we're ready to deploy to staging, we use a PR to merge `main` into `staging` (triggering CI/CD)
5. When we're ready to deploy to production, we use a PR to merge `staging` into `production (triggering CI, with manual deployment)

## Other resources

https://www.gitkraken.com/learn/git/best-practices/git-branch-strategy
https://www.jetbrains.com/teamcity/ci-cd-guide/concepts/branching-strategy/
