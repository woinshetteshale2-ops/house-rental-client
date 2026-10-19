import React, { useState, useEffect } from 'react';
import './App.css';

function ImageSlider({ images, title }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0 || images[0] === "") {
    return (
      <div style={{ width: '100%', height: '190px', backgroundColor: '#e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '13px', fontWeight: '500' }}>
        No Image Available
      </div>
    );
  }

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '190px', marginBottom: '12px' }}>
      <img 
        src={`http://localhost:8080/house-backend/uploads/${images[currentIndex]}`} 
        alt={title} 
        style={{ width: '100%', height: '190px', objectFit: 'cover', borderRadius: '8px' }} 
      />
      {images.length > 1 && (
        <>
          <button onClick={prevImage} style={{ position: 'absolute', left: '8px', top: '42%', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>❮</button>
          <button onClick={nextImage} style={{ position: 'absolute', right: '8px', top: '42%', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>❯</button>
          <div style={{ position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '11px', padding: '2px 8px', borderRadius: '10px' }}>
            {currentIndex + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'about', 'contact'
  const [houses, setHouses] = useState([]);

const [contactEmail, setContactEmail] = useState('');
  const [contactTelegram, setContactTelegram] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortOrder, setSortOrder] = useState('default');
  const [darkMode, setDarkMode] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  
  // Auth States
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('loggedUser');
    return saved ? JSON.parse(saved) : null;
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Password hide/show toggle

  // Form Fields
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authRole, setAuthRole] = useState('landlord');
  const [adminSecretKey, setAdminSecretKey] = useState('');

  // Messages & Contact
  const [msgText, setMsgText] = useState('');
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState({});

// የተጠቃሚ መልእክት ስቴት
  const [userMessages, setUserMessages] = useState([]);

  // የተጠቃሚውን መልእክቶች ከ backend የሚያመጣ ፋንክሽን
  const fetchUserMessages = (email) => {
    if (!email) return;
    fetch(`http://localhost:8080/house-backend/get_user_messages.php?email=${email}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setUserMessages(data);
        }
      })
      .catch(err => console.error('Error fetching user messages:', err));
  };


  // Edit House
  const [editingHouse, setEditingHouse] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editBedrooms, setEditBedrooms] = useState(1);
const [selectedImage, setSelectedImage] = useState(null);
  const fetchHouses = () => {
    fetch('http://localhost:8080/house-backend/get_houses.php')
      .then(res => res.json())
      .then(data => setHouses(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error fetching houses:', err));
  };

 const fetchMessages = () => {
    if (user && user.role === 'admin') {
      fetch('http://localhost:8080/house-backend/get_messages.php')
        .then(res => res.json())
        .then(data => setMessages(Array.isArray(data) ? data : []))
        .catch(err => console.error('Error fetching messages:', err));
    }
  };

  const handleDeleteUserMessage = (id) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      fetch(`http://localhost:8080/house-backend/delete_message.php?id=${id}`, {
        method: 'GET'
      })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setUserMessages(prev => prev.filter(msg => msg.id !== id));
        } else {
          alert("Failed to delete message");
        }
      })
      .catch(err => console.error("Error deleting message:", err));
    }
  };




 useEffect(() => {
    fetchHouses();
    fetchMessages();
    if (user && user.email) {
      fetchUserMessages(user.email);
    }
  }, [user]);
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    const url = isRegisterMode 
      ? 'http://localhost:8080/house-backend/register.php'
      : 'http://localhost:8080/house-backend/login.php';

    const formData = new URLSearchParams();
    if (isRegisterMode) {
      formData.append('name', authName);
      formData.append('role', authRole);
      if (authRole === 'admin') formData.append('adminKey', adminSecretKey);
    }
    formData.append('email', authEmail);
    formData.append('password', authPassword);

    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        if (isRegisterMode) {
          alert(data.message);
          setIsRegisterMode(false);
          setAdminSecretKey('');
        } else {
          setUser(data.user);
          localStorage.setItem('loggedUser', JSON.stringify(data.user));
          setShowAuthModal(false);
          setAuthEmail('');
          setAuthPassword('');
        }
      } else {
        alert(data.message);
      }
    })
    .catch(err => console.error('Auth Error:', err));
  };

 const handleLogout = () => {
    // መውጣት መፈለጋቸውን እርግጠኛ የሚያደርግ የማስጠንቀቂያ ቦክስ
    if (window.confirm("Are you sour log out this page?")) {
      setUser(null);
      localStorage.removeItem('loggedUser');
      
      // ከዚህ ቀደም የተጻፉ የፎርም መረጃዎችን እና መልእክቶችን ማጽዳት
      setUserMessages([]);
      setContactEmail('');
      setContactTelegram('');
      setContactMessage('');
    }
  };
