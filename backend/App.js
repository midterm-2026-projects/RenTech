import express from 'express';
import cors from 'cors';
import loginRoutes from './route/login.route.js'; 

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use('/api', loginRoutes); 

app.listen(PORT, () => {
  console.log(`🚀 Standalone backend server running at http://localhost:${PORT}`);
});

