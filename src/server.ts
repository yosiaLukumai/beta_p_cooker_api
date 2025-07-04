import app from './app';
import config from './config/config';
import { ConnectToDatabase } from './config/databaseconnection';

ConnectToDatabase();



const configuredPort = config.PROD_READY ? config.prod_port : config.port;


app.listen(configuredPort, () => {
  if (config.PROD_READY) {
    console.log("Production server running on port", config.prod_port);
    console.warn("Production server running on port", config.prod_port);
  } else {
    console.log("Development server running on port", config.port);
    console.warn("Development server running on port", config.port);
  }
});