const handleContactSubmit = (e) => {
    e.preventDefault();
    
    if (window.confirm("are you sure send message?")) {
      fetch('http://localhost:8080/house-backend/send_message.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: contactEmail, 
          telegram: contactTelegram, 
          message: contactMessage 
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          alert('Messages send successfuly  !');
          setContactEmail('');
          setContactTelegram('');
          setContactMessage('');
        } else {
          alert(data.message);
        }
      })
      .catch(err => console.error('Error:', err));
    }
  };







  const handleApproveAction = (id, action) => {
    fetch(`http://localhost:8080/house-backend/approve_house.php?id=${id}&action=${action}`)
      .then(res => res.json())
      .then(() => fetchHouses())
      .catch(err => console.error('Approval Error:', err));
  };

  const handleDelete = (id, title, e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      fetch(`http://localhost:8080/house-backend/delete_house.php?id=${id}`)
        .then(res => res.json())
        .then(() => fetchHouses())
        .catch(err => console.error('Error deleting:', err));
    }
  };
// Handle Complete Message Deletion
 // Handle Complete Message Deletion

  const openEditModal = (house, e) => {
    e.stopPropagation();
    setEditingHouse(house);
    setEditTitle(house.title || house.Title || '');
    setEditLocation(house.location || house.Location || '');
    setEditPrice(house.price || house.Price || '');
    setEditBedrooms(house.bedrooms || 1);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('id', editingHouse.id || editingHouse.Id);
    formData.append('title', editTitle);
    formData.append('location', editLocation);
    formData.append('price', editPrice);
    formData.append('bedrooms', editBedrooms);

    const fileInput = e.target.elements['editImages'];
    if (fileInput && fileInput.files.length > 0) {
      for (let i = 0; i < fileInput.files.length; i++) {
        formData.append('images[]', fileInput.files[i]);
      }
    }

    fetch('http://localhost:8080/house-backend/edit_house.php', {
      method: 'POST',
      body: formData
    })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      setEditingHouse(null);
      fetchHouses();
    })
    .catch(err => console.error('Edit Error:', err));
  };

  const toggleFavorite = (houseId, e) => {
    e.stopPropagation();
    setFavorites(prev => prev.includes(houseId) ? prev.filter(id => id !== houseId) : [...prev, houseId]);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    const formData = new URLSearchParams();
    formData.append('sender_name', user ? user.name : 'Guest Visitor');
    formData.append('sender_email', user ? user.email : 'guest@portal.com');
    formData.append('sender_role', user ? user.role : 'guest');
    formData.append('message', msgText);

    fetch('http://localhost:8080/house-backend/send_message.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    })
    .then(res => res.json())
    .then(data => {
      alert(data.message || 'Message sent successfully!');
      setMsgText('');
    })
    .catch(err => console.error('Message Error:', err));
  };

  const handleReplySubmit = (msgId) => {
    const formData = new URLSearchParams();
    formData.append('id', msgId);
    formData.append('reply', replyText[msgId] || '');

    fetch('http://localhost:8080/house-backend/reply_message.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      fetchMessages();
    })
    .catch(err => console.error('Reply Error:', err));
  };

  const approvedHouses = houses.filter(h => (h.status || h.Status) === 'approved');
  const pendingHouses = houses.filter(h => (h.status || h.Status) === 'pending');

  const filteredHouses = approvedHouses.filter(house => {
    const title = house.title || house.Title || '';
    const location = house.location || house.Location || '';
    const price = parseFloat(house.price || house.Price || 0);

    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPrice = maxPrice === '' || price <= parseFloat(maxPrice);
    const matchesFavorites = !showOnlyFavorites || favorites.includes(house.id || house.Id);
    return matchesSearch && matchesPrice && matchesFavorites;
  }).sort((a, b) => {
    const priceA = parseFloat(a.price || a.Price || 0);
    const priceB = parseFloat(b.price || b.Price || 0);
    if (sortOrder === 'low-to-high') return priceA - priceB;
    if (sortOrder === 'high-to-low') return priceB - priceA;
    return 0;
  });

  const theme = {
    bg: darkMode ? '#121212' : '#f8f9fa',
    cardBg: darkMode ? '#1e1e1e' : '#ffffff',
    text: darkMode ? '#f1f1f1' : '#1e293b',
    subText: darkMode ? '#a1a1aa' : '#64748b',
    headerBg: darkMode ? '#1a1a1a' : '#0f172a',
    border: darkMode ? '#27272a' : '#e2e8f0'
  };

  const canAddProperty = user && (user.role === 'admin' || user.role === 'landlord');

  return (
    <div className="fade-in" style={{ fontFamily: "'Inter', sans-serif", backgroundColor: theme.bg, color: theme.text, minHeight: '100vh', paddingBottom: '60px' }}>
      
      {/* Navbar with Menu Items */}
      <nav style={{ backgroundColor: theme.headerBg, color: '#fff', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setActiveTab('home')}>
          <span style={{ fontSize: '26px' }}>🏡</span>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', letterSpacing: '0.5px' }}>House Rental Website</h2>
        </div>

        {/* Menu Links */}
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <span onClick={() => setActiveTab('home')} style={{ cursor: 'pointer', fontWeight: activeTab === 'home' ? '700' : '500', color: activeTab === 'home' ? '#38bdf8' : '#cbd5e1', fontSize: '14px' }}>Home</span>
          <span onClick={() => setActiveTab('about')} style={{ cursor: 'pointer', fontWeight: activeTab === 'about' ? '700' : '500', color: activeTab === 'about' ? '#38bdf8' : '#cbd5e1', fontSize: '14px' }}>About Us</span>
          <span onClick={() => setActiveTab('contact')} style={{ cursor: 'pointer', fontWeight: activeTab === 'contact' ? '700' : '500', color: activeTab === 'contact' ? '#38bdf8' : '#cbd5e1', fontSize: '14px' }}>Contact</span>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button onClick={() => setShowOnlyFavorites(!showOnlyFavorites)} style={{ backgroundColor: showOnlyFavorites ? '#ef4444' : '#334155', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
            ❤️ Wishlist ({favorites.length})
          </button>
          <button onClick={() => setDarkMode(!darkMode)} style={{ backgroundColor: '#334155', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '8px' }}>
              <span style={{ fontSize: '13px', backgroundColor: '#10b981', color: '#fff', padding: '6px 12px', borderRadius: '20px', fontWeight: 'bold' }}>
                👤 {user.name} ({user.role})
              </span>
              <button onClick={handleLogout} style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                Logout
              </button>
            </div>
          ) : (
            <button onClick={() => setShowAuthModal(true)} style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '20px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
              🔑 Login / Register
            </button>
          )}
        </div>
      </nav>


{/* 👇 ማርኬ ባነሩን ልክ ከዚህ በታች አስገባ 👇 */}
      <div className="moving-banner-container">
        <div className="moving-text">
          🏠 እንኳን ወደ House Rental Website portal በደህና መጡ! — የተመረጥዉ ሚከራዩ ቤቶችን እዚህ ያግኙ! 🏠
        </div>
      </div>








      <div style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px' }}>
        
        {/* TAB 1: HOME PAGE */}
        {activeTab === 'home' && (
          <div>
            {/* Admin Pending Approvals */}
            {user && user.role === 'admin' && pendingHouses.length > 0 && (
              <div style={{ backgroundColor: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '12px', padding: '20px', marginBottom: '30px' }}>
                <h3 style={{ margin: '0 0 15px', color: '#92400e', fontSize: '18px' }}>⏳ Pending Admin Approvals ({pendingHouses.length})</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '15px' }}>
                  {pendingHouses.map(house => {
                    const houseId = house.id || house.Id;
                    const title = house.title || house.Title;
                    const location = house.location || house.Location;
                    const price = house.price || house.Price;
                    return (
                      <div key={houseId} style={{ backgroundColor: '#fff', color: '#000', padding: '12px', borderRadius: '8px', border: '1px solid #fcd34d' }}>
                        <h4 style={{ margin: '0 0 5px', fontSize: '15px' }}>{title}</h4>
                        <p style={{ margin: '0 0 5px', fontSize: '12px', color: '#666' }}>📍 {location} | 💵 ${price}</p>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                          <button onClick={() => handleApproveAction(houseId, 'approve')} style={{ flex: 1, backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                            ✓ Approve
                          </button>
                          <button onClick={(e) => openEditModal(house, e)} style={{ backgroundColor: '#f59e0b', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                            Edit
                          </button>
                          <button onClick={() => handleApproveAction(houseId, 'reject')} style={{ flex: 1, backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                            ✕ Reject
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
{/* Admin Messages Inbox */}
            {user && user.role === 'admin' && (
              <div style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '12px', padding: '20px', marginBottom: '30px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                <h3 style={{ margin: '0 0 15px', fontSize: '18px' }}>📥 Messages Inbox ({messages.length})</h3>
                {messages.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {messages.map(msg => (
                      <div key={msg.id} style={{ padding: '12px', borderRadius: '8px', backgroundColor: theme.bg, border: `1px solid ${theme.border}` }}>
                        <p style={{ margin: '0 0 4px', fontSize: '13px' }}><b>{msg.sender_name}</b> ({msg.sender_role}) - <span style={{ color: theme.subText }}>{msg.sender_email}</span></p>
                        <p style={{ margin: '0 0 8px', fontSize: '14px' }}>💬 {msg.message}</p>
                        
                        {msg.reply ? (
                          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#10b981' }}><b>Admin Reply:</b> {msg.reply}</p>
                        ) : (
                          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                            <input 
                              type="text" 
                              placeholder="Type reply..." 
                              value={replyText[msg.id] || ''} 
                              onChange={(e) => setReplyText({...replyText, [msg.id]: e.target.value})}
                              style={{ flex: 1, padding: '6px 10px', borderRadius: '6px', border: `1px solid ${theme.border}`, backgroundColor: theme.cardBg, color: theme.text, fontSize: '13px' }}
                            />
                            <button onClick={() => handleReplySubmit(msg.id)} style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                              Send Reply
                            </button>
                          </div>
                        )}

    {/* አጠቃላይ መልእክቱን ከነካርዱ ሙሉ በሙሉ የሚያጠፋው ቁልፍ */}
                    <div style={{ marginTop: '10px', textAlign: 'right' }}>
   <button  onClick={() => handleDeleteUserMessage(msg.id)} 
  style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
  Delete Message
</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: theme.subText, fontSize: '13px', margin: 0 }}>No messages found.</p>
            )}
          </div>
        
      )}

      {/* ተጠቃሚው የላካቸው መልእክቶች እና የአድሚን ምላሽ የሚታዩበት */}
      {user && user.role !== 'admin' && (
        <div style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '12px', padding: '20px', marginTop: '20px' }}>
          <h3 style={{ margin: '0 0 15px', fontSize: '18px' }}>📩 Your Message And Admin Response </h3>
          {userMessages.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {userMessages.map(msg => (
                <div key={msg.id} style={{ padding: '12px', borderRadius: '8px', backgroundColor: theme.bg, border: `1px solid ${theme.border}` }}>
                  <p style={{ margin: '0 0 5px', fontSize: '14px' }}><b>Your message:</b> {msg.message}</p>
                  
                  {msg.reply ? (
                    <p style={{ margin: '5px 0 0', fontSize: '13px', color: '#10b981', fontWeight: 'bold' }}>
                      💬 Admin Response: {msg.reply}
                    </p>
                  ) : (
                    <p style={{ margin: '5px 0 0', fontSize: '12px', color: theme.subText, fontStyle: 'italic' }}>
                      ⏳ No reply_message...
                    </p>
                  )}
<div style={{ marginTop: '10px', textAlign: 'right' }}>
  <button 
    onClick={() => handleDeleteUserMessage(msg.id)} 
    style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
    Delete Message
  </button>
</div>

                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: theme.subText, fontSize: '13px', margin: 0 }}>no messages know።</p>
          )}
        </div>
      )}

      {/* Search and Filters */}
      <div style={{ backgroundColor: theme.cardBg, padding: '20px', borderRadius: '12px', border: `1px solid ${theme.border}`, display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
        <input 
          type="text"
                placeholder="🔍 Search title or location..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ flex: 2, minWidth: '220px', padding: '10px 16px', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: theme.bg, color: theme.text }}
              />
              <input 
                type="number" 
                placeholder="💵 Max Price ($)..." 
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                style={{ flex: 1, minWidth: '140px', padding: '10px 16px', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: theme.bg, color: theme.text }}
              />
              <select 
                value={sortOrder} 
                onChange={(e) => setSortOrder(e.target.value)}
                style={{ flex: 1, minWidth: '160px', padding: '10px 16px', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: theme.bg, color: theme.text, cursor: 'pointer' }}
              >
                <option value="default">Sort: Default</option>
                <option value="low-to-high">Price: Low to High</option>
                <option value="high-to-low">Price: High to Low</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: canAddProperty ? '320px 1fr' : '1fr', gap: '30px', alignItems: 'start' }}>
              
              {/* Left Panel: Property Form */}
              {canAddProperty && (
                <div style={{ backgroundColor: theme.cardBg, padding: '24px', borderRadius: '12px', border: `1px solid ${theme.border}`, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                  <h3 style={{ marginTop: 0, fontSize: '18px', borderBottom: `2px solid ${theme.border}`, paddingBottom: '12px' }}>➕ List a Property</h3>
                  <p style={{ fontSize: '11px', color: theme.subText, marginTop: '-6px' }}>*Listings require Admin Approval.</p>
                  
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    
                    fetch('http://localhost:8080/house-backend/add_house.php', {
                      method: 'POST',
                      body: formData
                    })
                    .then(res => res.json())
                    .then(data => {
                      alert(data.message || 'Property published successfully!');
                      e.target.reset();
                      fetchHouses();
                    })
                    .catch(err => {
                      console.error('Add House Error:', err);
                      alert('Property published successfully!');
                      e.target.reset();
                      fetchHouses();
                    });
                  }}>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ fontSize: '13px', fontWeight: '600' }}>Property Title</label>
                      <input type="text" name="title" required style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: theme.bg, color: theme.text, marginTop: '4px', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ fontSize: '13px', fontWeight: '600' }}>Location</label>
                      <input type="text" name="location" required style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: theme.bg, color: theme.text, marginTop: '4px', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '13px', fontWeight: '600' }}>Price ($)</label>
                        <input type="number" name="price" required style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: theme.bg, color: theme.text, marginTop: '4px', boxSizing: 'border-box' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '13px', fontWeight: '600' }}>Bedrooms</label>
                        <input type="number" name="bedrooms" defaultValue="1" min="1" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: theme.bg, color: theme.text, marginTop: '4px', boxSizing: 'border-box' }} />
                      </div>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '13px', fontWeight: '600' }}>Upload Images</label>
                      <input type="file" name="images[]" accept="image/*" multiple style={{ width: '100%', marginTop: '6px', fontSize: '12px' }} />
                    </div>
                    <button type="submit" style={{ width: '100%', backgroundColor: '#10b981', color: '#fff', padding: '11px', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
                      Publish Listing
                    </button>
                  </form>
                </div>
              )}

              {/* House List */}
              <div>
                <h3 style={{ margin: '0 0 20px', fontSize: '18px' }}>Available Properties ({filteredHouses.length})</h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
                  {filteredHouses.length > 0 ? (
                    filteredHouses.map(house => {
                      const houseId = house.id || house.Id;
                      const title = house.title || house.Title;
                      const location = house.location || house.Location;
                      const price = house.price || house.Price;
                      const imageStr = house.images || house.Image || '';
                      const imageList = imageStr ? imageStr.split(',') : [];
                      const isFav = favorites.includes(houseId);

                      return (
                        <div key={houseId} style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '12px', padding: '16px', position: 'relative', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                          <button onClick={(e) => toggleFavorite(houseId, e)} style={{ position: 'absolute', right: '24px', top: '24px', backgroundColor: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {isFav ? '❤️' : '🤍'}
                          </button>

                     <div 
  onClick={() => {
    const rawImg = imageList[0];
    const fullUrl = rawImg ? (rawImg.startsWith('http') ? rawImg : `http://localhost:8080/house-backend/uploads/${rawImg}`) : '';
    setSelectedImage({ url: fullUrl, list: imageList, index: 0 });
  }} 
  style={{ cursor: 'pointer' }}

>
  <ImageSlider images={imageList} title={title} />
</div>

                          <h4 style={{ margin: '8px 0 4px', fontSize: '16px', fontWeight: '600' }}>{title}</h4>
                          <p style={{ margin: '0 0 8px', color: theme.subText, fontSize: '13px' }}>📍 {location}</p>
                          
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '12px 0' }}>
                            <span style={{ fontSize: '18px', fontWeight: '700', color: '#10b981' }}>${price}<small style={{ fontSize: '11px', color: theme.subText }}>/mo</small></span>
                            <span style={{ fontSize: '11px', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '12px', fontWeight: '600' }}>Approved</span>
                          </div>

                          <div style={{ display: 'flex', gap: '8px' }}>
                            {user && (user.role === 'admin' || user.role === 'landlord') && (
                              <button onClick={(e) => openEditModal(house, e)} style={{ flex: 1, backgroundColor: '#f59e0b', color: '#fff', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                                Edit
                              </button>
                            )}
                            {user && user.role === 'admin' && (
                              <button onClick={(e) => handleDelete(houseId, title, e)} style={{ flex: 1, backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p style={{ color: theme.subText, gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>No properties found matching your criteria.</p>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: ABOUT US PAGE */}
        {activeTab === 'about' && (
          <div style={{ backgroundColor: theme.cardBg, padding: '40px', borderRadius: '16px', border: `1px solid ${theme.border}`, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
            <h2 style={{ marginTop: 0, color: '#2563eb', fontSize: '26px' }}>About UrbanNest Portal 🏡</h2>
            <p style={{ lineHeight: '1.7', fontSize: '15px', color: theme.text }}>
              UrbanNest Portal is a modern, full-featured House Rental Management System built with <b>React.js</b>, <b>PHP</b>, and <b>MySQL</b>. 
              Our platform bridges the gap between property seekers (Tenants), verified property owners (Landlords), and system administrators.
            </p>
            <h3 style={{ fontSize: '18px', marginTop: '24px' }}>Key Features:</h3>
            <ul style={{ lineHeight: '1.8', fontSize: '14px', color: theme.subText }}>
              <li><b>Role-Based Access Control:</b> Dedicated dashboards and permissions for Admins, Landlords, and Tenants.</li>
              <li><b>Admin Approval Workflow:</b> Ensures all newly published properties are reviewed before going live.</li>
              <li><b>Advanced Search & Wishlist:</b> Filter properties by location, price, and save your favorite homes.</li>
              <li><b>Direct Communication:</b> Built-in contact and messaging system between users and administration.</li>
            </ul>
          </div>
        )}

        {/* TAB 3: CONTACT PAGE */}
    {activeTab === 'contact' && (
  <div style={{ maxWidth: '600px', margin: '40px auto', padding: '30px', backgroundColor: theme.cardBg, borderRadius: '12px', border: `1px solid ${theme.border}` }}>
    <h2 style={{ marginBottom: '20px', color: theme.text }}>📞 (Contact Us)</h2>
    
    {/* 👇 የአድሚን ቀጥተኛ አድራሻዎች የሚታዩበት ቦክስ 👇 */}
    <div style={{ marginBottom: '25px', padding: '15px', backgroundColor: theme.bg, borderRadius: '8px', border: `1px solid ${theme.border}` }}>
      <h3 style={{ margin: '0 0 10px', fontSize: '16px', color: theme.text }}>👨‍💻 Admin Address:</h3>
      <p style={{ margin: '5px 0', fontSize: '14px', color: theme.text }}>
        📧 <b>Email:</b> woinshetteshale@gmail.com
      </p>
      <p style={{ margin: '5px 0', fontSize: '14px', color: theme.text }}>
        📱 <b>Telegram:</b> @woinua
      </p>
    </div>
    {/* 👆 --------------------------------------- 👆 */}

    <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      
      <div>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: theme.text }}>Email Address(Email):</label>
        <input 
          type="email" 
          required
          value={contactEmail} 
          onChange={(e) => setContactEmail(e.target.value)}
          placeholder="example@gmail.com"
          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: `1px solid ${theme.border}`, backgroundColor: theme.bg, color: theme.text }}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: theme.text }}>Telegram Address (Telegram Username/Phone):</label>
        <input 
          type="text" 
          value={contactTelegram} 
          onChange={(e) => setContactTelegram(e.target.value)}
          placeholder="@username or phone number"
          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: `1px solid ${theme.border}`, backgroundColor: theme.bg, color: theme.text }}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: theme.text }}>(Message):</label>
        <textarea 
          required
          rows="4"
          value={contactMessage} 
          onChange={(e) => setContactMessage(e.target.value)}
          placeholder="hear..."
          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: `1px solid ${theme.border}`, backgroundColor: theme.bg, color: theme.text }}
        ></textarea>
      </div>

      <button 
        type="submit" 
        style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' }}>
        Send Message
      </button>

    </form>
  </div>
)}

      </div>

      {/* Edit House Modal */}
      {editingHouse && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: theme.cardBg, color: theme.text, padding: '28px', borderRadius: '16px', maxWidth: '400px', width: '90%', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <button onClick={() => setEditingHouse(null)} style={{ position: 'absolute', right: '20px', top: '20px', backgroundColor: theme.bg, border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 'bold', color: theme.text }}>✕</button>
            <h3 style={{ marginTop: 0, fontSize: '20px', marginBottom: '15px' }}>✏️ Edit Property</h3>
            
            <form onSubmit={handleEditSubmit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600' }}>Property Title</label>
                <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: theme.bg, color: theme.text, marginTop: '4px', boxSizing: 'border-box' }} />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600' }}>Location</label>
                <input type="text" value={editLocation} onChange={(e) => setEditLocation(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: theme.bg, color: theme.text, marginTop: '4px', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '13px', fontWeight: '600' }}>Price ($)</label>
                  <input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: theme.bg, color: theme.text, marginTop: '4px', boxSizing: 'border-box' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '13px', fontWeight: '600' }}>Bedrooms</label>
                  <input type="number" value={editBedrooms} onChange={(e) => setEditBedrooms(e.target.value)} min="1" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: theme.bg, color: theme.text, marginTop: '4px', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600' }}>Change Photos (Optional)</label>
                <input type="file" name="editImages" accept="image/*" multiple style={{ width: '100%', marginTop: '4px', fontSize: '12px' }} />
              </div>
              <button type="submit" style={{ width: '100%', backgroundColor: '#f59e0b', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                Update Property
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Auth Modal with Password Show/Hide Feature */}
      {showAuthModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: theme.cardBg, color: theme.text, padding: '28px', borderRadius: '16px', maxWidth: '400px', width: '90%', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <button onClick={() => setShowAuthModal(false)} style={{ position: 'absolute', right: '20px', top: '20px', backgroundColor: theme.bg, border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 'bold', color: theme.text }}>✕</button>
            <h3 style={{ marginTop: 0, fontSize: '20px', marginBottom: '15px' }}>{isRegisterMode ? '📝 Create Account' : '🔑 Portal Login'}</h3>
            
            <form onSubmit={handleAuthSubmit}>
              {isRegisterMode && (
                <>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '600' }}>Full Name</label>
                    <input type="text" value={authName} onChange={(e) => setAuthName(e.target.value)} required placeholder="Abebe Kebede" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: theme.bg, color: theme.text, marginTop: '4px', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '600' }}>Role</label>
                    <select value={authRole} onChange={(e) => setAuthRole(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: theme.bg, color: theme.text, marginTop: '4px', boxSizing: 'border-box' }}>
                      <option value="landlord">Landlord (House Owner)</option>
                      <option value="tenant">Tenant (House Seeker)</option>
                      <option value="admin">System Admin</option>
                    </select>
                  </div>

                  {authRole === 'admin' && (
                    <div style={{ marginBottom: '12px', backgroundColor: '#fef3c7', padding: '10px', borderRadius: '8px', border: '1px solid #f59e0b' }}>
                      <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#92400e' }}>🔑 Admin Secret Key</label>
                      <input type="password" value={adminSecretKey} onChange={(e) => setAdminSecretKey(e.target.value)} required placeholder="Enter key (e.g. ADMIN123)" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d97706', marginTop: '4px', boxSizing: 'border-box' }} />
                    </div>
                  )}
                </>
              )}

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600' }}>Email Address</label>
                <input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} required placeholder="user@gmail.com" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: theme.bg, color: theme.text, marginTop: '4px', boxSizing: 'border-box' }} />
              </div>

              {/* Password Field with Hidden/Open (Show/Hide) Toggle */}
              <div style={{ marginBottom: '20px', position: 'relative' }}>
                <label style={{ fontSize: '13px', fontWeight: '600' }}>Password</label>
                <div style={{ position: 'relative', marginTop: '4px' }}>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={authPassword} 
                    onChange={(e) => setAuthPassword(e.target.value)} 
                    required 
                    placeholder="******" 
                    style={{ width: '100%', padding: '10px 40px 10px 10px', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: theme.bg, color: theme.text, boxSizing: 'border-box' }} 
                  />
                  <span 
                    onClick={() => setShowPassword(!showPassword)} 
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: '14px', userSelect: 'none' }}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "👁️" : "🙈"}
                  </span>
                </div>
              </div>

              <button type="submit" style={{ width: '100%', backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                {isRegisterMode ? 'Register Now' : 'Login'}
              </button>
            </form>

            <div style={{ marginTop: '15px', textAlign: 'center', fontSize: '13px' }}>
              {isRegisterMode ? (
                <p style={{ margin: 0 }}>Already have an account? <span onClick={() => setIsRegisterMode(false)} style={{ color: '#2563eb', cursor: 'pointer', fontWeight: 'bold' }}>Login</span></p>
              ) : (
                <p style={{ margin: 0 }}>Don't have an account? <span onClick={() => setIsRegisterMode(true)} style={{ color: '#2563eb', cursor: 'pointer', fontWeight: 'bold' }}>Register (Sign Up)</span></p>
              )}
            </div>
          </div>
        </div>
      )}
{/* 3. ፎቶው ሲነካ ተለቅ ብሎ የሚታየው ፖፕአፕ (Image Modal) */}
     {/* 3. ፎቶው ሲነካ ተለቅ ብሎ የሚታየው ፖፕአፕ ከነ ቀስቶቹ (Image Modal with Next/Prev) */}
      {selectedImage && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
          onClick={() => setSelectedImage(null)}
        >
          <div 
            style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%', display: 'flex', alignItems: 'center' }}
            onClick={(e) => e.stopPropagation()} // ፎቶው ላይ ሲጫኑ ፖፕአፑ እንዳይዘጋ ይከላከላል
          >
            {/* የዝጋ (Close - X) አዝራር */}
            <span 
              style={{
                position: 'absolute',
                top: '-45px',
                right: '0px',
                color: '#fff',
                fontSize: '32px',
                fontWeight: 'bold',
                cursor: 'pointer',
                background: 'rgba(0,0,0,0.5)',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
              onClick={() => setSelectedImage(null)}
            >
              ✕
            </span>

            {/* Previous (❮) ቀስት አዝራር - ከአንድ በላይ ፎቶ ካለ ብቻ ይታያል */}
            {selectedImage.list && selectedImage.list.length > 1 && (
              <button 
                onClick={() => {
                  const newIdx = (selectedImage.index - 1 + selectedImage.list.length) % selectedImage.list.length;
                  const rawImg = selectedImage.list[newIdx];
                  const fullUrl = rawImg.startsWith('http') ? rawImg : `http://localhost:8080/house-backend/uploads/${rawImg}`;
                  setSelectedImage({ ...selectedImage, index: newIdx, url: fullUrl });
                }}
                style={{
                  position: 'absolute',
                  left: '-55px',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  zIndex: 1010,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ❮
              </button>
            )}

            {/* ዋናው የተለቀቀው ፎቶ */}
            <img 
              src={selectedImage.url} 
              alt="Enlarged Property" 
              style={{ 
                maxWidth: '85vw', 
                maxHeight: '85vh', 
                objectFit: 'contain', 
                borderRadius: '8px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
              }} 
            />

            {/* Next (❯) ቀስት አዝራር - ከአንድ በላይ ፎቶ ካለ ብቻ ይታያል */}
            {selectedImage.list && selectedImage.list.length > 1 && (
              <button 
                onClick={() => {
                  const newIdx = (selectedImage.index + 1) % selectedImage.list.length;
                  const rawImg = selectedImage.list[newIdx];
                  const fullUrl = rawImg.startsWith('http') ? rawImg : `http://localhost:8080/house-backend/uploads/${rawImg}`;
                  setSelectedImage({ ...selectedImage, index: newIdx, url: fullUrl });
                }}
                style={{
                  position: 'absolute',
                  right: '-55px',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  zIndex: 1010,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ❯
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;