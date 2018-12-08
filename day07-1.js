// @flow

import * as readline from "readline";

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

const computeStepOrder = (requirements: RequirementsForStep[]) => {
  const stepOrder: string[] = [];

  while (stepOrder.length < requirements.length) {
    const possibleSteps = requirements
      .filter(
        ({ step, requirementsForStep }) =>
          !stepOrder.includes(step) &&
          requirementsForStep.every(s => stepOrder.includes(s))
      )
      .map(({ step }) => step);

    if (possibleSteps.length > 0) {
      stepOrder.push(possibleSteps.sort()[0]);
    } else {
      throw new Error("Requirements combination is invalid");
    }
  }

  return stepOrder;
};

console.log("Input step requirements then press <ctrl-D>:");

getInputLines()
  .then(parseRequirements)
  .then(computeRequirementsByStep)
  .then(computeStepOrder)
  .then(
    stepOrder => console.log(`Step order: ${stepOrder.join("")}`),
    error => console.error(error)
  );
