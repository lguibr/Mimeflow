import Dexie, { Table } from "dexie";

export interface LeaderBoard {
  id?: number;
  hash: string;
  score: number;
}

export class DexieInstance extends Dexie {
  leaderBoard!: Table<LeaderBoard>;

  constructor() {
    super("myDatabase");
    this.version(1).stores({
      leaderBoard: "++id, hash, score",
    });
  }
}

export const db = new DexieInstance();
