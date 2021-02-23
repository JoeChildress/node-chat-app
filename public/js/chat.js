const socket = io();
const form = document.querySelector('form');
const chatfield = form.querySelector('#chatfield');
const sendBtn = form.querySelector('#btn');
const locationBtn = document.querySelector('#send-location');
const messages = document.querySelector('#messages');
const sidebar = document.querySelector('#sidebar');
//const { createMessage, createLocationMessage }= require('../../src/utils/messages');

//templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemaplate = document.querySelector('#sidebar-template').innerHTML;

//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    const newMessage = messages.lastElementChild;
    const newMessageStyles = getComputedStyle(newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin;

    //visible height
    const visibleHeight = messages.offsetHeight;

    //height of messages container
    const containerHeight = messages.scrollHeight;

    //scroll distance
    const scrollOffset = messages.scrollTop + visibleHeight;

    if (containerHeight - newMessageHeight <= scrollOffset) {
        messages.scrollTop = messages.scrollHeight;
    }
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    sendBtn.setAttribute('disabled','disabled');
    const text = e.target.elements.chatfield.value;

    socket.emit('sendMessage', text, (error) => {
        sendBtn.removeAttribute('disabled');
        chatfield.value = '';
        chatfield.focus();

        if (error) {
            return console.log(error);
        }
        
        console.log('Message delivered.');
        
    });
})

locationBtn.addEventListener('click', () => {
    if(!navigator.geolocation) {
        return alert('Geolocation is not supported.')
    }

    locationBtn.setAttribute('disabled','disabled');

    navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        socket.emit('sendLocation', {lat: lat, lon: lon}, () => {
            console.log('Location shared');
            locationBtn.removeAttribute('disabled');
        });
    });
});

socket.on('sendMessage', (message) => {
    const html = Mustache.render(messageTemplate, {
        createdAt: moment(message.createdAt).format('h:mm a'), 
        message: message.text,
        username: message.username
    });
    messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

socket.on('locationMessage', (data) => {
    const html = Mustache.render(locationTemplate, {
        location: data.location,
        createdAt: moment(data.createdAt).format('h:mm a'),
        username: data.username
    });
    messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

socket.on('userData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemaplate, {
        room,
        users
    });
    sidebar.innerHTML = html;
    
});

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error);

        location.href= '/';
    }
});