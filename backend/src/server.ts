import { openDatabase } from './infrastructure/persistence/database.connection';
import { SQLiteFollowersRepository } from './infrastructure/persistence/sqlite/sqlite-followers.repository';
import { FollowersService } from './application/services/followers.service';
import { parseEnvironment } from './config/env';
import { createApp } from './app';

const configuration = parseEnvironment(process.env);
const database = openDatabase(configuration.databasePath);
const repository = new SQLiteFollowersRepository(database);
const followersService = new FollowersService(repository, configuration.creatorId);
const app = createApp({
  followersService,
  creatorId: configuration.creatorId,
  allowedOrigin: configuration.allowedOrigin,
});
const server = app.listen(configuration.port, () => {
  console.info(`Followers API listening on port ${configuration.port}.`);
});

server.on('error', (error: Error) => {
  console.error('The Followers API failed to start.', error);
  database.close();
  process.exitCode = 1;
});

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    server.close((error) => {
      if (error) {
        console.error('The Followers API failed to shut down cleanly.', error);
        process.exitCode = 1;
      }

      database.close();
    });
  });
}
