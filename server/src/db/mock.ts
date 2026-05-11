type User = {
  id: number;
  username: string;
  password: string;
};

let users: User[] = [];
let id = 1;

export const mockDb = {
  insertUser: (username: string, password: string) => {
    const user = { id: id++, username, password };
    users.push(user);
    return user;
  },

  findUserByUsername: (username: string) => {
    return users.find(u => u.username === username);
  },

  getUsers: () => users,
};