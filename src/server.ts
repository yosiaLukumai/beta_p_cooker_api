import app from './app';
import config from './config/config';
import { ConnectToDatabase } from './config/databaseconnection';

ConnectToDatabase();



app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});