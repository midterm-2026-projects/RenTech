import bcrypt from 'bcryptjs';
import { getSupabase } from '../config/supabaseClient.js';

const mockUsers = [
    { username: 'admin', password: 'admin', role: 'Admin' },
    { username: 'staff', password: 'staff', role: 'Staff' },
    { username: 'customer', password: 'customer', role: 'Customer' },
];

const validRoles = ['Admin', 'Staff', 'Customer'];

export const registerUser = async (email, password, username) => {
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username: username } }
    });
    if (error) throw error;
    return data;
};

export const loginUser = async (email, password) => {
    const supabase = getSupabase();
    if (!supabase) throw new Error("Supabase not initialized");
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    if (error) throw error;
    return data.session;
};

export const authenticateUser = async (username, password) => {
    const mock = mockUsers.find((u) => u.username === username);
    if (mock) {
        if (mock.password !== password) return null;
        return { username: mock.username, role: mock.role };
    }
    const supabase = getSupabase();
    if (supabase) {
        const { data, error } = await supabase
            .from('local_users')
            .select('username, password_hash, role')
            .eq('username', username)
            .maybeSingle();
        if (!error && data) {
            const match = await bcrypt.compare(password, data.password_hash);
            if (!match) return null;
            return { username: data.username, role: data.role };
        }
    }
    return null;
};

export const registerNewCustomer = async (username, password) => {
    const mock = mockUsers.find((u) => u.username === username);
    if (mock) return null;

    const supabase = getSupabase();
    if (!supabase) {
        throw new Error('Database not configured');
    }

    const { data: existing } = await supabase
        .from('local_users')
        .select('username')
        .eq('username', username)
        .maybeSingle();
    if (existing) return null;

    const password_hash = await bcrypt.hash(password, 10);
    const { error } = await supabase
        .from('local_users')
        .insert({ username, password_hash, role: 'Customer' });
    if (error) throw new Error(error.message);

    return { username, role: 'Customer' };
};

export const verifyRolePermission = (role, allowedRoles) => {
    return allowedRoles.includes(role);
};

export const assignUserRole = async (username, role, assignedByRole) => {
    if (assignedByRole !== 'Admin') {
        throw new Error('Unauthorized: Only Admins can assign roles');
    }

    if (!validRoles.includes(role)) {
        throw new Error('Invalid role specified');
    }

    const mock = mockUsers.find((u) => u.username === username);
    if (mock) {
        mock.role = role;
        return { username: mock.username, role: mock.role };
    }

    const supabase = getSupabase();
    if (supabase) {
        const { error } = await supabase
            .from('local_users')
            .update({ role })
            .eq('username', username);
        if (!error) {
            return { username, role };
        }
    }

    return null;
};
