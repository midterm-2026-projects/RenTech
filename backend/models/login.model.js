export class UserModel {
  constructor({ username, password, role }) {
    this.username = username.trim().toLowerCase();
    this.password = password;
    this.role = role || 'Customer'; 
  }
} 