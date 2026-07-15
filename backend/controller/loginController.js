import * as loginService from '../service/login.service.js';

export const register = async (req, res) => {
    try {
        const { email, password, username } = req.body;
        const result = await loginService.registerUser(email, password, username);
        res.status(201).json({ success: true, data: result });
    } catch (error) {
        // This will print the actual reason for the 400 error in your terminal
        console.error("DEBUG - SUPABASE REGISTRATION ERROR:", error.message); 
        res.status(400).json({ success: false, message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || typeof email !== 'string' || email.trim() === '') {
            return res.status(400).json({ success: false, message: 'Valid email is required' });
        }

        if (!password || typeof password !== 'string' || password.trim() === '') {
            return res.status(400).json({ success: false, message: 'Password is required' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: 'Invalid email format' });
        }

        const session = await loginService.loginUser(email, password);
        res.status(200).json({ success: true, session });
    } catch (error) {
        res.status(401).json({ success: false, message: error.message });
    }
};