// @flow

// Terminals seem to have a maximum length for input lines, which makes the
// program give the wrong result for large polymers.
// The solution is to save the polymer in a file somewhere and pipe the contents
// of the file to the program.
// For example: cat /tmp/polymer.txt | yarn day05-1

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
    const rl = readline.createInterface({
      input: process.stdin,
      escapeCodeTimeout: 10000
    });

    rl.on("line", (nextLine: string) => {
      lines.push(nextLine);
    }).on("close", () => {
      resolve(lines);
    });
  });

const parsePolymer = (line: string) => {
  const polymer: number[] = [];

  for (let i = 0; i < line.length; i++) {
    polymer.push(line.charCodeAt(i));
  }

  return polymer;
};

const areOpposites = (unitA: number, unitB: number) =>
  Math.abs(unitA - unitB) === Math.abs("A".charCodeAt(0) - "a".charCodeAt(0));

const filterAdjacentOpposites = (polymer: number[]) => {
  const filteredPolymer: number[] = [];

  let i = 0;
  while (i < polymer.length - 1) {
    if (areOpposites(polymer[i], polymer[i + 1])) {
      i = i + 2;
    } else {
      filteredPolymer.push(polymer[i]);
      i = i + 1;
    }
  }
  if (i < polymer.length) {
    filteredPolymer.push(polymer[i]);
  }

  return filteredPolymer;
};

const recursivelyFilterAdjacentOpposites = (polymer: number[]) => {
  let previousPolymer = polymer;
  let filteredPolymer = filterAdjacentOpposites(polymer);

  while (previousPolymer.length !== filteredPolymer.length) {
    previousPolymer = filteredPolymer;
    filteredPolymer = filterAdjacentOpposites(filteredPolymer);
  }

  return filteredPolymer;
};

console.log("Input polymer units:");

getInputLine()
  .then(parsePolymer)
  .then(polymer => {
    console.log("Calculating...");
    return polymer;
  })
  .then(recursivelyFilterAdjacentOpposites)
  .then(polymer => polymer.length)
  .then(
    remaining => console.log(`Remaining units: ${remaining}`),
    error => console.error(error)
  );
