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

type Claim = {|
  id: number,
  x: number,
  y: number,
  w: number,
  h: number
|};

const parseClaims = (lines: string[]): Claim[] =>
  lines.map(line => {
    const matches = line.match(
      /#([0-9]+) @ ([0-9]+),([0-9]+): ([0-9]+)x([0-9]+)/
    );

    if (matches === null) {
      throw new Error(`"${line}" is not a valid box ID`);
    } else {
      return {
        id: parseInt(matches[1], 10),
        x: parseInt(matches[2], 10),
        y: parseInt(matches[3], 10),
        w: parseInt(matches[4], 10),
        h: parseInt(matches[5], 10)
      };
    }
  });

type Bounds = {|
  w: number,
  h: number
|};

const calcBounds = (claims: Claim[]): Bounds =>
  claims.reduce(
    ({ w, h }, claim) => ({
      w: Math.max(w, claim.x + claim.w),
      h: Math.max(h, claim.y + claim.h)
    }),
    { w: 0, h: 0 }
  );

const calcOverlapArea = (claims: Claim[], bounds: Bounds) => {
  let squareInches = 0;
  for (let x = 0; x < bounds.w; x++) {
    for (let y = 0; y < bounds.h; y++) {
      if (
        claims.filter(
          claim =>
            x >= claim.x &&
            x < claim.x + claim.w &&
            y >= claim.y &&
            y < claim.y + claim.h
        ).length >= 2
      ) {
        squareInches++;
      }
    }
  }

  return squareInches;
};

console.log("Input box IDs then press <ctrl-D>:");

getInputLines()
  .then(parseClaims)
  .then(claims => {
    console.log("Calculating...");
    return claims;
  })
  .then(claims => {
    const bounds = calcBounds(claims);
    return calcOverlapArea(claims, bounds);
  })
  .then(
    overlapArea => console.log("Overlap area:", overlapArea, "square inches"),
    error => console.error(error)
  );
