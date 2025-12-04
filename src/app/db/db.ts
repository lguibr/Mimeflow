import Dexie, { Table } from "dexie";

export interface Score {
  id?: number;
  videoId: string;
  score: number;
  percentage: number;
  date: Date;
  history: number[]; // Array of scores over time for the graph
}

export class MimeflowDatabase extends Dexie {
  scores!: Table<Score>;

  constructor() {
    super("MimeflowDatabase");
    this.version(1).stores({
      scores: "++id, videoId, score, date",
    });
  }
}

export const db = new MimeflowDatabase();
