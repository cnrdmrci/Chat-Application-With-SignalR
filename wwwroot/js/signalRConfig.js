'use strict';

var SIGNALR_URI = '/chatManagerHub';

var loginButton = null,
    buttonSend = null,
    inputUsername = null,
    mainDivId = null,
    usersDivId = null,
    connection = null,
    loginFormId = null,
    messageArea = null,
    localUsername = null,
    usersDivOnlineStatus = null,
    textMessage = null;

function Initialize() {
    loginButton = document.getElementById('loginButton');
    buttonSend = document.getElementById('buttonSend');
    inputUsername = document.getElementById('inputUsername');
    mainDivId = document.getElementById('mainDivId');
    usersDivId = document.getElementById('usersDivId');
    loginFormId = document.getElementById('loginFormId');
    textMessage = document.getElementById('textMessage');
    messageArea = document.getElementById('messageArea');
    usersDivOnlineStatus = document.getElementById('usersDivOnlineStatus');
    InitializeEvent();
}

function InitializeEvent() {
    inputUsername.addEventListener('keypress', login);
    loginButton.addEventListener('click', connectServer);
    textMessage.addEventListener('keypress', checkSend);
    buttonSend.addEventListener('click', sendMessage);
}

function login(e) {
    if (e.key == 'Enter') {
        loginButton.click();
    }
}

function checkSend(e) {
    if (e.key == 'Enter') {
        buttonSend.click();
        e.preventDefault();
    }
}

function connectServer() {
    var isEmpty = checkValue(inputUsername.value);

    if (isEmpty) {
        alert('Please enter username');
        return;
    }

    connection = new signalR.HubConnectionBuilder()
        .withUrl(SIGNALR_URI)
        .build();

    connection.start()
        .then(function () {
            connection.invoke('SetUsername', inputUsername.value);
            InitializeSignalREvent();
            setConnected(inputUsername.value);
            textMessage.focus();
        })
        .catch(function (err) {
            setDisconnected();
        });

}

function InitializeSignalREvent() {
    connection.on('OnJoin', OnJoin);
    connection.on('OnLeft', OnLeft);
    connection.on('NewMessage', OnNewMessage);
    connection.on('InfoMessage', InfoMessage);
    connection.onclose(OnClose);
}


function addMessage(content) {
    var messageElement = document.createElement('ul');
    messageElement.textContent = content;
    messageElement.className = 'text-center';
    messageElement.classList.add('messageRowClassNewJoin');
    messageArea.insertAdjacentElement('beforeend', messageElement);
}

function setOnlineCount(count) {
    document.getElementById('usersDivId').innerHTML = '';
    var usersDivOnlineStatusElement = document.createElement('div');
    usersDivOnlineStatusElement.id = 'usersDivOnlineStatus';
    usersDivOnlineStatusElement.textContent = count + ' user online';
    usersDivId.insertAdjacentElement('afterbegin', usersDivOnlineStatusElement);
}
function addUserToUsersList(userList) {
    userList.forEach(function myFunc(item) {
        var usersListElement = document.createElement('ul');
        usersListElement.textContent = item;
        usersListElement.id = item;
        usersListElement.classList.add("userRowClass");
        usersDivId.insertAdjacentElement('beforeend', usersListElement);
    });
}

function OnJoin(date, username, count, userList) {
    addMessage(username + ' joined the chat.');
    setOnlineCount(count);
    addUserToUsersList(userList);
    messageArea.scrollTop = messageArea.scrollHeight;
}

function OnLeft(date, username, count, userList) {
    addMessage(username + ' left the chat.');
    setOnlineCount(count);
    addUserToUsersList(userList);
    messageArea.scrollTop = messageArea.scrollHeight;
}

function InfoMessage(message) {
    alert(message);
}

function OnNewMessage(date, username, message) {
    var messageDate = new Date(date);
    var messageElement = document.createElement('ul');

    if (username === localUsername)
        messageElement.classList.add("messageRowClassRight");
    else
        messageElement.classList.add("messageRowClassLeft");

    messageElement.textContent = message;
    var messageInfo = document.createElement('b');
    messageInfo.textContent = '(' + messageDate.getHours() + ':' + messageDate.getMinutes() + ') ' + username + ': ';
    messageElement.insertAdjacentElement('afterbegin', messageInfo);
    messageArea.insertAdjacentElement('beforeend', messageElement);
    messageArea.scrollTop = messageArea.scrollHeight;
}

function OnClose(err) {
    setDisconnected();
}

function setConnected(username) {
    loginFormId.classList.add('hide');
    mainDivId.classList.remove('hide');
    usersDivId.classList.remove('hide');
    localUsername = username;
    dragElement(document.getElementById("myMessagingDiv"));
}

function setDisconnected() {
    loginFormId.classList.remove('hide');
    mainDivId.classList.add('hide');
    usersDivId.classList.add('hide');
    localUsername = null;
}

function checkValue(value) {
    return value == null || value.trim() == '';
}

function sendMessage() {
    var isEmpty = checkValue(textMessage.value);

    if (isEmpty) {
        alert('Please enter message');
        return;
    }

    connection.invoke('SendMessage', textMessage.value);
    textMessage.value = '';
    textMessage.focus();
}

function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById(elmnt.id + "Header")) {
        /* if present, the header is where you move the DIV from:*/
        document.getElementById(elmnt.id + "Header").onmousedown = dragMouseDown;
    } else {
        /* otherwise, move the DIV from anywhere inside the DIV:*/
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        /* stop moving when mouse button is released:*/
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

document.addEventListener('DOMContentLoaded', Initialize);