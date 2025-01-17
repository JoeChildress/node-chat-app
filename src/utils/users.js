const users = [];

const addUser = ({id, username, room}) => {
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    if ( !username || !room ) {
        return { error: 'user and room are required'}
    }

    const existingUser = users.find((user) => {
        return user.room === room && user.username === username;
    });

    //validate user
    if (existingUser) {
        return {
            error: 'User already exists'
        }
    }

    const user = {
        id,
        username,
        room
    }

    users.push(user);
    return {user}
}

const removeUser = (id) => {
    const index = users.findIndex(user => user.id === id );

    if (index !== -1) {
        return users.splice(index,1)[0];
    }

}

const getUser = (id) => {
    const index = users.findIndex(user => user.id === id);

    if (index !== -1) {
        return users[index];
    }
}

const getUsersInRoom = (room) => {
    return users.filter(user => user.room === room)
}

module.exports = {
    getUser,
    addUser,
    removeUser,
    getUsersInRoom
}