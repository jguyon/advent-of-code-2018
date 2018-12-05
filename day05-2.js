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

type PolymerUnits = {|
  polymer: number[],
  units: Set<number>
|};

const parsePolymer = (line: string): PolymerUnits => {
  const polymer: number[] = [];
  const units = new Set<number>();

  for (let i = 0; i < line.length; i++) {
    polymer.push(line.charCodeAt(i));
    units.add(
      line
        .charAt(i)
        .toUpperCase()
        .charCodeAt(0)
    );
  }

  return {
    polymer,
    units
  };
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

const removeUnit = (polymer: number[], lowerUnit: number) => {
  const upperUnit = lowerUnit + "a".charCodeAt(0) - "A".charCodeAt(0);

  return polymer.filter(unit => unit !== lowerUnit && unit != upperUnit);
};

const computeFilteredPolymers = ({ polymer, units }: PolymerUnits) => {
  const polymers: number[][] = [];

  units.forEach(unit => {
    const polymerWithoutUnit = removeUnit(polymer, unit);
    const filteredPolymer = recursivelyFilterAdjacentOpposites(
      polymerWithoutUnit
    );

    polymers.push(filteredPolymer);
  });

  return polymers;
};

const findShortestPolymer = (polymers: number[][]) =>
  polymers.reduce(
    (shortestPolymer: null | number[], currentPolymer) =>
      shortestPolymer === null || currentPolymer.length < shortestPolymer.length
        ? currentPolymer
        : shortestPolymer,
    null
  );

console.log("Input polymer units:");

getInputLine()
  .then(parsePolymer)
  .then(polymer => {
    console.log("Calculating...");
    return polymer;
  })
  .then(computeFilteredPolymers)
  .then(findShortestPolymer)
  .then(
    polymer =>
      polymer === null
        ? console.log("Could not find shortest polymer")
        : console.log(`Shortest polymer length: ${polymer.length}`),
    error => console.error(error)
  );
