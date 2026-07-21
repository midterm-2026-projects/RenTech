import { startServers } from './serverProcesses.js';

export default async function globalSetup() {
  await startServers();
}
