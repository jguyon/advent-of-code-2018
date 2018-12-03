// @flow

import * as readline from "readline";

const addFreq = (prevFreq: number, nextLine: string) => {
  const nextFreq = parseInt(nextLine, 10);

  if (isNaN(nextFreq)) {
    throw new Error("invalid input");
  }

  return prevFreq + nextFreq;
};

let freq = 0;
readline
  .createInterface({ input: process.stdin })
  .on("line", (line: string) => {
    freq = addFreq(freq, line);
  })
  .on("close", () => {
    console.log("frequency:", freq);
  });
