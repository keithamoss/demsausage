# Investigate a Material UI upgrade

Status: stub; upgrade and compatibility testing not yet done.

Both redesigned frontends use Material UI 6 and React 18. Investigate upgrading
their Material UI packages and related dependencies, including MUI X, Toolpad
and React compatibility.

The admin app temporarily disables React Router's `v7_startTransition` flag
because the navigation drawer's invisible backdrop can get stuck over the
Elections page. Material UI [9.3.1 includes an upstream fix][release] for
stuck exit transitions, but it has not been verified against this app.

When investigating the upgrade:

- Review migration guides and breaking changes for both frontends.
- With the upgraded packages, re-enable the router flag and test drawer
  navigation to Elections and other pages, including on a throttled CPU.
- Check that the drawer, backdrop, keyboard navigation and other affected
  components work, and run both frontends' builds and relevant tests.
- Remove the temporary router workaround only if those checks pass.

References: [Material UI issue][issue] and [upstream fix][fix].

[release]: https://github.com/mui/material-ui/releases/tag/v9.3.1
[issue]: https://github.com/mui/material-ui/issues/32286
[fix]: https://github.com/mui/material-ui/pull/48881
