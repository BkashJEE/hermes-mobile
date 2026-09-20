# Roadmap

This is a proposed sequence, not a release-date commitment. Track specific work in GitHub issues.

## 1. Verify the foundation

Evaluate Mercury before building a separate mobile implementation. Review its Android and iOS structure, license notices, backend dependencies, and test coverage. Record a pinned upstream commit and reproduce an Android build.

Done when: a contributor can follow the documented steps, build the client, connect to a compatible host, and demonstrate one streamed conversation. Record failures and untested platforms explicitly.

Decision: document whether to contribute upstream, maintain a fork, or reuse selected components, including the maintenance cost and attribution plan.

## 2. Make the first session understandable

Design and test the connection flow, authentication, session selection or creation, message sending, response streaming, and useful connection errors. Include a reconnect test and a clear explanation of where the agent runs.

Done when: a new tester can reach a first reply using the setup guide and report the result without developer assistance.

## 3. Release a small community preview

Package the verified application with installation instructions, known limitations, upstream credits, and a short demo. Test on real devices. Review how credentials, attachments, and approval requests are handled before inviting broader use.

Done when: the release includes a reproducible source revision, test evidence, and a way to report bugs.

## Later, based on evidence

- iOS build and device verification with Mac/Xcode contributors.
- Voice, attachments, notifications, and tool approvals, informed by what the chosen foundation already supports.
- Accessibility and larger-screen layouts.

The initial milestone excludes running Hermes locally on the phone, building a hosted backend, and promising app-store availability.
