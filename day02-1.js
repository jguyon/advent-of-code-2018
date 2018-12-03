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

type LetterCounts = {|
  hasTwo: boolean,
  hasThree: boolean
|};

const getLetterCounts = (ids: string[][]): LetterCounts[] =>
  ids.map(id => {
    const counts = new Map<string, number>();
    id.forEach(letter => {
      const letterCount = counts.get(letter);

      if (letterCount === undefined) {
        counts.set(letter, 1);
      } else {
        counts.set(letter, letterCount + 1);
      }
    });

    let hasTwo = false;
    let hasThree = false;
    counts.forEach((letterCount, letter) => {
      if (letterCount === 2) {
        hasTwo = true;
      } else if (letterCount === 3) {
        hasThree = true;
      }
    });

    return {
      hasTwo,
      hasThree
    };
  });

const calcChecksum = (letterCounts: LetterCounts[]) => {
  const { twoCount, threeCount } = letterCounts.reduce(
    ({ twoCount, threeCount }, { hasTwo, hasThree }) => ({
      twoCount: hasTwo ? twoCount + 1 : twoCount,
      threeCount: hasThree ? threeCount + 1 : threeCount
    }),
    { twoCount: 0, threeCount: 0 }
  );

  return twoCount * threeCount;
};

console.log("Input box IDs then press <ctrl-D>:");

getInputLines()
  .then(parseIDs)
  .then(getLetterCounts)
  .then(calcChecksum)
  .then(
    checksum => console.log("Checksum:", checksum),
    error => console.error(error)
  );
