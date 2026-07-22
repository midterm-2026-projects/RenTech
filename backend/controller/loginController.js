import * as loginService from '../service/login.service.js';

const validatePassword = (password) => {
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(password)) return 'Password must include at least one uppercase letter';
    if (!/[a-z]/.test(password)) return 'Password must include at least one lowercase letter';
    if (!/[0-9]/.test(password)) return 'Password must include at least one number';
    if (!/[!@#$%^&*]/.test(password)) return 'Password must include at least one special character (!@#$%^&*)';
    return null;
};

export const register = async (req, res) => {
    try {
        const { email, password, username } = req.body;
        if (!password) {
            return res.status(400).json({ success: false, message: 'Password is required' });
        }
        const pwError = validatePassword(password);
        if (pwError) {
            return res.status(400).json({ success: false, message: pwError });
        }
        const result = await loginService.registerUser(email, password, username);
        res.status(201).json({ success: true, data: result });
    } catch (error) {
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

export const signup = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username and password are required' });
        }
        const pwError = validatePassword(password);
        if (pwError) {
            return res.status(400).json({ success: false, message: pwError });
        }
        const result = await loginService.registerNewCustomer(username, password);
        if (!result) {
            return res.status(400).json({ success: false, message: 'Username already exists' });
        }
        res.status(201).json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const signin = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username and password are required' });
        }
        const user = await loginService.authenticateUser(username, password);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(401).json({ success: false, message: error.message });
    }
};