require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(` OFDMS Server running in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(` Port: ${PORT}`);
      console.log(` Health check: http://localhost:${PORT}/api/health`);
      console.log(` API Base: http://localhost:${PORT}/api/v1`);
      console.log(`=======================================================`);
    });

    process.on('unhandledRejection', (err) => {
      console.error(`[Server Error] Unhandled rejection: ${err.message}`);
    });
  } catch (error) {
    console.error(`[Startup Error] ${error.message}`);
  }
};

startServer();
