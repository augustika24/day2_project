import http from 'http';
import dotenv from 'dotenv';
import { handleUserRoutes } from './routes/users/index.js';
import { handleProductRoutes } from './routes/products/index.js';

dotenv.config();
const PORT = process.env.PORT;
export const app = http.createServer((req,res)=>{
    handleUserRoutes(req, res);
    handleProductRoutes(req,res);
})

app.listen(PORT, () => {
    console.log(`Server Started listening at ${PORT}`);
});
