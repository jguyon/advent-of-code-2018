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

const RECORD_TYPE_BEGINS_SHIFT: 0 = 0;
type RecordBeginsShift = {|
  type: typeof RECORD_TYPE_BEGINS_SHIFT,
  date: number,
  guardID: number
|};

const RECORD_TYPE_FALLS_ASLEEP: 1 = 1;
type RecordFallsAsleep = {|
  type: typeof RECORD_TYPE_FALLS_ASLEEP,
  date: number,
  minute: number
|};

const RECORD_TYPE_WAKES_UP: 2 = 2;
type RecordWakesUp = {|
  type: typeof RECORD_TYPE_WAKES_UP,
  date: number,
  minute: number
|};

type Record = RecordBeginsShift | RecordFallsAsleep | RecordWakesUp;

const parseRecords = (lines: string[]): Record[] =>
  lines.map(line => {
    const lineMatches = line.match(
      /^\[(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})\] (.+)$/
    );

    if (lineMatches) {
      let beginsShiftMatches;
      const date = new Date(
        Date.UTC(
          parseInt(lineMatches[1], 10),
          parseInt(lineMatches[2], 10) - 1,
          parseInt(lineMatches[3], 10)
        )
      );

      if (lineMatches[6] === "falls asleep" && lineMatches[4] === "00") {
        return {
          type: RECORD_TYPE_FALLS_ASLEEP,
          date: date.getTime(),
          minute: parseInt(lineMatches[5], 10)
        };
      } else if (lineMatches[6] === "wakes up" && lineMatches[4] === "00") {
        return {
          type: RECORD_TYPE_WAKES_UP,
          date: date.getTime(),
          minute: parseInt(lineMatches[5], 10)
        };
      } else if (
        (beginsShiftMatches = lineMatches[6].match(
          /^Guard #([0-9]+) begins shift$/
        ))
      ) {
        if (lineMatches[4] !== "00") {
          date.setDate(date.getDate() + 1);
        }
        return {
          type: RECORD_TYPE_BEGINS_SHIFT,
          date: date.getTime(),
          guardID: parseInt(beginsShiftMatches[1], 10)
        };
      }
    }

    throw new Error(`${line} is not a valid shift record`);
  });

const groupRecordsByDate = (records: Record[]): Map<number, Record[]> => {
  const recordsByDate = new Map();

  records.forEach(record => {
    const recordsForDate = recordsByDate.get(record.date);

    if (recordsForDate) {
      recordsForDate.push(record);
    } else {
      recordsByDate.set(record.date, [record]);
    }
  });

  recordsByDate.forEach((records, date) => {
    const sortedRecords = records.sort((recordA, recordB) => {
      if (recordA.type === RECORD_TYPE_BEGINS_SHIFT) {
        return -1;
      }

      if (recordB.type === RECORD_TYPE_BEGINS_SHIFT) {
        return 1;
      }

      return recordA.minute - recordB.minute;
    });

    recordsByDate.set(date, sortedRecords);
  });

  return recordsByDate;
};

type AsleepInterval = {|
  start: number,
  end: number
|};

const computeAsleepIntervalsByGuard = (
  recordsByDate: Map<number, Record[]>
): Map<number, AsleepInterval[]> => {
  const asleepIntervalsByGuard = new Map();

  recordsByDate.forEach((records, date) => {
    const beginsShiftRecord = records[0];

    if (beginsShiftRecord.type !== RECORD_TYPE_BEGINS_SHIFT) {
      throw new Error(
        `No start of shift found for day ${new Date(date).toUTCString()}`
      );
    }

    const guardID = beginsShiftRecord.guardID;
    const guardAsleepIntervals = asleepIntervalsByGuard.get(guardID) || [];

    for (let i = 1; i < records.length; i = i + 2) {
      const fallsAsleepRecord = records[i];
      const wakesUpRecord = records[i + 1];

      if (
        i + 1 >= records.length ||
        fallsAsleepRecord.type !== RECORD_TYPE_FALLS_ASLEEP ||
        wakesUpRecord.type !== RECORD_TYPE_WAKES_UP
      ) {
        throw new Error(
          `Guard #${guardID} has invalid sleep logs on day ${new Date(
            date
          ).toUTCString()}`
        );
      }

      guardAsleepIntervals.push({
        start: fallsAsleepRecord.minute,
        end: wakesUpRecord.minute
      });
    }

    asleepIntervalsByGuard.set(guardID, guardAsleepIntervals);
  });

  return asleepIntervalsByGuard;
};

type GuardAsleepIntervals = {|
  guardID: number,
  totalTimeAsleep: number,
  asleepIntervals: AsleepInterval[]
|};

const findMostAsleepGuard = (
  asleepIntervalsByGuard: Map<number, AsleepInterval[]>
): null | GuardAsleepIntervals => {
  let maxAsleep: null | GuardAsleepIntervals = null;

  asleepIntervalsByGuard.forEach((asleepIntervals, guardID) => {
    const totalTimeAsleep = asleepIntervals.reduce(
      (total, { start, end }) => total + end - start,
      0
    );

    if (maxAsleep === null || totalTimeAsleep > maxAsleep.totalTimeAsleep) {
      maxAsleep = {
        guardID,
        totalTimeAsleep,
        asleepIntervals
      };
    }
  });

  return maxAsleep;
};

type GuardMostAsleepMinute = {|
  guardID: number,
  daysAsleep: number,
  mostAsleepMinute: number
|};

const findMostAsleepMinute = ({
  guardID,
  asleepIntervals
}: GuardAsleepIntervals): null | GuardMostAsleepMinute => {
  const daysSpentAsleepForEachMinute = new Map();

  asleepIntervals.forEach(({ start, end }) => {
    for (let minute = start; minute < end; minute++) {
      const daysSpentAsleep = daysSpentAsleepForEachMinute.get(minute) || 0;
      daysSpentAsleepForEachMinute.set(minute, daysSpentAsleep + 1);
    }
  });

  let mostAsleep: null | GuardMostAsleepMinute = null;

  daysSpentAsleepForEachMinute.forEach((daysAsleep, minute) => {
    if (mostAsleep === null || daysAsleep > mostAsleep.daysAsleep) {
      mostAsleep = {
        guardID,
        daysAsleep,
        mostAsleepMinute: minute
      };
    }
  });

  return mostAsleep;
};

console.log("Input shift records then press <ctrl-D>:");

getInputLines()
  .then(parseRecords)
  .then(groupRecordsByDate)
  .then(computeAsleepIntervalsByGuard)
  .then(findMostAsleepGuard)
  .then(guard => (guard === null ? null : findMostAsleepMinute(guard)))
  .then(mostAsleep =>
    mostAsleep === null
      ? null
      : mostAsleep.guardID * mostAsleep.mostAsleepMinute
  )
  .then(
    factor =>
      factor === null
        ? console.log("Could not compute most asleep minute")
        : console.log(`Most asleep factor: ${factor}`),
    error => console.log(error)
  );
