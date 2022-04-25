# Polling place loading times out at 1.8mins

Unable to replicate in testing using prod containers locally, so CloudFlare seems like the most likely option?

All of our downstream (Nginx + Gunicorn) have 3600s timeouts, so there's nowt left. Inspection of logs there reveal no obvious issues.

Their docs[1] say they time out at 100s, so that's spot on.

Workaround: Results are logged locally and in the database, so just inspect them.

Solution: We're already using RQ, so create a simple set of RQ jobs that run the loader and return the results.

Edit: Oh, wait, we'd already lodged a ticket for this: https://github.com/keithamoss/demsausage/issues/52 🤦‍♂️

[1] https://support.cloudflare.com/hc/en-us/articles/115003011431-Troubleshooting-Cloudflare-5XX-errors#524error

# usehooks-ts needs an "appropriate loader"

We're pinned to 2.2.1 until it's resolved.

Ref: https://github.com/juliencrn/usehooks-ts/issues/97
