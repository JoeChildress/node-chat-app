const createMessage = (username,text) => {
    return {
        text,
        createdAt: new Date().getTime(),
        username
    }
}

const createLocationMessage = (username,url) => {
    return {
        url,
        createdAt: new Date().getTime(),
        username
    }
}

module.exports = {
    createMessage,
    createLocationMessage
}