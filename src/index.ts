import path from 'path';
import EsIndexer from './EsIndexer';
import {Config, PipelineStage, ConfigReader, start} from 'plugin-pipeline-sdk'

const config = ConfigReader.generate(path.join(__dirname, '../config/config.yml'),path.join(__dirname, '../config/plugin.yml'));
const esIndexer = new EsIndexer(config);

start(esIndexer, config)