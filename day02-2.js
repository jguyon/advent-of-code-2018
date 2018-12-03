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

const parseIDs = (lines: string[]) => lines.map(line => line.trim().split(""));

const makeCouples = (ids: string[][]) =>
  ids.reduce((couples, currentId, currentIndex) => {
    const currentCouples: Array<[string[], string[]]> = ids
      .slice(currentIndex + 1)
      .map(id => [currentId, id]);

    return [...couples, ...currentCouples];
  }, []);

const findDupCouple = (couples: Array<[string[], string[]]>) =>
  couples.find(([id1, id2]) => {
    let differingLetters = 0;
    for (let i = 0; i < id1.length && id2.length; i++) {
      if (id1[i] !== id2[i]) {
        differingLetters++;
      }
    }

    return differingLetters === 1;
  });

const joinDupLetters = ([id1, id2]: [string[], string[]]) => {
  let letters = "";
  for (let i = 0; i < id1.length && id2.length; i++) {
    if (id1[i] === id2[i]) {
      letters = letters + id1[i];
    }
  }

  return letters;
};

console.log("Input box IDs then press <ctrl-D>:");

getInputLines()
  .then(parseIDs)
  .then(makeCouples)
  .then(findDupCouple)
  .then(
    dupCouple =>
      dupCouple === undefined
        ? console.log("No close IDs found")
        : console.log("Common letters:", joinDupLetters(dupCouple)),
    error => console.error(error)
  );
