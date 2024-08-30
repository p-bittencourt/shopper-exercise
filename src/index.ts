import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import uploadController from './controllers/uploadController.js';

const app = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.post('/upload', uploadController);
app.patch('/confirm', (req, res) => {});
app.get('/:customerCode/list', (req, res) => {});

app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({
      error: 'Internal Server Error',
      message: err.message,
    });
  }
);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
