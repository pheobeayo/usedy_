import { useState, useEffect } from 'react';
import Gun from 'gun';
import { useAppKitAccount } from '@reown/appkit/react';

const GunChat = () => {
  const { address, isConnected } = useAppKitAccount();
  const [gun, setGun] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [roomId, setRoomId] = useState('general');

  useEffect(() => {
    const gunInstance = Gun(['https://gun-manhattan.herokuapp.com/gun']);
    setGun(gunInstance);

    // Listen for messages
    const messagesRef = gunInstance.get('chat').get(roomId);
    messagesRef.map().on((message, key) => {
      if (message) {
        setMessages(prev => {
          const exists = prev.find(m => m.id === key);
          if (!exists) {
            return [...prev, { ...message, id: key }].sort((a, b) => a.timestamp - b.timestamp);
          }
          return prev;
        });
      }
    });

    return () => {
      if (gunInstance) {
        gunInstance.off();
      }
    };
  }, [roomId]);

  const sendMessage = () => {
    if (!gun || !newMessage.trim() || !isConnected) return;

    const message = {
      text: newMessage,
      sender: address,
      timestamp: Date.now(),
      senderShort: `${address.slice(0, 6)}...${address.slice(-4)}`
    };

    gun.get('chat').get(roomId).set(message);
    setNewMessage('');
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <p className="text-lg mb-4">Connect your wallet to join the chat</p>
          <div className="text-sm text-gray-400">
            Use the connect button to start chatting
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header */}
      <div className="flex justify-between items-center p-4 bg-[#154A80] text-white">
        <h3 className="font-bold">Room: {roomId}</h3>
        <div className="room-selector">
          <select 
            value={roomId} 
            onChange={(e) => setRoomId(e.target.value)}
            className="px-3 py-1 rounded bg-white text-[#154A80] text-sm font-medium border-none outline-none"
          >
            <option value="general market place">Market Place</option>
            <option value="Seller chat room">Seller Chat Room</option>
            <option value="Token claims">Token Claims</option>
          </select>
        </div>
      </div>
      
      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id}
              className={`mb-4 max-w-xs lg:max-w-md ${
                message.sender === address 
                  ? 'ml-auto' 
                  : 'mr-auto'
              }`}
            >
              <div className={`p-3 rounded-lg ${
                message.sender === address 
                  ? 'bg-[#154A80] text-white' 
                  : 'bg-white border border-gray-200'
              }`}>
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-xs font-medium ${
                    message.sender === address ? 'text-blue-100' : 'text-gray-600'
                  }`}>
                    {message.senderShort}
                  </span>
                  <span className={`text-xs ${
                    message.sender === address ? 'text-blue-100' : 'text-gray-400'
                  }`}>
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="text-sm leading-relaxed">{message.text}</div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Message Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full outline-none focus:border-[#154A80] focus:ring-2 focus:ring-[#154A80] focus:ring-opacity-20"
          />
          <button 
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="px-6 py-2 bg-[#154A80] text-white rounded-full hover:bg-[#123d6b] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

const Chat = () => {
  const { address, isConnected } = useAppKitAccount();
  const [selectedRoom, setSelectedRoom] = useState('general');

  const rooms = [
    { id: 'general market place', name: 'General Market Place', description: 'Open discussion for everyone' },
    { id: 'Seller chat room', name: 'Seller chat room', description: 'Discussions between Sellers and Buyers' },
    { id: 'Token claims', name: 'Token claims', description: 'Token Claims discussions' }
  ];

  return (
    <main className="bg-white mt-10">
      <div className="grid max-sm:grid-cols-1 gap-2 gap-y-4 sm:grid-cols-1 md:grid-cols-2">
        {/* Left Sidebar */}
        <div className="bg-[#EDF5FE] h-[100vh] overflow-y-auto">
          <div className="p-10">
            <h1 className="text-[#154A80] font-bold font-serif text-2xl mb-6">
              Your Messages
            </h1>
            
            {/* Connection Status */}
            <div className="mb-6 p-4 bg-white rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Connection Status</p>
                  <p className={`font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </p>
                </div>
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              </div>
              {isConnected && (
                <p className="text-xs text-gray-500 mt-2">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </p>
              )}
            </div>

            {/* Room List */}
            <div className="space-y-3">
              <h2 className="text-[#154A80] font-semibold text-lg">Chat Rooms</h2>
              {rooms.map((room) => (
                <div
                  key={room.id}
                  onClick={() => setSelectedRoom(room.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedRoom === room.id
                      ? 'bg-[#154A80] text-white'
                      : 'bg-white hover:bg-blue-50 border border-blue-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{room.name}</h3>
                      <p className={`text-xs ${
                        selectedRoom === room.id ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {room.description}
                      </p>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${
                      selectedRoom === room.id ? 'bg-white' : 'bg-green-500'
                    }`}></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="mt-8 p-4 bg-white rounded-lg border border-blue-200">
              <h3 className="text-[#154A80] font-semibold text-sm mb-2">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full text-left text-sm text-gray-600 hover:text-[#154A80] transition-colors">
                  📝 Create New Room
                </button>
                <button className="w-full text-left text-sm text-gray-600 hover:text-[#154A80] transition-colors">
                  🔍 Search Messages
                </button>
                <button className="w-full text-left text-sm text-gray-600 hover:text-[#154A80] transition-colors">
                  ⚙️ Settings
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Chat Area */}
        <div className="bg-white h-[100vh] border-l border-gray-200">
          <GunChat />
        </div>
      </div>
    </main>
  );
};

export default Chat;