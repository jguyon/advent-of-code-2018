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

const findRepeatFreq = (changes: number[]) => {
  const prevFreqs = [0];

  while (true) {
    for (const change of changes) {
      const nextFreq = prevFreqs[prevFreqs.length - 1] + change;

      if (prevFreqs.includes(nextFreq)) {
        return nextFreq;
      }

      prevFreqs.push(nextFreq);
    }
  }
};

console.log("Input frequency changes then press <ctrl-D>:");

getInputLines()
  .then(parseChanges)
  .then(changes => {
    console.log("Calculating...");
    return changes;
  })
  .then(findRepeatFreq)
  .then(
    repeatFreq => console.log("First repeated frequency:", repeatFreq),
    error => console.error(error)
  );
