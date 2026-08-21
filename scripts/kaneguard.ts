import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import chokidar from "chokidar";

const objective =
  "On the checkout page, enter SAVE20 in the coupon field, click Apply Coupon, then verify that the final total displayed in the order summary is exactly $80.00";

const DEBOUNCE_DELAY = 3000;

let isRunning = false;
let debounceTimer: NodeJS.Timeout | undefined;

type KaneEvent = {
  type?: string;
  step?: number;
  status?: string;
  remark?: string;
  summary?: string;
  reason?: string;
  message?: string;
  test_url?: string;
};

type KaneResult = {
  exitCode: number;
  events: KaneEvent[];
  stderr: string;
};

function runKane() {
  return new Promise<KaneResult>((resolve) => {
    let stdout = "";
    let stderr = "";

    const command = spawn(
      "kane-cli",
      [
        "run",
        objective,
        "--url",
        "http://localhost:3000/checkout",
        "--agent",
        "--headless",
      ],
      {
        stdio: ["ignore", "pipe", "pipe"],
      },
    );

    command.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    command.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    command.on("error", (error) => {
      resolve({
        exitCode: 1,
        events: [],
        stderr: `${stderr}${error.message}`,
      });
    });

    command.on("close", (code) => {
      resolve({
        exitCode: code ?? 1,
        events: parseKaneEvents(stdout),
        stderr,
      });
    });
  });
}

function parseKaneEvents(output: string) {
  return output
    .split("\n")
    .filter(Boolean)
    .flatMap((line) => {
      try {
        return [JSON.parse(line) as KaneEvent];
      } catch {
        return [];
      }
    });
}

function getFailureDetails(result: KaneResult) {
  const details = [
    ...result.events
      .filter((event) => event.status === "failed")
      .map((event) => event.remark),
    ...result.events
      .filter((event) => event.type === "error")
      .map((event) => event.message),
  ].filter((detail): detail is string => Boolean(detail));

  return [...new Set(details)];
}

function showFailureDetails(result: KaneResult, runEnd?: KaneEvent) {
  const details = [
    runEnd?.summary,
    runEnd?.reason,
    ...getFailureDetails(result),
  ].filter((detail): detail is string => Boolean(detail));

  if (details.length > 0) {
    for (const detail of [...new Set(details)]) {
      console.log(`  ${detail}`);
    }
    return;
  }

  console.log("  Kane could not complete the verification.");
  if (result.stderr.trim()) {
    console.log(`  ${result.stderr.trim().split("\n").at(-1)}`);
  }
}

async function saveLatestResult(result: KaneResult, runEnd?: KaneEvent) {
  const status = runEnd?.status === "passed" ? "passed" : "failed";
  const failureDetails = getFailureDetails(result);
  const latestResult = {
    status,
    summary: runEnd?.summary ?? "Kane did not return a final result.",
    reason:
      runEnd?.reason ??
      failureDetails[0] ??
      `Kane exited with code ${result.exitCode}.`,
    ...(runEnd?.test_url ? { test_url: runEnd.test_url } : {}),
    timestamp: new Date().toISOString(),
    ...(status === "failed" ? { failure_details: failureDetails } : {}),
  };
  const kaneDirectory = join(process.cwd(), ".kane");

  await mkdir(kaneDirectory, { recursive: true });
  await writeFile(
    join(kaneDirectory, "latest-result.json"),
    `${JSON.stringify(latestResult, null, 2)}\n`,
    "utf8",
  );
}

async function verifyChanges(filePath: string) {
  console.log(`\nChanged: ${filePath}`);

  if (isRunning) {
    console.log("Verification already running. Waiting for it to finish.");
    return;
  }

  isRunning = true;

  try {
    console.log("\nRunning Kane verification...\n");

    const result = await runKane();
    const runEnd = result.events.find((event) => event.type === "run_end");

    try {
      await saveLatestResult(result, runEnd);
    } catch (error) {
      console.error("Unable to save the latest Kane result.", error);
    }

    if (runEnd?.status === "passed") {
      console.log("✓ Kane verification passed.");
    } else {
      console.log("✗ Kane verification failed.");
      showFailureDetails(result, runEnd);
    }
  } finally {
    isRunning = false;
  }
}

console.log("Watching checkout files for changes...");

chokidar
  .watch(
    [
      "src/components/checkout-card.tsx",
      "src/app/checkout/**/*",
    ],
    { ignoreInitial: true },
  )
  .on("change", (filePath) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(() => {
      void verifyChanges(filePath);
    }, DEBOUNCE_DELAY);
  });
