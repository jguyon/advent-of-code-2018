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

const manhattanDistance = (pointA: Point, pointB: Point) =>
  Math.abs(pointA.x - pointB.x) + Math.abs(pointA.y - pointB.y);

const sumDistancesAt = (at: Point, coords: Point[]) =>
  coords.reduce((sum, point) => sum + manhattanDistance(at, point), 0);

type Bounds = {|
  left: number,
  right: number,
  top: number,
  bottom: number
|};

const computeCloseBounds = (coords: Point[]): Bounds => {
  const right = coords.reduce((max, { x }) => Math.max(max, x), 0);
  const left = coords.reduce((min, { x }) => Math.min(min, x), right);
  const bottom = coords.reduce((max, { y }) => Math.max(max, y), 0);
  const top = coords.reduce((min, { y }) => Math.min(min, y), bottom);

  return {
    left,
    right,
    top,
    bottom
  };
};

const computeBounds = (maxDistance: number, coords: Point[]) => {
  const closeBounds = computeCloseBounds(coords);

  let left = closeBounds.left - 1;
  for (let boundary = false; !boundary; left--) {
    const x = left;
    boundary = true;

    for (
      let y = closeBounds.top - maxDistance;
      y <= closeBounds.bottom + maxDistance;
      y++
    ) {
      const sum = sumDistancesAt({ x, y }, coords);

      if (sum < maxDistance) {
        boundary = false;
      }
    }
  }
  left++;

  let right = closeBounds.right + 1;
  for (let boundary = false; !boundary; right++) {
    const x = right;
    boundary = true;

    for (
      let y = closeBounds.top - maxDistance;
      y <= closeBounds.bottom + maxDistance;
      y++
    ) {
      const sum = sumDistancesAt({ x, y }, coords);

      if (sum < maxDistance) {
        boundary = false;
      }
    }
  }
  right--;

  let top = closeBounds.top - 1;
  for (let boundary = false; !boundary; top--) {
    const y = top;
    boundary = true;

    for (
      let x = closeBounds.left - maxDistance;
      x <= closeBounds.right + maxDistance;
      x++
    ) {
      const sum = sumDistancesAt({ x, y }, coords);

      if (sum < maxDistance) {
        boundary = false;
      }
    }
  }
  top++;

  let bottom = closeBounds.bottom + 1;
  for (let boundary = false; !boundary; bottom++) {
    const y = bottom;
    boundary = true;

    for (
      let x = closeBounds.left - maxDistance;
      x <= closeBounds.right + maxDistance;
      x++
    ) {
      const sum = sumDistancesAt({ x, y }, coords);

      if (sum < maxDistance) {
        boundary = false;
      }
    }
  }
  bottom--;

  return {
    left,
    right,
    top,
    bottom
  };
};

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
