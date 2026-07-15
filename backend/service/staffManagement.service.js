let staffMembers = [
  { username: "admin", password: "admin123", role: "Admin" },
  { username: "staff1", password: "staff123", role: "Staff" },
  { username: "staff2", password: "staff456", role: "Staff" }
];

export const getStaffList = async () => {
  return staffMembers.map(member => ({
    username: member.username,
    role: member.role
  }));
};

export const addStaff = async ({ username, password }) => {
  const existingStaff = staffMembers.find(
    member => member.username.toLowerCase() === username.toLowerCase()
  );
  
  if (existingStaff) {
    throw new Error("Staff member with this username already exists.");
  }
  
  const newStaff = {
    username: username.toLowerCase(),
    password: password,
    role: "Staff"
  };
  
  staffMembers.push(newStaff);
  
  return {
    username: newStaff.username,
    role: newStaff.role,
    message: "Staff member added successfully."
  };
};

export const removeStaff = async (username) => {
  const initialLength = staffMembers.length;
  staffMembers = staffMembers.filter(
    member => member.username.toLowerCase() !== username.toLowerCase()
  );
  
  if (staffMembers.length === initialLength) {
    throw new Error("Staff member not found.");
  }
  
  return {
    success: true,
    message: `Staff member '${username}' has been removed.`,
    remainingStaff: staffMembers.length
  };
};

export const validateStaffCredentials = async (username, password) => {
  const staff = staffMembers.find(
    member => member.username.toLowerCase() === username.toLowerCase()
  );
  
  if (!staff) {
    throw new Error("Staff member not found.");
  }
  
  if (staff.password !== password) {
    throw new Error("Invalid password.");
  }
  
  return {
    username: staff.username,
    role: staff.role,
    authenticated: true
  };
};
