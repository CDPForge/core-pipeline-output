import { Client } from '@opensearch-project/opensearch';
import { PipelinePluginI, Log, Config } from '@cdp-forge/plugin-pipeline-sdk';
import fs from "fs";
import path from "path";

const prefixIndex = "users-logs-";

export default class EsIndexer implements PipelinePluginI{
  private client: Client;
  private readonly batchSize: number;
  private logs: Log[];
  private readonly timeout: number;
  private timeoutId: NodeJS.Timeout | null;
  private isProcessing: boolean;

  constructor( config: Config, batchSize: number = 100, timeout: number = 500) {

    const auth = config.opensearch!.username && config.opensearch!.password
      ? { username: config.opensearch!.username, password: config.opensearch!.password }
      : undefined;

    this.client = new Client({
      node: config.opensearch!.url,
      auth,
      ssl: {
        ca: fs.readFileSync(path.join(__dirname, '../certs/root-ca.pem')),
        rejectUnauthorized: true
      }
    });

    this.batchSize = batchSize;
    this.logs = [];
    this.timeout = timeout;
    this.timeoutId = null;
    this.isProcessing = false;
  }

  private async sendLog(log: Log) {
    this.logs.push(log);

    if (this.logs.length >= this.batchSize) {
      await this.sendBatch();
    } else {
      if (!this.timeoutId) {
        this.scheduleFlush();
      }
    }
  }

  private scheduleFlush() {
    this.timeoutId = setTimeout(async () => {
      await this.sendBatch();
    }, this.timeout);
  }

  private async sendBatch() {
    if (this.isProcessing || this.logs.length === 0 ) return;

    this.isProcessing = true;

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    const body = this.logs.flatMap(log => [
      { index: { _index: prefixIndex + log.client } },
      log,
    ]);

    const logsBackup: Log[] = JSON.parse(JSON.stringify(this.logs));
    this.logs = [];

    try {
      const { body: bulkResponse } = await this.client.bulk({ body });

      if (bulkResponse.errors) {
        console.error('Errore durante l\'invio dei log in bulk:', bulkResponse.errors);
        this.logs = logsBackup.concat(this.logs);
      } else {
        console.log(`Batch inviato correttamente con ${body.length / 2} log.`);
      }
    } catch (error) {
      console.error('Errore durante l\'invio dei log:', error);
      this.logs = logsBackup.concat(this.logs);
    } finally {
      this.isProcessing = false;
    }
  }

  public async flush() {
    if (this.logs.length > 0) {
      await this.sendBatch();
    }
  }

  public async elaborate(log: Log): Promise<Log | null> {
    await this.sendLog(log);
    return log;
  }

  public async init(): Promise<void> {
    return Promise.resolve();
  }
}
