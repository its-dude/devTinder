let p_chats = document.querySelector('.p-chats');
let messagediv = document.querySelector('#message');
const onlineUsers = new Map();
const socket = io("http://localhost:3000", {});

// Online status
socket.on("online", ({ userId }) => {
    const parentDiv = document.querySelector(`[data-userid="${userId}"]`)?.closest('.p-chat');
    if (parentDiv) {
        const statusDiv = parentDiv.children[3];
        statusDiv.className = "online";
    }
    onlineUsers.set(userId, "online");
    const chatOpened = document.querySelector(`[data-useridinchat="${userId}"]`);
    if (chatOpened) chatOpened.innerText = "online";
});

// Offline status
socket.on("offline", ({ userId }) => {
    const parentDiv = document.querySelector(`[data-userid="${userId}"]`)?.closest('.p-chat');
    if (parentDiv) {
        const statusDiv = parentDiv.children[3];
        statusDiv.className = "offline";
    }
    onlineUsers.delete(userId);
    const chatOpened = document.querySelector(`[data-useridinchat="${userId}"]`);
    if (chatOpened) chatOpened.innerText = "offline";
});

// Handle message received
socket.on('messageReceived', ({ fromUserId, groupChatId, name, message }) => {
    const currentChattingUserId = document.querySelector(`[data-useridinchat="${fromUserId}"]`);
    const currentGroupChatId = document.querySelector(`[data-chattinggroupid="${groupChatId}"]`);
    let msgbox = document.createElement("div");
    let chatarea = document.querySelector('.chat-area');      
    
    if (currentChattingUserId && !currentGroupChatId) {
        const parentElement = document.querySelector(`[data-userid="${fromUserId}"]`).parentElement;
        if(parentElement.querySelector('.last-msg')){
            parentElement.querySelector('.last-msg').innerText=message;
        }
        msgbox.classList.add("message", "friend-msg");
        msgbox.innerText = message;
        chatarea.appendChild(msgbox);
        chatarea.scrollTo({ top: chatarea.scrollHeight, behavior: 'smooth' });
    } else if (currentGroupChatId) {
        const parentElement = document.querySelector(`[data-userid="${fromUserId}"]`).parentElement;
        if(parentElement.querySelector('.last-msg')){
            parentElement.querySelector('.last-msg').innerText=message;
        }       
        let senderNameDiv = document.createElement("div");
        senderNameDiv.classList.add("sendername");
        senderNameDiv.innerText = name;
        let msgTextDiv = document.createElement("div");
        msgTextDiv.innerText = message.text;
        msgbox.append(senderNameDiv, msgTextDiv);
        chatarea.appendChild(msgbox);
        chatarea.scrollTo({ top: chatarea.scrollHeight, behavior: 'smooth' });
    }
});

// 💡 Event Delegation for send button click & Enter key
document.body.addEventListener('click', (event) => {
    event.stopPropagation();
    if (event.target.matches('#send-btn')) {
        msgSendCB();
    }

    if(event.target.closest('.p-chat')){
        const p_chat = event.target.closest('.p-chat');
        if(p_chat.querySelector('#chat-userid')){
            startChat(p_chat);
        }else if(p_chat.querySelector('#groupChatId')){
            startGroupChat(p_chat);
        }
    }

    if (event.target !== createNewChatBtn && !createNewChatForm.contains(event.target) && window.getComputedStyle(createNewChatForm).display === "flex") {
        createNewChatForm.style.display = "none";
    }

    if (event.target === document.querySelector('#users-in-create-chat') || event.target.closest('.user-in-create-chat')) {
        const toChat = event.target.closest('.user-in-create-chat');
        document.querySelector('.create-new-chat').style.display="none";
        startChat(toChat);
    }

    if(event.target.matches('#send-btn')){
        msgSendCB(event);
    }
    
    if(event.target.closest('#create-a-group')){
        createAGroupButtonCB(event)
    }

    if(event.target.closest('#create-chat-button') ||event.target.matches('#create-chat-button')){
        document.querySelector('.create-new-chat').style.display="flex";
        createNewChatBtnCB();
    }
    if(event.target.closest('.grp-action-buttons')?.children[0]){
        NextBtnToFillInfoCB(event)
    }

    if(event.target.closest('.grp-action-buttons')?.children[1]){
        cancel(event);
    }

    if(event.target.closest('.create-group-buttons')?.children[0]){
        createGroupBtnCB(event)
    }


});

document.body.addEventListener('keydown', (event) => {
    event.stopPropagation();
    if (event.target.matches('#message') && event.key === 'Enter') {
        event.preventDefault();
        msgSendCB();
    }

    if( event.key==='Enter' && event.target.matches('#search-users')){
        searchBtnCB(event);
    }

});

async function startChat(p_chat) {
    document.querySelector('.chat')?.remove();

    let userChat = {};
    userChat.toUserId = p_chat.querySelector('#chat-userid').dataset.userid;
    userChat.status = onlineUsers.get(userChat.toUserId) || "offline";
    userChat.pic = p_chat.querySelector('.pic').innerHTML;
    userChat.name = p_chat.querySelector('.name').textContent;

    createChatUi({ userChat });

    socket.emit('join', { toUserId: userChat.toUserId });

    let chat = await fetch(`/chat/${userChat.toUserId}`);
    chat = await chat.json();

    const chatarea = document.querySelector('.chat-area');
    if (chat.length > 0) {
        appendMessages(chat, chatarea);
    }
}

