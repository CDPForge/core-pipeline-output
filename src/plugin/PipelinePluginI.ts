import { Log } from '../types';
export default interface PipelinePluginI {
    elaborate(log: Log):  Promise<Log | null>;
}