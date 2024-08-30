import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import handlePostUpload from './controllers/uploadController.js';
import handlePatchConfirm from './controllers/patchController.js';
import handleGetCustomerMeasures from './controllers/getController.js';
const app = express();
const port = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.post('/upload', handlePostUpload);
app.patch('/confirm', handlePatchConfirm);
app.get('/:customerCode/list', handleGetCustomerMeasures);
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message,
    });
});
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
