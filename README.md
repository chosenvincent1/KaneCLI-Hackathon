# KaneGuard

KaneGuard automatically verifies AI-generated application changes by running Kane CLI whenever relevant source files change.

## What is KaneGuard?

AI coding agents can make application changes very quickly, but developers still need to verify that those changes actually work.

KaneGuard watches the application's source files. When a relevant file changes, it automatically runs predefined Kane CLI verification objectives against the local Next.js application and reports whether the verification passed or failed.

## How it works

1. An AI coding agent makes a change to the application.
2. KaneGuard detects the source-file change.
3. KaneGuard runs Kane CLI against the local application.
4. Kane interacts with the application in a real browser using a plain-English objective.
5. Kane verifies the expected result.
6. KaneGuard reports PASS or FAIL in the terminal.
7. The latest structured result is saved in `.kane/latest-result.json`.

The current implementation uses a TypeScript watcher script in `scripts/kaneguard.ts`.

## Current verification scenarios

### Coupon verification

Kane enters `SAVE20` on the checkout page and verifies that the final order total becomes `$80.00` from a `$100.00` item.

### Quantity verification

Kane changes the product quantity from `1` to `2` and verifies that the final order total becomes `$200.00`.

These scenarios demonstrate both successful verification and the ability to detect incorrect application behavior.

## Tech stack

- Next.js
- TypeScript
- Tailwind CSS
- Kane CLI
- Node.js
- Chokidar

Chokidar watches the source directory for changes, and Node's `child_process` launches Kane CLI from the watcher script.

## AI coding agent

The application was built with OpenAI Codex as the AI coding agent.

Codex was used to build and modify the Next.js application and help implement the KaneGuard verification workflow.

## Kane CLI's role

Kane CLI is the verification layer. It runs browser-based verification against the local application using plain-English objectives. KaneGuard does not replace Kane; it watches for changes and triggers Kane automatically.

```text
Codex → code change → KaneGuard detects change → Kane CLI verifies → PASS/FAIL result
```

Kane does not automatically edit the application, and KaneGuard does not currently perform autonomous code fixes.

## Project structure

```text
kaneguard/
├── scripts/
│   └── kaneguard.ts
├── src/
│   ├── app/
│   │   └── checkout/
│   │       └── page.tsx
│   └── components/
│       └── checkout-card.tsx
├── .kane/
│   └── latest-result.json
├── package.json
└── README.md
```

## Setup and run

Install dependencies:

```sh
npm install
```

Start the local Next.js application in one terminal:

```sh
npm run dev
```

Start KaneGuard in a second terminal:

```sh
npm run kaneguard
```

KaneGuard waits five seconds after a checkout-related source-file change, then runs the coupon verification followed by the quantity verification. The latest combined result is written to `.kane/latest-result.json`.