async function startGroupChat(p_chat) {
    document.querySelector('.chat')?.remove();
    let groupChat = {};
    groupChat.chatId = p_chat.querySelector('#groupChatId').dataset.groupchatid;
    groupChat.pic = p_chat.querySelector('.pic').innerHTML;
    groupChat.name = p_chat.querySelector('.name').textContent;

    createChatUi({ groupChat });

    socket.emit('join', { groupChatId: groupChat.chatId });

    let chat = await fetch(`/groupChat/${groupChat.chatId}`);
    chat = await chat.json();

    const chatarea = document.querySelector('.chat-area');
    if (chat.length > 0) {
        appendMessages(chat, chatarea, true);
    }
}
// Message Send
function msgSendCB() {
    const messageInput = document.querySelector('#message');
    const message = messageInput?.value;
    if (!message) return;

    messageInput.value = "";

    const chatarea = document.querySelector('.chat-area');
    let msgbox = document.createElement("div");
    msgbox.classList.add("message", "user-msg");
    msgbox.innerText = message;
    chatarea.appendChild(msgbox);
    chatarea.scrollTo({ top: chatarea.scrollHeight, behavior: 'smooth' });

    const toUserId = document.querySelector('#chatting-userid')?.value;
    if (toUserId) {
        socket.emit('sendMessage', { toUserId, message });
    } else {
        const groupChatId = document.querySelector('#currentgroupchatid')?.value;
        if(groupChatId)socket.emit('sendMessage', { groupChatId, message });
    }
}

// Append messages
function appendMessages(chat, chatarea, isGroup) {
    const userid = document.getElementById('userid').value;
    chat[0].messages.forEach(message => {
        let msgbox = document.createElement("div");
        msgbox.classList.add("message");

        if (message.senderId._id === userid) {
            msgbox.classList.add("user-msg");
            msgbox.innerText = message.text;
        } else {
            msgbox.classList.add("friend-msg");

            if (isGroup) {
                let senderNameDiv = document.createElement("div");
                senderNameDiv.classList.add("sendername");
                senderNameDiv.innerText = `${message.senderId.firstName} ${message.senderId.lastName}`;

                let msgTextDiv = document.createElement("div");
                msgTextDiv.innerText = message.text;

                msgbox.append(senderNameDiv, msgTextDiv);
            } else {
                msgbox.innerText = message.text;
            }
        }

        chatarea.appendChild(msgbox);
    });

    chatarea.scrollTo({ top: chatarea.scrollHeight });
}

// Create Chat UI
function createChatUi({ userChat, groupChat }) {
    let ui;
    if (userChat) {
        ui = `
        <div class="chat">
            <div class="chat-header">
                <div class="chat-user">
                    <div class="pic">${userChat.pic}</div>
                    <div class="info-wrapper">
                        <div class="name">${userChat.name}</div>
                        <div class="active-status" data-useridinchat="${userChat.toUserId}">${userChat.status}</div>
                    </div>
                </div>
                <div class="call">
                    <button class="audio-call"><img src="/icons/telephone.png" alt="audio-call"></button>
                    <button class="video-call"><img src="/icons/video.png" alt="video-call"></button>
                </div>
            </div>
            <div class="chat-area"><div class="spacer"></div></div>
            <div class="send-msg">
                <input type="hidden" id="chatting-userid" value="${userChat.toUserId}">
                <input type="text" name="msg" placeholder="Type a message" id="message">
                <button id="send-btn">send</button>
            </div>
        </div>`;
    } else if (groupChat) {
        ui = `
        <div class="chat">
            <div class="chat-header">
                <div class="chat-user">
                    <div class="pic">${groupChat.pic}</div>
                    <div class="info-wrapper"><div class="name">${groupChat.name}</div></div>
                </div>
                <div class="call">
                    <button class="audio-call"><img src="/icons/telephone.png" alt="audio-call"></button>
                    <button class="video-call"><img src="/icons/video.png" alt="video-call"></button>
                </div>
            </div>
            <div class="chat-area"><div class="spacer"></div></div>
            <div class="send-msg">
                <input type="hidden" id="currentgroupchatid"  data-chattinggroupid="${groupChat.chatId}" value="${groupChat.chatId}">
                <input type="text" name="msg" placeholder="Type a message" id="message">
                <button id="send-btn">send</button>
            </div>
        </div>`;
    }

    let maindiv = document.querySelector('.main');
    maindiv.innerHTML +=ui;
}

function appendP_chats({fromUserId,groupChatId,name,message,image}){
    const p_chats =document.querySelector('.p-chats');

    let p_chat;
    if(fromUserId && !groupChatId){
        p_chat=`<div class="p-chat">
        <div class="pic"><img src="${image}" alt=""></div>
        <input type="hidden" data-userid=${fromUserId}
        id="chat-userid" value=${fromUserId}>
            <div class="info">
                <div class="name">
                    ${name}
                </div>
                <div class="last-msg">
                    ${message}
                </div> <!-- Access the text of the current message -->
            </div>
            <div class="online"></div>
    </div>`
    }else{
        p_chat=`<div class="p-chat">
        <div class="pic"><img src="${image}" alt=""></div>
        <input type="hidden" data-groupChatId=${groupChatId}
        id="groupChatId" value=${groupChatId}>
            <div class="info">
                <div class="name">
                    ${name}
                </div>
                <div class="last-msg">
                    ${message}
                </div> <!-- Access the text of the current message -->
            </div>
            <div class="online"></div>
    </div>`
    }

    p_chats.insertAdjacentHTML('afterbegin',p_chat);

}

