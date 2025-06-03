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
    const userid = document.querySelector('#userid').value;

    let msgbox = document.createElement("div");
    let chatarea = document.querySelector('.chat-area');

    //if chatting then append in the message
    if (currentChattingUserId && !groupChatId) {
        const parentElement = document.querySelector(`[data-userid="${fromUserId}"]`)?.parentElement;
        if (parentElement.querySelector('.last-msg')) {
            parentElement.querySelector('.last-msg').innerText = message;
        }
        msgbox.classList.add("message", "friend-msg");
        msgbox.innerText = message;
        chatarea.appendChild(msgbox);
        chatarea.scrollTo({ top: chatarea.scrollHeight, behavior: 'smooth' });
    } else if (currentGroupChatId && fromUserId !== userid) {
        const parentElement = document.querySelector(`[data-groupchatid="${groupChatId}"]`)?.parentElement;
        if (parentElement.querySelector('.last-msg')) {
            parentElement.querySelector('.last-msg').innerText = message;
        }
        let senderNameDiv = document.createElement("div");
        senderNameDiv.classList.add("sendername");
        senderNameDiv.innerText = name;
        let msgTextDiv = document.createElement("div");
        msgTextDiv.innerText = message;
        msgbox.append(senderNameDiv, msgTextDiv);
        msgbox.classList.add("message", "friend-msg");
        chatarea.appendChild(msgbox);
        chatarea.scrollTo({ top: chatarea.scrollHeight, behavior: 'smooth' });
    }

    //move the chat block at top
    if (fromUserId && !groupChatId) {
        prependDivToTop({ id: fromUserId, isGroup: false, message });
    } else if (groupChatId) {
        prependDivToTop({ id: groupChatId, isGroup: true, message });
    }

    //add in chat section if it is not there previously
    // if (!currentChattingUserId && !groupChatId) {
    //     let chatdiv = ` <div class="p-chat">
    //      <div class="pic"><img src="${}" alt=""></div>
    //      <input type="hidden" data-userid=<%=prevuser._id.toString() %>
    //      id="chat-userid" value=<%=prevuser._id.toString() %>>
    //          <div class="info">
    //              <div class="name">

    //              </div>
    //              <div class="last-msg">

    //              </div> <!-- Access the text of the current message -->
    //          </div>
    //          <div class="offline"></div>
    //  </div>`
    // }

});

// Event Delegation for send button click & Enter key
document.body.addEventListener('click', (event) => {
    event.stopPropagation();
    if (event.target.matches('#send-btn')) {
        msgSendCB();
    }

    if (event.target.closest('.p-chat')) {
        const p_chat = event.target.closest('.p-chat');
        if (p_chat.querySelector('.chat-userid')) {
            startChat(p_chat);
        } else if (p_chat.querySelector('.groupChatId')) {
            startGroupChat(p_chat);
        }
    }

    if (event.target !== createNewChatBtn && !createNewChatForm.contains(event.target) && window.getComputedStyle(createNewChatForm).display === "flex") {
        createNewChatForm.style.display = "none";
    }

    if (event.target === document.querySelector('#users-in-create-chat') || event.target.closest('.user-in-create-chat')) {
        const toChat = event.target.closest('.user-in-create-chat');
        document.querySelector('.create-new-chat').style.display = "none";
        startChat(toChat);
    }

    if (event.target.matches('#send-btn')) {
        msgSendCB(event);
    }

    if (event.target.closest('#create-a-group')) {
        createAGroupButtonCB(event);
    }

    if (event.target.closest('#create-chat-button') || event.target.matches('#create-chat-button')) {
        document.querySelector('.create-new-chat').style.display = "flex";
        createNewChatBtnCB();
    }
    if (event.target.closest('.grp-action-buttons')?.children[0]) {
        NextBtnToFillInfoCB(event);
    }

    if (event.target.closest('.grp-action-buttons')?.children[1]) {
        cancel(event);
    }

    if (event.target.closest('.create-group-buttons')?.children[0]) {
        createGroupBtnCB(event)
    }

    if (event.target.closest('.video-call')) {
         makeVideoCall("calling");
    }

});

document.body.addEventListener('keydown', (event) => {
    event.stopPropagation();
    if (event.target.matches('#message') && event.key === 'Enter') {
        event.preventDefault();
        msgSendCB();
    }

    if (event.key === 'Enter' && event.target.matches('#search-users')) {
        searchBtnCB(event);
    }

});

