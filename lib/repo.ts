import { difference } from "difference";
import { join } from "path";
import { sprintf } from "printf";
import { today } from "./calendar.ts";

////////////////////////////////////////////////////////////////////////
// Generic File
////////////////////////////////////////////////////////////////////////

abstract class RepoFile {
  abstract filename: string;
  abstract url: string;
  abstract expire: number;
  abstract read(): Promise<DiscoverData>;
  abstract validate(filePath: string): Promise<boolean>;

  constructor(protected readonly repo: Repo) {}

  /** Full path to file, using named dirName */
  async path(dirName?: string): Promise<string> {
    // Join elements in path
    if (dirName) return join(this.repo.path, dirName, this.filename);

    // Scan for file
    const dirNames = await this.repo.dirNames();
    for (const dirName of dirNames.reverse()) {
      const filePath = await this.path(dirName);
      const fileInfo = await Deno.stat(filePath);
      if (fileInfo.isFile) return filePath;
    }

    // No file found
    throw new Error(`File ${this.filename} could not be found in any dir`);
  }

  /** Age of most recent file in minutes */
  async age(): Promise<number> {
    const filePath = await this.path();
    const file = await Deno.stat(filePath);
    const mtime: Date | null = file.mtime;
    if (!mtime) throw new Error(`Cannot get mtime for ${filePath}`);
    const diff = difference(mtime, new Date(), { units: ["minutes"] });
    if (diff.minutes != undefined) return diff.minutes;
    console.log("diff: ", diff);
    throw new Error(`Age cannot be decided in minutes`);
  }

  /** Read content of latest file */
  async readRaw(): Promise<string> {
    const filePath = await this.path();
    return await Deno.readTextFile(filePath);
  }

  /** Write file in todays dir */
  async writeRaw(content: string): Promise<void> {
    const dirName = today();
    await this.repo.create(dirName);
    const filePath = await this.path(dirName);
    Deno.writeTextFile(filePath, content);
  }

  async downloadRaw(url: string): Promise<void> {
    const response = await fetch(url);
    if (response.body) {
      // Save to temporary file
      const tempfile = await Deno.makeTempFile();
      const file = await Deno.open(tempfile, { write: true, create: true });
      //console.log(`Download from ${url} to ${tempfile}`);
      await response.body.pipeTo(file.writable);
      //console.log(`Download to ${tempfile} completed`);

      // Validate file
      if (!await this.validate(tempfile)) {
        await Deno.remove(tempfile);
        throw new Error("File validation failed.");
      }

      // Move the downloaded file
      const dirName = today();
      await this.repo.create(dirName);
      const filePath = await this.path(dirName);
      await Deno.rename(tempfile, filePath);
    } else {
      throw new Error(`Could not download ${url}. Error: ` + response);
    }
  }

  /** Determine if file sufficiently recent */
  async recent(): Promise<boolean> {
    const age = await this.age();
    return age < this.expire;
  }
}

////////////////////////////////////////////////////////////////////////
// Discover
////////////////////////////////////////////////////////////////////////

export interface DiscoverData {
  Status: string;
  TotalRows: number;
  Items: Record<string, string | never>[];
}

export class DiscoverFile extends RepoFile {
  filename = "discover.json";
  url = "https://www.etoro.com/sapi/rankings/rankings?client_request_id=%s&%s";
  expire = 3000; // Max age in miutes

  /** Parse and validate content of file */
  async read(): Promise<DiscoverData> {
    const raw = await this.readRaw();
    const parsed: DiscoverData = JSON.parse(raw);
    return parsed;
  }

  async download(): Promise<void> {
    const daily = 4;
    const weekly = 11;
    const risk = 4;
    const filter =
      `blocked=false&bonusonly=false&copyblock=false&istestaccount=false&optin=true&page=1&period=OneYearAgo&verified=true&isfund=false&copiersmin=1&dailyddmin=-${daily}&gainmin=11&gainmax=350&maxmonthlyriskscoremax=${risk}&maxmonthlyriskscoremin=2&pagesize=70&profitablemonthspctmin=60&sort=-weeklydd&weeklyddmin=-${weekly}&activeweeksmin=12&lastactivitymax=14`;
    const url = sprintf(this.url, this.repo.uuid, filter);
    await this.downloadRaw(url);
  }

  /** Confirm content of file */
  async validate(filePath: string): Promise<boolean> {
    const content = await Deno.readTextFile(filePath);
    const data: DiscoverData = JSON.parse(content);
    const results = data.TotalRows;
    if (results < 70) {
      throw new Error(`Discover Error: results ${results} < 70`);
    } else if (results > 140) {
      throw new Error(`Discover Error: results ${results} > 140`);
    }
    return true;
  }

  /** Load from file or download if too old */
  async load(): Promise<DiscoverData> {
    try {
      if (!await this.recent()) await this.download();
    } catch (_error) {
      await this.download();
    }
    return await this.read();
  }
}

////////////////////////////////////////////////////////////////////////
// Repository
////////////////////////////////////////////////////////////////////////

/** Manage all files */
export class Repo {
  constructor(readonly path: string) {}

  /** List if dir names sorted by date, oldest first */
  async dirNames(): Promise<string[]> {
    const dirNames: string[] = [];

    for await (const dirEntry of Deno.readDir(this.path)) {
      if (dirEntry.isDirectory) {
        dirNames.push(dirEntry.name);
      }
    }

    return dirNames.sort();
  }
  /** Create directory */
  async create(dirName: string): Promise<void> {
    const path = join(this.path, dirName);
    try {
      await Deno.stat(path);
    } catch {
      await Deno.mkdir(path);
    }
  }

  /** Latest discover file */
  discover(): DiscoverFile {
    return new DiscoverFile(this);
  }

  get uuid(): string {
    return "52eb50a8-90c6-4e64-832f-7a9d685164aa";
  }
}
