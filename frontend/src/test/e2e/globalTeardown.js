import { stopServers } from './serverProcesses.js';

export default async function globalTeardown() {
  await stopServers();
}
