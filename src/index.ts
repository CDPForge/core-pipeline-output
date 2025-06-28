import path from 'path';
import EsIndexer from './EsIndexer';
import {Config, ConfigReader, start} from '@cdp-forge/plugin-pipeline-sdk'

const config: Config = ConfigReader.generate(path.join(__dirname, '../config/config.yml'),path.join(__dirname, '../config/plugin.yml'));
const esIndexer = new EsIndexer(config);

start(esIndexer, config)