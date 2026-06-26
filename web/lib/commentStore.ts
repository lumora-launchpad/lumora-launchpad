import { promises as fs } from "fs";
import path from "path";

export type Comment = {
  id: string;
  author: string; // wallet address, or "" for anonymous
  text: string;
  createdAt: number; // ms since epoch
};

export interface CommentStore {
  list(address: string): Promise<Comment[]>;
  add(address: string, comment: Comment): Promise<void>;
}

const MAX_PER_TOKEN = 200;

/**
 * Off chain per token comment threads, stored as a single JSON file keyed by
 * lowercased token address. Same simple file backed approach as
 * [[metadataStore]]; it persists on a single long lived server (this VPS) but
 * not on an ephemeral serverless filesystem. The CommentStore interface is the
 * seam for swapping in a real datastore later.
 */
class JsonFileCommentStore implements CommentStore {
  private filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  private async readAll(): Promise<Record<string, Comment[]>> {
    try {
      const raw = await fs.readFile(this.filePath, "utf8");
      return JSON.parse(raw) as Record<string, Comment[]>;
    } catch {
      return {};
    }
  }

  private async writeAll(data: Record<string, Comment[]>): Promise<void> {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), "utf8");
  }

  async list(address: string): Promise<Comment[]> {
    const all = await this.readAll();
    return all[address.toLowerCase()] ?? [];
  }

  async add(address: string, comment: Comment): Promise<void> {
    const all = await this.readAll();
    const key = address.toLowerCase();
    const thread = all[key] ?? [];
    thread.push(comment);
    // keep the newest MAX_PER_TOKEN
    all[key] = thread.slice(-MAX_PER_TOKEN);
    await this.writeAll(all);
  }
}

const DATA_FILE = path.join(process.cwd(), ".data", "token-comments.json");

export const commentStore: CommentStore = new JsonFileCommentStore(DATA_FILE);
