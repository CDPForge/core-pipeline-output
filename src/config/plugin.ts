import type { Config } from '@cdp-forge/plugin-pipeline-sdk';

const config: Config['plugin'] = {
  name: 'plugin-pipeline-es-output',
  priority: 100,
  type: 'parallel'
}

export default config;