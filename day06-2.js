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

type Point = {|
  x: number,
  y: number
|};

const parseCoords = (lines: string[]): Point[] =>
  lines.map(line => {
    const matches = line.match(/([0-9]+), ([0-9]+)/);

    if (matches) {
      return {
        x: parseInt(matches[1], 10),
        y: parseInt(matches[2], 10)
      };
    } else {
      throw new Error(`"${line}" is not a valid coordinate input`);
    }
  });

type Bounds = {|
  left: number,
  right: number,
  top: number,
  bottom: number
|};

const computeBounds = (maxDistance: number, coords: Point[]) => {
  const right = coords.reduce(
    (max, { x }) => Math.max(max, x + maxDistance),
    maxDistance
  );

  const left = coords.reduce(
    (min, { x }) => Math.min(min, x - maxDistance),
    right
  );

  const bottom = coords.reduce(
    (max, { y }) => Math.max(max, y + maxDistance),
    maxDistance
  );

  const top = coords.reduce(
    (min, { y }) => Math.min(min, y - maxDistance),
    bottom
  );

  return {
    left,
    right,
    top,
    bottom
  };
};

const manhattanDistance = (pointA: Point, pointB: Point) =>
  Math.abs(pointA.x - pointB.x) + Math.abs(pointA.y - pointB.y);

const sumDistancesAt = (at: Point, coords: Point[]) =>
  coords.reduce((sum, point) => sum + manhattanDistance(at, point), 0);

const computeMaxDistanceRegionSize = (maxDistance: number, coords: Point[]) => {
  const { left, right, top, bottom } = computeBounds(maxDistance, coords);
  let regionSize = 0;

  for (let x = left; x <= right; x++) {
    for (let y = top; y <= bottom; y++) {
      const sum = sumDistancesAt({ x, y }, coords);

      if (sum < maxDistance) {
        regionSize++;
      }
    }
  }

  return regionSize;
};

console.log("Input maximum total distance:");

getInputLine()
  .then(line => {
    const maxDistance = parseInt(line, 10);

    console.log("Input coordinates then press <ctrl-D>:");

    return getInputLines().then(lines => {
      const coords = parseCoords(lines);
      return { maxDistance, coords };
    });
  })
  .then(inputInfo => {
    console.log("Calculating...");
    return inputInfo;
  })
  .then(({ maxDistance, coords }) =>
    computeMaxDistanceRegionSize(maxDistance, coords)
  )
  .then(
    regionSize => console.log(`Region size: ${regionSize}`),
    error => console.error(error)
  );
