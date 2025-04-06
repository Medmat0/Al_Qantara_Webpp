import express from "express";
import authRoutes from "./src/routes/auth.routes.js";  
import revuesRoutes from './src/routes/revues.routes.js' 
import cors from "cors";
import bodyParser from "body-parser";
const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());   
app.use(bodyParser.json()); 
app.use(express.json());

app.use(express.urlencoded({ extended: true })); // Pour form-data et x-www-form-urlencoded


app.use("/auth", authRoutes);
app.use("/revues", revuesRoutes)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
