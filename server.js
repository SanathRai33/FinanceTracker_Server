require("dotenv").config();
const env = require('./src/config/env');
const app = require('./src/app.js'); 
const connectDB = require('./src/db/db.js'); 

const PORT = env.PORT;

const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${env.NODE_ENV}`);
      console.log(`📝 Base URL: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();