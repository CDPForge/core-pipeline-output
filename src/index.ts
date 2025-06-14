import EsIndexer from './plugin/EsIndexer';
import Config from './config';
import PipelineStage from './PipelineStage';
import RestEP from './RestEP';

const stage = new PipelineStage(new EsIndexer());
const restEP = new RestEP(async (body: { inputTopic: string, outputTopic: string | null }) => {
  await stage.restart(body.inputTopic, body.outputTopic);
});
const pluginRegistrationBody = {
  name: Config.getInstance().config.pluginName,
  priority: Config.getInstance().config.priority,
  type: Config.getInstance().config.type,
};

fetch(`${Config.getInstance().config.pluginManagerUrl}/register`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(pluginRegistrationBody),
}).then(res => {
  if (!res.ok) {
    throw new Error(`Failed to register plugin with Template Manager: ${res.statusText}`);
  }
  return res.json();
}).then(json => {
  if (!json || !json.inputTopic || !json.outputTopic) {
    throw new Error('Failed to fetch plugin configuration from Template Manager.');
  }
  stage.start(json.inputTopic, json.outputTopic);
  restEP.start();
});

const handleExit = async () => {
  console.log('Server shutdown in progress...');
  await stage.stop();
  process.exit(0);
};

process.on('SIGINT', handleExit);
process.on('SIGTERM', handleExit);