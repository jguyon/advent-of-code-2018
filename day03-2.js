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

const findLoneClaim = (claims: Claim[]) => {
  const areOverlapping = (c1: Claim, c2: Claim) =>
    c1.id !== c2.id &&
    c1.x < c2.x + c2.w &&
    c2.x < c1.x + c1.w &&
    c1.y < c2.y + c2.h &&
    c2.y < c1.y + c1.h;

  return claims.find(c1 => !claims.find(c2 => areOverlapping(c1, c2)));
};

console.log("Input box IDs then press <ctrl-D>:");

getInputLines()
  .then(parseClaims)
  .then(findLoneClaim)
  .then(
    claim =>
      claim === undefined
        ? console.log("All claims are overlapping")
        : console.log("Non-overlapping claim ID:", claim.id),
    error => console.error(error)
  );