async function startChat(p_chat) {
    document.querySelector('.chat')?.remove();

    let userChat = {};
    userChat.toUserId = p_chat.querySelector('.chat-userid').dataset.userid;
    userChat.status = onlineUsers.get(userChat.toUserId) || "offline";
    userChat.pic = p_chat.querySelector('.pic').innerHTML;
    userChat.name = p_chat.querySelector('.name').textContent;

    createChatUi({ userChat });

    socket.emit('join', { toUserId: userChat.toUserId });

    let chat = await fetch(`/chat/${userChat.toUserId}`);
    chat = await chat.json();
    const chatarea = document.querySelector('.chat-area');

    if (chat.messages.length > 0) appendMessages(chat, chatarea);

}

async function startGroupChat(p_chat) {
    document.querySelector('.chat')?.remove();
    let groupChat = {};
    groupChat.chatId = p_chat.querySelector('.groupChatId').dataset.groupchatid;
    groupChat.pic = p_chat.querySelector('.pic').innerHTML;
    groupChat.name = p_chat.querySelector('.name').textContent;

    createChatUi({ groupChat });

    socket.emit('join', { groupChatId: groupChat.chatId });
    let chat = await fetch(`/groupChat/${groupChat.chatId}`);
    chat = await chat.json();
    const chatarea = document.querySelector('.chat-area');
    if (chat.messages.length > 0) {
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
        prependDivToTop({ id: toUserId, isGroup: false, message })
    } else {
        const groupChatId = document.querySelector('#currentgroupchatid')?.value;
        if (groupChatId) socket.emit('sendMessage', { groupChatId, message });
    }
}

function prependDivToTop({ id, isGroup, message }) {
    const p_chats = document.querySelector('.p-chats');
    const chatBlock = document.querySelector(`[data-${isGroup ? "groupchatid" : "userid"}="${id}"]`)?.parentElement;
    if (chatBlock) {
        chatBlock.querySelector('.last-msg').innerText = message;
        p_chats.prepend(chatBlock);
    } else {
        //written to be later
    }

}

