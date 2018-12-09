// @flow

import * as readline from "readline";

const getInputLine = () =>
  new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin });

    rl.on("line", (line: string) => {
      resolve(line);
      rl.close();
    });
  });

const getInputLines = () =>
  new Promise(resolve => {
    const lines: string[] = [];
    const rl = readline.createInterface({ input: process.stdin });

    rl.on("line", (nextLine: string) => {
      lines.push(nextLine);
    }).on("close", () => {
      resolve(lines);
    });
  });

const parseMinDuration = (line: string) => {
  const minDuration = parseInt(line, 10);

  if (isNaN(minDuration) || minDuration < 0) {
    throw new Error(`"${line}" is not a valid minimum duration`);
  } else {
    return minDuration;
  }
};

const parseWorkerCount = (line: string) => {
  const workerCount = parseInt(line, 10);

  if (isNaN(workerCount) || workerCount <= 0) {
    throw new Error(`"${line}" is not a valid worker count`);
  } else {
    return workerCount;
  }
};

type Requirement = {|
  step: string,
  before: string
|};

const parseRequirements = (lines: string[]): Requirement[] =>
  lines.map(line => {
    const matches = line.match(
      /Step ([A-Z]) must be finished before step ([A-Z]) can begin\./
    );

    if (matches) {
      return {
        step: matches[1],
        before: matches[2]
      };
    } else {
      throw new Error(`"${line}" is not a valid requirement`);
    }
  });

type RequirementsForStep = {|
  step: string,
  requirementsForStep: string[]
|};

const computeRequirementsByStep = (
  requirements: Requirement[]
): RequirementsForStep[] => {
  const requirementsByStep = new Map<string, Set<string>>();

  requirements.forEach(({ step, before }) => {
    if (!requirementsByStep.has(step)) {
      requirementsByStep.set(step, new Set());
    }

    const requirementForStep = requirementsByStep.get(before);
    if (requirementForStep) {
      requirementForStep.add(step);
    } else {
      requirementsByStep.set(before, new Set([step]));
    }
  });

  return Array.from(requirementsByStep, ([step, requirementsForStep]) => ({
    step,
    requirementsForStep: Array.from(requirementsForStep)
  }));
};

type WorkingOn = {|
  step: string,
  duration: number
|};

const findPossibleSteps = (
  requirements: RequirementsForStep[],
  completedSteps: string[],
  workers: Array<null | WorkingOn>
) =>
  requirements
    .filter(
      ({ step, requirementsForStep }) =>
        !completedSteps.includes(step) &&
        workers.every(
          workingOn => workingOn === null || workingOn.step !== step
        ) &&
        requirementsForStep.every(s => completedSteps.includes(s))
    )
    .map(({ step }) => step)
    .sort();

const fillInactiveWorkers = (
  workers: Array<null | WorkingOn>,
  possibleSteps: string[],
  minDuration: number
) => {
  const nextWorkers = [...workers];

  possibleSteps.forEach(step => {
    const inactiveWorkerIndex = nextWorkers.findIndex(
      workingOn => workingOn === null
    );

    if (inactiveWorkerIndex >= 0) {
      nextWorkers[inactiveWorkerIndex] = {
        step,
        duration: step.charCodeAt(0) - "A".charCodeAt(0) + minDuration + 1
      };
    }
  });

  return nextWorkers;
};

type CompletedWork = {|
  nextWorkers: Array<null | WorkingOn>,
  nextCompletedSteps: string[]
|};

const completeWork = (
  workers: Array<null | WorkingOn>,
  completedSteps: string[]
): CompletedWork => {
  return workers.reduce(
    ({ nextWorkers, nextCompletedSteps }, workingOn, currentIndex) => {
      if (workingOn !== null) {
        const { step, duration } = workingOn;

        if (duration > 1) {
          return {
            nextCompletedSteps,
            nextWorkers: nextWorkers.map((w, i) =>
              i === currentIndex ? { step, duration: duration - 1 } : w
            )
          };
        } else {
          return {
            nextCompletedSteps: [...nextCompletedSteps, step],
            nextWorkers: nextWorkers.map((w, i) =>
              i === currentIndex ? null : w
            )
          };
        }
      } else {
        return {
          nextWorkers,
          nextCompletedSteps
        };
      }
    },
    { nextWorkers: workers, nextCompletedSteps: completedSteps }
  );
};

const computeCompletionDuration = (
  minDuration: number,
  workerCount: number,
  requirements: RequirementsForStep[]
) => {
  let completedSteps: string[] = [];
  let workers: Array<null | WorkingOn> = new Array(workerCount).fill(null);
  let duration = 0;

  while (completedSteps.length < requirements.length) {
    const possibleSteps = findPossibleSteps(
      requirements,
      completedSteps,
      workers
    );
    workers = fillInactiveWorkers(workers, possibleSteps, minDuration);

    const completedWork = completeWork(workers, completedSteps);
    workers = completedWork.nextWorkers;
    completedSteps = completedWork.nextCompletedSteps;

    duration++;
  }

  return duration;
};

console.log("Input minimum step duration in seconds:");

getInputLine()
  .then(line => parseMinDuration(line))
  .then(minDuration => {
    console.log("Input number of workers:");

    return getInputLine()
      .then(line => parseWorkerCount(line))
      .then(workerCount => ({
        minDuration,
        workerCount
      }));
  })
  .then(({ minDuration, workerCount }) => {
    console.log("Input step requirements then press <ctrl-D>:");

    return getInputLines()
      .then(parseRequirements)
      .then(computeRequirementsByStep)
      .then(requirements => ({
        minDuration,
        workerCount,
        requirements
      }));
  })
  .then(({ minDuration, workerCount, requirements }) =>
    computeCompletionDuration(minDuration, workerCount, requirements)
  )
  .then(
    duration => console.log(`Steps completed in ${duration} seconds`),
    error => console.error(error)
  );
