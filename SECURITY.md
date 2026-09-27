# Security Policy

## Supported versions

Next RSC Debug is a development-only debugging toolkit and is not intended for
production use. Security fixes are applied to the latest published minor.

| Version | Supported |
| ------- | --------- |
| 0.1.x   | Yes       |
| < 0.1   | No        |

## Reporting a vulnerability

Please **do not** open a public issue for a security problem.

Use GitHub's private reporting instead:
[Report a vulnerability](https://github.com/dsamithmendis/next-rsc-debug/security/advisories/new)

Include the affected package and version, a description of the issue, and the
steps needed to reproduce it. You can expect an initial response within a few
days.

## Scope note

Because this toolkit records request metadata, please make sure the events
endpoint (`/api/debug-events`) is not exposed publicly. It is gated behind
`NEXT_RSC_DEBUG=1` and holds in-memory only, but it is not designed to be
authenticated or hardened for production traffic.
