import { createApp } from "./app.js";
import { loadConfig } from "./shared/config.js";

const config = loadConfig();
createApp(config).listen(config.port, config.host, () => {
  console.log(`Room 404 API ready at http://${config.host}:${config.port}`);
});
