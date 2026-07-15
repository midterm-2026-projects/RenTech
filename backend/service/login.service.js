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
        options: { data: { username: username } } // Ensure this matches trigger expectation
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
    const user = mockUsers.find(
        (item) => item.username === username && item.password === password,
    );

    if (!user) return null;

    return {
        username: user.username,
        role: user.role,
    };
};

export const registerNewCustomer = async (username, password) => {
    const existingUser = mockUsers.find((item) => item.username === username);

    if (existingUser) return null;

    const newUser = {
        username,
        password,
        role: 'Customer',
    };

    mockUsers.push(newUser);

    return {
        username: newUser.username,
        role: newUser.role,
    };
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

    const user = mockUsers.find((item) => item.username === username);

    if (!user) return null;

    user.role = role;

    return {
        username: user.username,
        role: user.role,
    };
};
