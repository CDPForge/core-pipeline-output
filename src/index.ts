import EsIndexer from './EsIndexer';
import {clusterConfig, start} from '@cdp-forge/plugin-pipeline-sdk'
import pluginConfig from './config/plugin';

const esIndexer = new EsIndexer(clusterConfig);

start(esIndexer, pluginConfig)