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

const parseChanges = (lines: string[]) =>
  lines.map(line => {
    const change = parseInt(line, 10);

    if (isNaN(change)) {
      throw new Error(`"${line.trim()}" is not a valid integer`);
    }

    return change;
  });

const calcFreq = (changes: number[]) =>
  changes.reduce((freq, change) => freq + change, 0);

console.log("Input frequencies then press <ctrl-D>:");

getInputLines()
  .then(parseChanges)
  .then(calcFreq)
  .then(
    freq => console.log("Final frequency:", freq),
    error => console.error(error)
  );
