import { Kafka, Producer, Consumer, EachMessagePayload } from "kafkajs";
import PipelinePluginI from "./plugin/PipelinePluginI";
import Config from "./config";
import { Log } from "./types";

const podName = process.env.CLIENT_ID || 'default-client-id';

export default class PipelineSTage{
    plugin: PipelinePluginI;
    consumer: Consumer;
    producer: Producer;
    kafka: Kafka;
    input: string | null;
    output: string | null;
    currentOperation: Promise<void>;

    constructor(plugin: PipelinePluginI) {
        this.plugin = plugin;
        this.kafka = new Kafka({
          clientId: Config.getInstance().config.pluginName + `plugin-${podName}`,
          brokers: Config.getInstance().config.kafkaConfig.brokers,
        });
        this.consumer = this.kafka.consumer({ groupId: Config.getInstance().config.pluginName + `plugin` });
        this.producer = this.kafka.producer();
        this.input = null;
        this.output = null;
        this.currentOperation = Promise.resolve();
    }

    async start(inputTopic: string, outputTopic: string | null = null): Promise<void> {
        this.input = inputTopic;
        this.output = outputTopic;
        await this.currentOperation;
        this.currentOperation = this._start();
        return this.currentOperation;
    }

    private async _start(): Promise<void> {
        if(this.output) await this.producer.connect();

        await this.consumer.connect();
        await this.consumer.subscribe({ topic: this.input!, fromBeginning: false });
        await this.consumer.run({
          autoCommit: false,
          eachMessage: async ({ topic, partition, message  }: EachMessagePayload) => {
            const log: Log = message.value ? JSON.parse(message.value.toString()) : null;
            if(!log) return;
            const elaboratedLog = await this.plugin.elaborate(log);
            if(!elaboratedLog) {
              console.warn('Messaggio non elaborato');
              await this.consumer.commitOffsets([{ topic, partition, offset: (BigInt(message.offset) + 1n).toString() }]);
              return;
            }
      
            if(this.output) {
              await this.producer.send({
                topic: this.output,
                messages: [{ value: JSON.stringify(elaboratedLog) }],
                });
              await this.consumer.commitOffsets([{ topic, partition, offset: (BigInt(message.offset) + 1n).toString() }]);
            }
          },
        });
    }

    async stop(): Promise<void> {
        await this.currentOperation;
        this.currentOperation = this._stop();
        return this.currentOperation;
    }

    private async _stop(): Promise<void> {
        await this.consumer.disconnect();
        await this.producer.disconnect(); 
    }

    async restart(inputTopic: string,outputTopic: string|null): Promise<void> {
        await this.stop();
        await this.start(inputTopic,outputTopic);
    }
}