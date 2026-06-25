import { promises as fs } from "fs";
import path from "path";

export type TokenMetadata = {
  description?: string;
  imageUrl?: string;
};

export interface MetadataStore {
  get(address: string): Promise<TokenMetadata | undefined>;
  set(address: string, metadata: TokenMetadata): Promise<void>;
}

/**
 * Off chain token metadata, stored as a single JSON file keyed by lowercased
 * token address. This is the simplest store that works for local dev and a
 * single long lived server. It does not survive across instances on
 * serverless platforms with an ephemeral or read only filesystem (for
 * example Vercel), so production should swap this for a real datastore
 * (Postgres, Redis, Vercel KV, etc). The MetadataStore interface above is
 * the seam: implement it against the new backend and change the export at
 * the bottom of this file, nothing else in the app needs to change.
 */
class JsonFileMetadataStore implements MetadataStore {
  private filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  private async readAll(): Promise<Record<string, TokenMetadata>> {
    try {
      const raw = await fs.readFile(this.filePath, "utf8");
      return JSON.parse(raw) as Record<string, TokenMetadata>;
    } catch {
      return {};
    }
  }

  private async writeAll(data: Record<string, TokenMetadata>): Promise<void> {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), "utf8");
  }

  async get(address: string): Promise<TokenMetadata | undefined> {
    const all = await this.readAll();
    return all[address.toLowerCase()];
  }

  async set(address: string, metadata: TokenMetadata): Promise<void> {
    const all = await this.readAll();
    all[address.toLowerCase()] = metadata;
    await this.writeAll(all);
  }
}

const DATA_FILE = path.join(process.cwd(), ".data", "token-metadata.json");

export const metadataStore: MetadataStore = new JsonFileMetadataStore(DATA_FILE);
