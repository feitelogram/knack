const users = [];

// addUser

const addUser = ({id, username, room}) => {
  // clean data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // validate data
  if (!username || !room) {
    return {
      error: 'Username and room are required.',
    };
  }

  // check for exisiting user
  const found = users.find((user) => {
    return (user.room === room) && (user.username === username);
  });

  // validate username
  if (found) return {error: 'Username already in use.'};

  // store user
  const user = {id, username, room};
  users.push(user);
  return {user};
};

// removeUser

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

// getUser

const getUser = (id) => {
  const found = users.find((user) => user.id === id);
  if (found) return found;
};

// getUsersInRoom

const getUsersInRoom = (room) => {
  return users.filter((user) => user.room === room);
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