// Append messages
function appendMessages(chat, chatarea, isGroup) {
    const userid = document.getElementById('userid').value;
    chat.messages.forEach(message => {
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
                    <button class="audio-call" ><img src="/icons/telephone.png" alt="audio-call"></button>
                    <button class="video-call" ><img src="/icons/video.png" alt="video-call"></button>
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
    maindiv.innerHTML += ui;
}

function appendP_chats({ fromUserId, groupChatId, name, message, image }) {
    const p_chats = document.querySelector('.p-chats');

    let p_chat;
    if (fromUserId && !groupChatId) {
        p_chat = `<div class="p-chat">
        <div class="pic"><img src="${image}" alt=""></div>
        <input type="hidden" data-userid=${fromUserId}
        class"chat-userid" value=${fromUserId}>
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
    } else {
        p_chat = `<div class="p-chat">
        <div class="pic"><img src="${image}" alt=""></div>
        <input type="hidden" data-groupChatId=${groupChatId}
        class="groupChatId" value=${groupChatId}>
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

    p_chats.insertAdjacentHTML('afterbegin', p_chat);

}

let peer;
let localStream;
let remoteStream;
let localVideo = document.getElementById('localVideo');
let remoteVideo = document.getElementById('remoteVideo');

const config = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' } // Free STUN server
    ]
};

let callStatus;
let content;

async function makeVideoCall(status){
     content = document.querySelector('.content');
     callStatus=`<div id="call-status">
                <p>${status}</p>
                <button id="endUpCalling"> <img src="/icons/call-hangup.png"> </button>
                </div>`;
     content.insertAdjacentHTML('afterbegin',callStatus);
    const to = document.querySelector('#chatting-userid').value;
    // console.log(`caller id is ${myid}`)
    // console.log(`sending msg to ${to} and offer is ${JSON.stringify(offer)}`);
    setTimeout(() => {
        document.getElementById('endUpCalling').addEventListener('click',()=>{
            document.querySelector('#call-status').remove();
            socket.emit('end-up-calling',to)
        })
    }, 400);
    socket.emit('call-user', to);
}


function handleIncomingCall(info){
    const content=document.querySelector('.content');
    const incomingCallDiv =`   <div id="incoming-call">
    <div id="caller-info">incoming-call from ${info.name}</div>
    <div id="reject-receive-buttons">
        <button id="accept-call"><img src="/icons/call-accept.png" alt=""></button>
        <button id="reject-call"><img src="/icons/call-hangup.png" alt=""></button>
    </div>
    </div>`;
    content.insertAdjacentHTML('afterbegin', incomingCallDiv);
    const acceptbtn=document.getElementById('accept-call');
    const rejectbtn = document.getElementById('reject-call');

    acceptbtn.addEventListener('click',(event)=>{
        event.preventDefault();
        acceptCallCB({info,event})
    });
    rejectbtn.addEventListener('click',(event)=>{
        event.preventDefault();
        rejectCallCB({info,event});
    });
}

function displayVideoDiv(otherUserOnCall){
    const maindiv = document.querySelector('.main');
    const callBlock =`
<div class="call-block">  
    <input type="hidden" id="otherUserOnCall" value=${otherUserOnCall}>
    <video src="" id="localVideo" autoplay playsinline  muted></video>
    <video src="" id="remoteVideo" autoplay playsinline ></video>
    <button id='end-call-btn'  ><img src="/icons/call-hangup.png" alt="" style="width: 40px; height: 40px;"></button>
    </div>`;
    maindiv.insertAdjacentHTML('beforeend',callBlock); 
    setTimeout(() => {
        document.querySelector('#end-call-btn')?.addEventListener('click', endCall);      
    }, 1000);

};

function endCall(){
    const otherUserOnCall=document.getElementById('otherUserOnCall').value;
    document.querySelector('.call-block').remove();
  
     localStream.getTracks().forEach(track => track.stop());
     localStream=null;
     peer.close();
     socket.emit('end-call',otherUserOnCall);
}

async function acceptCallCB(data){
     const {info,event} = data;
     document.querySelector('#incoming-call').remove();
     displayVideoDiv(info.from);
     localStream = await navigator.mediaDevices.getUserMedia({audio:true,video:true});
     localVideo=document.querySelector('#localVideo');
     localVideo.srcObject=localStream;
    socket.emit('accept-call',{to:info.from});
    drag( localVideo );
}

function rejectCallCB(data){
//handle reject call
const {info,event} =data;
document.querySelector('#incoming-call').remove();
socket.emit('reject-call',{to:info.from});
}


function createPeerConnection(to) {
    peer = new RTCPeerConnection(config);
    peer.onicecandidate = (e) => {
        if (e.candidate)
            socket.emit('ice-candidate', { candidate: e.candidate, to });
    }
    peer.ontrack = (ev) => {
        remoteVideo = document.querySelector('#remoteVideo');
      
        if (remoteVideo) {
            remoteVideo.srcObject = ev.streams[0];
            remoteVideo.onloadedmetadata = () => {
                remoteVideo.play().catch(err => {
                  console.error("play() failed:", err);
                });
              };                        
        } else {
            console.log("no remoteVideo player");
        }

    }

    // let makingOffer = false;

    // peer.onnegotiationneeded = async () => {
    //   try {
    //     if (makingOffer) return;
    //     makingOffer = true;
    
    //     const offer = await peer.createOffer();
    //     await peer.setLocalDescription(offer);
    
    //     socket.emit("call-user", { offer, to });
    //   } catch (err) {
    //     console.error("onnegotiationneeded error:", err);
    //   } finally {
    //     makingOffer = false;
    //   }
    // };
    
}

socket.on('callee-offline',()=>{
        callStatus=document.getElementById('call-status')
        callStatus.innerText="callee is offline";
        setTimeout(()=>callStatus.remove(),1000);
   
})
socket.on('callee-rejected-call',()=>{
    const callStatus=document.getElementById('call-status')
    callStatus.innerText="Callee rejected call";
    setTimeout(()=>callStatus.remove(),1000);
})

socket.on('incoming-call', async (data) => {
    handleIncomingCall(data);
})

socket.on('call-accepted', async (data) => {
    const {from } = data
    callStatus=document.getElementById('call-status')
    callStatus.remove();
    createPeerConnection(from);

    localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    localStream.getTracks().forEach(track => {
        peer.addTrack(track, localStream);
    })

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    displayVideoDiv(from);
    localVideo = document.querySelector('#localVideo');
    localVideo.srcObject=localStream;
    socket.emit('offer',{to:from,offer});
    drag(localVideo);
})

socket.on('offer',async data=>{
    const {from,offer}=data;
    if(!peer){
        createPeerConnection(from);
       await peer.setRemoteDescription(offer);
        localStream.getTracks().forEach(track=>{
            peer.addTrack(track,localStream);
        })
    }
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    socket.emit('answer',{answer,to:from});
})

socket.on('answer',async data=>{
    const {from , answer} =data;
    peer.setRemoteDescription(answer);
})

socket.on('end-call',()=>{
    localStream.getTracks().forEach(track => track.stop());
    content = document.querySelector('.content');
    callStatus=`<div id="call-status">Call ended</div>`;
    document.querySelector('.call-block').remove();
    content.insertAdjacentHTML('afterbegin',callStatus);
    callStatus=document.getElementById('call-status');
    localStream=null;
    peer.close();
    setTimeout(() => {
        callStatus.remove();
    }, 1000);
})

socket.on('end-up-calling',()=>{
    document.querySelector('#incoming-call').remove();
})

socket.on('ice-candidate', async candidate => {
    if (candidate) {
        try {
            await peer.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
            console.error('Error adding received ICE candidate', error);
        }
    }
})