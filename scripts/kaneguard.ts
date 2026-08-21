import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import chokidar from "chokidar";

const objective =
  "On the checkout page, enter SAVE20 in the coupon field, click Apply Coupon, then verify that the final total displayed in the order summary is exactly $80.00";

const quantityObjective =
  "On the checkout page, change the quantity from 1 to 2, then verify that the final total displayed in the order summary is exactly $200.00";

const verificationScenarios = [
  { name: "Coupon verification", objective },
  { name: "Quantity verification", objective: quantityObjective },
];

const DEBOUNCE_DELAY = 5000;

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

type VerificationResult = {
  name: string;
  result: KaneResult;
  runEnd?: KaneEvent;
};

function runKane(objective: string) {
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

function isPassed(verification: VerificationResult) {
  return verification.runEnd?.status === "passed";
}

async function saveLatestResult(verifications: VerificationResult[]) {
  const status = verifications.every(isPassed) ? "passed" : "failed";
  const scenarioResults = verifications.map(({ name, result, runEnd }) => {
    const scenarioStatus = runEnd?.status === "passed" ? "passed" : "failed";
    const failureDetails = getFailureDetails(result);

    return {
      name,
      status: scenarioStatus,
      summary: runEnd?.summary ?? "Kane did not return a final result.",
      reason:
        runEnd?.reason ??
        failureDetails[0] ??
        `Kane exited with code ${result.exitCode}.`,
      ...(runEnd?.test_url ? { test_url: runEnd.test_url } : {}),
      ...(scenarioStatus === "failed" ? { failure_details: failureDetails } : {}),
    };
  });
  const primaryResult =
    scenarioResults.find((scenario) => scenario.status === "failed") ??
    scenarioResults.at(-1);
  const latestResult = {
    status,
    summary:
      status === "passed"
        ? "All Kane verifications passed."
        : "One or more Kane verifications failed.",
    reason:
      status === "passed"
        ? "All verification objectives completed."
        : "Review the failed verification details.",
    ...(primaryResult?.test_url ? { test_url: primaryResult.test_url } : {}),
    timestamp: new Date().toISOString(),
    verifications: scenarioResults,
  };
  const kaneDirectory = join(process.cwd(), ".kane");

  await mkdir(kaneDirectory, { recursive: true });
  await writeFile(
    join(kaneDirectory, "latest-result.json"),
    `${JSON.stringify(latestResult, null, 2)}\n`,
    "utf8",
  );
}

function reportVerification(verification: VerificationResult) {
  console.log(`\n${verification.name}:`);

  if (isPassed(verification)) {
    console.log("✓ Kane verification passed.");
    return;
  }

  console.log("✗ Kane verification failed.");
  showFailureDetails(verification.result, verification.runEnd);
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

    const verifications: VerificationResult[] = [];

    for (const scenario of verificationScenarios) {
      const result = await runKane(scenario.objective);
      const runEnd = result.events.find((event) => event.type === "run_end");
      const verification = { name: scenario.name, result, runEnd };

      verifications.push(verification);
      reportVerification(verification);
    }

    try {
      await saveLatestResult(verifications);
    } catch (error) {
      console.error("Unable to save the latest Kane result.", error);
    }

    if (verifications.every(isPassed)) {
      console.log("\n✓ All Kane verifications passed.");
    } else {
      console.log("\n✗ Kane verification suite failed.");
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
