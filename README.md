# Hermes Mobile

An open-source community project to make Hermes Agent useful from your phone.

Shared code. Shared credit. Built in public.

**Status: project kickoff.** This repository currently contains the project plan and contribution guides. There is no app release or verified build here yet.

This is an independent community initiative, not an official Nous Research product and not endorsed by Nous Research.

## Start here

We are bringing developers, designers, testers, and people with useful ideas together around a mobile companion for Hermes Agent.

Our first milestone is to evaluate [Mercury](https://github.com/unsupportedpastels/mercury), reproduce its Android build, and document what we can reuse before choosing our implementation path. Mercury already provides Android and iOS clients; we should understand that work before duplicating it.

The intended first demo is small: connect to a compatible Hermes host, open a session, send a prompt, and read the streamed response. Hermes runs on the host; the phone is its companion.

## Pick a first contribution

| Your role | First task | What to share |
| --- | --- | --- |
| Developer | Evaluate Mercury's Android build and backend requirements | Reproducible steps, versions, and any blockers |
| Designer | Sketch the flow from opening the app to receiving the first reply | A short flow with connection and error states |
| Tester | Write a first-session test checklist | Steps and expected results, including reconnecting |
| Ideas and documentation | Describe one mobile use case | Who needs it, the task, and what success looks like |

Open an [issue](https://github.com/BkashJEE/hermes-mobile/issues/new/choose) with your proposed task and role. For an existing task, comment before starting so contributors can coordinate. See [CONTRIBUTING.md](CONTRIBUTING.md).

## First milestone

- [ ] Review Mercury's source, license notices, build instructions, and current backend compatibility.
- [ ] Reproduce an Android build and record the exact upstream commit and commands.
- [ ] Test a first conversation against a compatible Hermes host.
- [ ] Decide whether to contribute upstream, maintain a fork, or reuse selected components; document the tradeoffs.
- [ ] Publish a short demo and a clear list of the next contribution tasks.

See [ROADMAP.md](ROADMAP.md) for scope and completion criteria. Android is the proposed first verification target; iOS evaluation requires a contributor with a Mac and Xcode.

## Credit and reuse

Thanks to **Mark / NerdSpeak** for offering code from [unsupportedpastels/mercury](https://github.com/unsupportedpastels/mercury) to help this community effort. Mercury is MIT-licensed. Its authors and contributors retain credit for their work.

No Mercury source has been imported into this repository yet. Any future import must preserve the applicable copyright and license notices and record its source revision. See [CREDITS.md](CREDITS.md).

The original community invitation is [on X](https://x.com/BkashJosi/status/2100838142295363846).

## License

Original contributions to this repository are available under the [MIT License](LICENSE). Third-party components retain their own licenses.
