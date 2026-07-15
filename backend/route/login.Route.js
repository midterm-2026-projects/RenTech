// backend/route/login.Route.js
import express from 'express';
import * as loginController from '../controller/loginController.js';

const router = express.Router();

router.post('/register', loginController.register);
router.post('/login', loginController.login);

export default router;