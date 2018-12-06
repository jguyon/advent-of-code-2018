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
  topLeft: Point,
  bottomRight: Point
|};

const computeBounds = (coords: Point[]): Bounds => {
  const bottomRight = coords.reduce(
    (max, current) => ({
      x: Math.max(current.x, max.x),
      y: Math.max(current.y, max.y)
    }),
    { x: 0, y: 0 }
  );

  const topLeft = coords.reduce(
    (min, current) => ({
      x: Math.min(current.x, min.x),
      y: Math.min(current.y, min.y)
    }),
    bottomRight
  );

  return {
    topLeft,
    bottomRight
  };
};

const manhattanDistance = (pointA: Point, pointB: Point) =>
  Math.abs(pointA.x - pointB.x) + Math.abs(pointA.y - pointB.y);

const findClosestIndex = (from: Point, coords: Point[]) => {
  if (coords.length === 0) {
    return null;
  }

  const { indexes } = coords.reduce(
    ({ indexes, minDistance }, currentPoint, currentIndex) => {
      const currentDistance = manhattanDistance(from, currentPoint);

      if (currentDistance === minDistance) {
        return {
          indexes: [...indexes, currentIndex],
          minDistance
        };
      } else if (currentDistance < minDistance) {
        return {
          indexes: [currentIndex],
          minDistance: currentDistance
        };
      } else {
        return {
          indexes,
          minDistance
        };
      }
    },
    { indexes: [], minDistance: Infinity }
  );

  return indexes.length === 1 ? indexes[0] : null;
};

type GridCell = {|
  at: Point,
  closestIndex: null | number
|};

type Grid = {|
  coords: Point[],
  bounds: Bounds,
  cells: GridCell[]
|};

const makeGrid = (coords: Point[]): Grid => {
  const bounds = computeBounds(coords);

  const cells: GridCell[] = [];
  for (let x = bounds.topLeft.x; x <= bounds.bottomRight.x; x++) {
    for (let y = bounds.topLeft.y; y <= bounds.bottomRight.y; y++) {
      const point = { x, y };

      cells.push({
        at: point,
        closestIndex: findClosestIndex(point, coords)
      });
    }
  }

  return {
    coords,
    bounds,
    cells
  };
};

const computeAreas = ({ coords, bounds, cells }: Grid) =>
  coords.map((point, index) =>
    cells.reduce((area, { at: { x, y }, closestIndex }) => {
      if (closestIndex === index) {
        if (
          x === bounds.topLeft.x ||
          x === bounds.bottomRight.x ||
          y === bounds.topLeft.y ||
          y === bounds.bottomRight.y
        ) {
          return Infinity;
        } else {
          return area + 1;
        }
      } else {
        return area;
      }
    }, 0)
  );

const findMaxArea = (areas: number[]) =>
  areas
    .filter(area => area !== Infinity)
    .reduce(
      (maxArea, area) => (maxArea === null || area > maxArea ? area : maxArea),
      null
    );

console.log("Input coordinates then press <ctrl-D>:");

getInputLines()
  .then(parseCoords)
  .then(coords => {
    console.log("Calculating...");
    return coords;
  })
  .then(makeGrid)
  .then(computeAreas)
  .then(findMaxArea)
  .then(
    maxArea =>
      maxArea === null
        ? console.log("Could not find a maximum area")
        : console.log(`Maximum area: ${maxArea}`),
    error => console.error(error)
  );
