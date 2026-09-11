import React, { useState, useEffect } from 'react';
import { ShoppingBag, Clock, Tag, User, LogOut, ArrowLeft, MapPin, ChevronRight, Download, Upload, Plus, Minus, CheckCircle2, Search, Menu, Camera, Phone, Lock, ArrowRight, ShieldCheck, Wallet, Heart, Truck, MessageCircle, Moon, Sun, Star, Globe, Gift, Repeat, Calendar, AlertTriangle, Users, Mic, Bell, XCircle, Store, Navigation } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function CustomerWeb() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [phone, setPhone] = useState('9123456789');

  const [activeTab, setActiveTab] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedShop, setSelectedShop] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [cart, setCart] = useState([]);

  // --- EDIT PROFILE MODAL STATES ---
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [editProfileName, setEditProfileName] = useState('');

  // --- WALLET HISTORY & SCRATCH CARD MODAL STATES ---
  const [isWalletHistoryOpen, setIsWalletHistoryOpen] = useState(false);
  const [scratchCardModal, setScratchCardModal] = useState(null);
  const [isScratched, setIsScratched] = useState(false);

  // --- BACKEND DYNAMIC FOOD, SHOPS & ORDERS STATE WITH AUTO POLLING ---
  const [backendFoodItems, setBackendFoodItems] = useState([]);
  const [allShops, setAllShops] = useState([]);
  const [backendOrders, setBackendOrders] = useState([]);
  const [userPhoto, setUserPhoto] = useState('https://api.dicebear.com/7.x/avataaars/svg?seed=Naveen');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const foodRes = await fetch("http://localhost:8080/api/food/all");
        if (foodRes.ok) {
          const foodData = await foodRes.json();
          setBackendFoodItems(foodData);
        }

        const shopRes = await fetch("http://localhost:8080/api/shop/all");
        if (shopRes.ok) {
          const shopData = await shopRes.json();
          setAllShops(shopData);
        }

        if (phone) {
          const orderRes = await fetch(`http://localhost:8080/api/orders/customer/${phone}`);
          if (orderRes.ok) {
            const orderData = await orderRes.json();
            setBackendOrders(orderData);
          }

          const profileRes = await fetch(`http://localhost:8080/api/users/profile/${phone}`);
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            if (profileData.profilePhoto) {
              setUserPhoto(profileData.profilePhoto);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, [phone]); 

  const [darkMode, setDarkMode] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'support', text: 'Hello! How can we help you with your order in Ichapuram today?' }
  ]);
  const [inputMsg, setInputMsg] = useState('');

  const [ratingModal, setRatingModal] = useState(null);
  const [stars, setStars] = useState(5);
  const [reviewText, setReviewText] = useState('');

  const [riderTip, setRiderTip] = useState(0);
  const [splitPeople, setSplitPeople] = useState(1);

  // --- SWIGGY STYLE LIVE TRACKING STATE FOR BIKE RIDER ---
  const [activeTrackingOrder, setActiveTrackingOrder] = useState(null);
  const [riderLocation, setRiderLocation] = useState({ lat: 18.5793, lng: 84.4452 });

  useEffect(() => {
    if (activeTrackingOrder) {
      const trackingInterval = setInterval(() => {
        setRiderLocation(prev => ({
          lat: prev.lat + (Math.random() - 0.5) * 0.001,
          lng: prev.lng + (Math.random() - 0.5) * 0.001
        }));
      }, 3000);
      return () => clearInterval(trackingInterval);
    }
  }, [activeTrackingOrder]);

  // --- WALLET & PAYMENT PERSISTENCE ---
  const [walletBalance, setWalletBalance] = useState(() => {
    const saved = localStorage.getItem('foodiee_wallet_balance');
    return saved !== null ? parseFloat(saved) : 0.00;
  });

  const [paymentHistory, setPaymentHistory] = useState(() => {
    const saved = localStorage.getItem('foodiee_payment_history');
    return saved !== null ? JSON.parse(saved) : [
      { id: '#PAY-901', type: 'CREDIT', method: 'Wallet Top-up (Razorpay)', amount: 140, date: '18 Aug 2026', status: 'Success' }
    ];
  });

  // --- REAL-TIME PHOTO UPLOAD TO DATABASE & SERVER ---
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('mobile', phone);

    try {
      toast.loading('Uploading profile photo...');
      const response = await fetch("http://localhost:8080/api/users/upload-photo", {
        method: "POST",
        body: formData,
      });

      toast.dismiss();

      if (response.ok) {
        const updatedUser = await response.json();
        setUserPhoto(updatedUser.profilePhoto);
        toast.success('✓ Profile photo saved to database successfully!');
      } else {
        toast.error('❌ Failed to upload photo to server.');
      }
    } catch (error) {
      toast.dismiss();
      toast.error('❌ Server connection error during photo upload.');
    }
  };

  // --- INTERACTIVE SCRATCH CARD REWARD LOGIC ---
  const triggerScratchCard = (orderAmount) => {
    const randomChance = Math.random();
    let rewardAmount = 0;

    if (randomChance < 0.10) {
      rewardAmount = Math.floor(20 + Math.random() * 31); 
    } else {
      const baseReward = Math.floor(2 + Math.random() * 13);
      const scaleBonus = Math.floor(orderAmount / 300);
      rewardAmount = Math.min(15, baseReward + scaleBonus);
    }

    setScratchCardModal({ amount: rewardAmount });
    setIsScratched(false);
  };

  const handleScratchAction = () => {
    if (isScratched || !scratchCardModal) return;

    setIsScratched(true);
    const amt = scratchCardModal.amount;

    setWalletBalance(prev => prev + amt);
    setPaymentHistory(prev => [{
      id: "SCRATCH_" + Math.floor(100000 + Math.random() * 900000),
      type: 'CREDIT',
      method: `🎁 Scratch Card Win (₹${amt} Added)`,
      amount: amt,
      date: 'Just now',
      status: 'Success'
    }, ...prev]);

    toast.success(`🎉 Hurrah! ₹${amt} successfully added to your wallet!`);
  };

  // --- SAVED ADDRESSES & COMPLETE ADDRESS MANAGEMENT ---
  const [savedAddresses, setSavedAddresses] = useState(() => {
    const saved = localStorage.getItem('foodiee_multiple_addresses');
    return saved !== null ? JSON.parse(saved) : [
      { id: 1, type: 'Home', name: 'Bommali Naveen', mobile: '9123456789', houseNo: 'Door 2-45', street: 'Main Road', landmark: 'Near Temple', district: 'Ichapuram', state: 'Andhra Pradesh', latitude: 18.5793, longitude: 84.4452 }
    ];
  });

  const [address, setAddress] = useState(() => {
    const savedActive = localStorage.getItem('foodiee_active_address');
    if (savedActive !== null) return JSON.parse(savedActive);
    return savedAddresses[0] || {
      name: 'Bommali Naveen',
      mobile: '9123456789',
      houseNo: 'Door 2-45',
      street: 'Main Road',
      landmark: 'Near Temple',
      district: 'Ichapuram',
      state: 'Andhra Pradesh',
      pincode: '532484',
      latitude: 18.5793,
      longitude: 84.4452
    };
  });

  const [newAddressInput, setNewAddressInput] = useState({
    type: 'Home',
    name: 'Bommali Naveen',
    mobile: '9123456789',
    houseNo: '',
    street: '',
    landmark: '',
    district: 'Ichapuram',
    state: 'Andhra Pradesh',
    pincode: '532484',
    latitude: 18.5793,
    longitude: 84.4452
  });

  // --- DETECT LIVE GPS FOR NEW ADDRESS (DATABASE CONNECTED) ---
  const detectGpsForNewAddress = () => {
    if (navigator.geolocation) {
      toast.loading('📍 Detecting live GPS location...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setNewAddressInput(prev => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            street: prev.street ? prev.street : `GPS Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`
          }));
          toast.dismiss();
          toast.success('📍 GPS coordinates captured successfully!');
        },
        (error) => {
          toast.dismiss();
          toast.error('❌ GPS unavailable. Please enter complete address manually.');
        },
        { enableHighAccuracy: true }
      );
    } else {
      toast.error('❌ Geolocation not supported');
    }
  };

  // --- SAVE ADDRESS TO DATABASE BACKEND ---
  const handleAddNewAddress = async (e) => {
    e.preventDefault();
    if (!newAddressInput.street.trim() || !newAddressInput.pincode.trim() || !newAddressInput.district.trim()) {
      toast.error('❌ Please fill complete address details');
      return;
    }

    const payload = {
      customerMobile: phone || newAddressInput.mobile,
      ...newAddressInput
    };

    try {
      const response = await fetch("http://localhost:8080/api/address/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const savedAddr = await response.json();
        setSavedAddresses(prev => [...prev, savedAddr]);
        setAddress(savedAddr);
        toast.success(`📍 ${newAddressInput.type} Complete Address Saved to Database with GPS!`);
        
        setNewAddressInput({ 
          type: 'Home', 
          name: address.name, 
          mobile: address.mobile, 
          houseNo: '',
          street: '', 
          landmark: '',
          district: 'Ichapuram', 
          state: 'Andhra Pradesh', 
          pincode: '532484', 
          latitude: 18.5793, 
          longitude: 84.4452 
        });
      } else {
        toast.error('❌ Failed to save address in database');
      }
    } catch (error) {
      console.error("Address save error:", error);
      toast.error('❌ Network error while saving address');
    }
  };

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editableAddress, setEditableAddress] = useState(address);

  const detectLiveGpsLocation = () => {
    if (navigator.geolocation) {
      toast.loading('📍 Detecting live GPS location...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setEditableAddress(prev => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            street: `GPS Active (${lat.toFixed(4)}, ${lng.toFixed(4)})`
          }));
          toast.dismiss();
          toast.success('📍 Live GPS coordinates detected successfully!');
        },
        (error) => {
          toast.dismiss();
          toast.error('❌ GPS permission denied or unavailable.');
        },
        { enableHighAccuracy: true }
      );
    }
  };

  const handleSaveEditedAddress = (e) => {
    e.preventDefault();
    setAddress(editableAddress);
    setIsEditingAddress(false);
    toast.success('✓ Delivery address updated successfully!');
  };

  useEffect(() => {
    localStorage.setItem('foodiee_wallet_balance', walletBalance);
  }, [walletBalance]);

  useEffect(() => {
    localStorage.setItem('foodiee_payment_history', JSON.stringify(paymentHistory));
  }, [paymentHistory]);

  useEffect(() => {
    localStorage.setItem('foodiee_multiple_addresses', JSON.stringify(savedAddresses));
  }, [savedAddresses]);

  useEffect(() => {
    localStorage.setItem('foodiee_active_address', JSON.stringify(address));
  }, [address]);

  const [isAddMoneyModalOpen, setIsAddMoneyModalOpen] = useState(false);
  const [addAmountInput, setAddAmountInput] = useState('');

  const handleRazorpayPayment = () => {
    const amount = parseFloat(addAmountInput);
    if (!amount || amount <= 0) {
      toast.error('❌ Please enter a valid amount');
      return;
    }

    const options = {
      key: "rzp_test_TTbofIebO8RB99",
      amount: amount * 100,
      currency: "INR",
      name: "Foodiee Delivery App",
      description: "Wallet Top-up for Ichapuram",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Foodiee",
      handler: async function (response) {
        const paymentId = response.razorpay_payment_id;
        await verifyAndSavePayment(paymentId, amount);
      },
      prefill: {
        name: address.name,
        email: "user@foodiee.com",
        contact: address.mobile
      },
      theme: {
        color: "#fc8019"
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handleUpiPayment = (appName, type) => {
    const amount = parseFloat(addAmountInput);
    if (!amount || amount <= 0) {
      toast.error('❌ Please enter a valid amount');
      return;
    }
    const fakeTxnId = "TXN_" + Math.floor(100000 + Math.random() * 900000);
    verifyAndSavePayment(fakeTxnId, amount);
  };

  const verifyAndSavePayment = async (paymentId, amount) => {
    const paymentPayload = {
      transactionId: paymentId,
      customerMobile: address.mobile,
      totalAmount: amount,
      paymentMethod: 'Razorpay Online',
      paymentStatus: 'SUCCESS',
      shopId: selectedShop ? selectedShop.id : 1
    };

    try {
      const res = await fetch("http://localhost:8080/api/payments/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentPayload),
      });

      if (res.ok) {
        const savedTx = await res.json();
        setWalletBalance(prev => prev + amount);
        setPaymentHistory(prev => [{
          id: savedTx.transactionId || paymentId,
          type: 'CREDIT',
          method: 'Wallet Top-up (Razorpay)',
          amount: amount,
          date: 'Just now',
          status: 'Success'
        }, ...prev]);

        toast.success(`🎉 ₹ ${amount} added to wallet successfully!`);
        setIsAddMoneyModalOpen(false);
        setAddAmountInput('');
      } else {
        toast.error('❌ Failed to save payment in database');
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error('❌ Server connection error');
    }
  };

  const [notifications, setNotifications] = useState([
    { id: 1, title: '⚡ Flash Offer Added!', desc: 'Use code FIRST50 for ₹50 OFF on your first food order.', time: 'Just now', unread: true },
    { id: 2, title: '🛒 Free Delivery', desc: 'Free delivery on all grocery orders above ₹199 in Ichapuram.', time: '2 hrs ago', unread: true }
  ]);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  const [favorites, setFavorites] = useState([]);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const [isPaymentScreen, setIsPaymentScreen] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState(null);

  // --- PRINT DOCUMENT STATE ---
  const [printDetails, setPrintDetails] = useState({
    fileName: '',
    bwPages: 1,
    bwCostPerPage: 2,
    colorPages: 0,
    colorCostPerPage: 10
  });

  const [searchQuery, setSearchQuery] = useState('');

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const deliveryFee = subtotal > 0 ? 20 : 0;
  const printTotal = (printDetails.bwPages * printDetails.bwCostPerPage) + (printDetails.colorPages * printDetails.colorCostPerPage);
  
  const baseTotal = selectedCategory === 'Print' ? printTotal : (subtotal + deliveryFee);
  const totalAmount = Math.max(0, (baseTotal + riderTip) - discount);
  const splitAmount = (totalAmount / Math.max(1, splitPeople)).toFixed(2);

  const applyPromo = () => {
    if (promoCode.toUpperCase() === 'FIRST50') {
      setDiscount(50);
      toast.success('🎁 Promo code applied! ₹50 OFF');
    } else {
      toast.error('❌ Invalid Promo Code (Try: FIRST50)');
    }
  };

  // --- ORDER PLACEMENT WITH ADDRESS LAT/LNG & LATEST ORDER ON TOP ---
  const processOrderCompletion = async (methodName) => {
    const orderItemsDesc = selectedCategory === 'Print' 
      ? `Print Doc: ${printDetails.fileName || 'Document'} (B&W: ${printDetails.bwPages}, Color: ${printDetails.colorPages})`
      : cart.map(i => `${i.qty}x ${i.name}`).join(', ');

    const newOrderPayload = {
      customerMobile: address.mobile,
      shopName: selectedCategory === 'Print' ? 'Ichapuram Print Shop' : (selectedShop ? selectedShop.name : 'Local Store'),
      shopId: selectedShop ? selectedShop.id : 1,
      items: orderItemsDesc,
      totalAmount: totalAmount,
      paymentMethod: methodName,
      status: 'Pending Approval',
      latitude: address.latitude || 18.5793,
      longitude: address.longitude || 84.4452
    };

    try {
      const response = await fetch("http://localhost:8080/api/orders/place", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrderPayload),
      });

      if (response.ok) {
        const savedOrder = await response.json();

        if (methodName.includes('Wallet')) {
          const debitPayload = {
            transactionId: "WAL_DEBIT_" + Math.floor(100000 + Math.random() * 900000),
            customerMobile: address.mobile,
            totalAmount: totalAmount,
            paymentMethod: 'Wallet Deduction',
            paymentStatus: 'SUCCESS',
            shopId: selectedShop ? selectedShop.id : 1
          };

          await fetch("http://localhost:8080/api/payments/process", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(debitPayload),
          });

          setWalletBalance(prev => prev - totalAmount);
          setPaymentHistory(prev => [{
            id: debitPayload.transactionId,
            type: 'DEBIT',
            method: `Paid for Order (${savedOrder.shopName || 'Store'})`,
            amount: totalAmount,
            date: 'Just now',
            status: 'Success'
          }, ...prev]);
        } 
        else if (methodName.includes('Razorpay')) {
          const rzpPayload = {
            transactionId: "ORD_RAZOR_" + Math.floor(100000 + Math.random() * 900000),
            customerMobile: address.mobile,
            totalAmount: totalAmount,
            paymentMethod: 'Razorpay Online Checkout',
            paymentStatus: 'SUCCESS',
            shopId: selectedShop ? selectedShop.id : 1
          };

          await fetch("http://localhost:8080/api/payments/process", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(rzpPayload),
          });

          setPaymentHistory(prev => [{
            id: rzpPayload.transactionId,
            type: 'DEBIT',
            method: 'Razorpay Online Checkout',
            amount: totalAmount,
            date: 'Just now',
            status: 'Success'
          }, ...prev]);
        }

        const formattedOrder = {
          id: savedOrder.orderId || savedOrder.id || '#ORD-' + Math.floor(1000 + Math.random() * 9000),
          type: selectedCategory || 'Food',
          shop: savedOrder.shopName || (selectedShop ? selectedShop.name : 'Store'),
          items: savedOrder.items || newOrderPayload.items,
          total: savedOrder.totalAmount || totalAmount,
          date: 'Just now',
          status: savedOrder.status || 'Pending Approval',
          deliveryOtp: savedOrder.deliveryOtp || savedOrder.delivery_otp || null,
          rating: null
        };

        setBackendOrders(prev => [formattedOrder, ...prev]);
        setSuccessReceipt(formattedOrder);
        setIsPaymentScreen(false);
        setSelectedCategory(null);
        setSelectedShop(null);
        setCart([]);
        setDiscount(0);
        setPromoCode('');
        setRiderTip(0);
        
        triggerScratchCard(totalAmount);

        toast.success('🎉 Order Placed & Saved to History Successfully!');
      } else {
        toast.error('❌ Failed to place order in backend server.');
      }
    } catch (error) {
      console.error("Order error:", error);
      toast.error('❌ Server connection error.');
    }
  };

  const handlePayment = async (method) => {
    if (method.includes('Wallet') && walletBalance < totalAmount) {
      toast.error('❌ Insufficient Wallet Balance! Please add money.');
      return;
    }

    if (method.includes('Razorpay')) {
      const options = {
        key: "rzp_test_TTbofIebO8RB99",
        amount: totalAmount * 100,
        currency: "INR",
        name: "Foodiee Delivery App",
        description: `Order Payment for Print / Store`,
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Foodiee",
        handler: async function (response) {
          await processOrderCompletion('Razorpay Online');
        },
        prefill: {
          name: address.name,
          email: "user@foodiee.com",
          contact: address.mobile
        },
        theme: {
          color: "#fc8019"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      return;
    }

    await processOrderCompletion(method);
  };

  const submitRating = (orderId) => {
    setBackendOrders(backendOrders.map(o => (o.id === orderId || o.orderId === orderId) ? { ...o, rating: stars } : o));
    setRatingModal(null);
    toast.success('⭐ Thank you for your feedback!');
  };

  const sendChatMessage = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    setChatMessages([...chatMessages, { sender: 'user', text: inputMsg }, { sender: 'support', text: 'Thanks for reaching out! Our delivery partner is assigned.' }]);
    setInputMsg('');
  };

  const toggleFavorite = (shop) => {
    if (favorites.some(f => f.id === shop.id)) {
      setFavorites(favorites.filter(f => f.id !== shop.id));
      toast.success(`Removed ${shop.name} from Favorites`);
    } else {
      setFavorites([...favorites, shop]);
      toast.success(`Added ${shop.name} to Favorites ❤️`);
    }
  };

  const dynamicShops = allShops
    .filter(shop => {
      const shopCat = (shop.category || '').toUpperCase();
      const targetCat = (selectedCategory || '').toUpperCase();
      if (targetCat === 'FOOD') return shopCat === 'FOOD' || shopCat === 'RESTAURANT';
      if (targetCat === 'GROCERY') return shopCat === 'GROCERY' || shopCat === 'SUPERMARKET';
      return true;
    })
    .map(shop => {
      const shopItems = backendFoodItems.filter(item =>
        item.restaurantId === shop.id || item.restaurantId === Number(shop.id) || item.shopId === shop.id || item.shopId === Number(shop.id)
      );

      const categoriesMap = {};
      shopItems.forEach(item => {
        const cat = item.category || 'General';
        if (!categoriesMap[cat]) categoriesMap[cat] = [];
        categoriesMap[cat].push(item);
      });

      return {
        id: shop.id,
        name: shop.shopName || shop.name || 'Local Store', 
        imageUrl: (shop.imageUrl && shop.imageUrl.trim() !== '') ? shop.imageUrl : 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
        rating: shop.rating ? `${shop.rating} ⭐` : '4.8 ⭐',
        time: shop.deliveryTime || '15 mins',
        category: shop.category || 'Food & Tiffins',
        address: shop.address || 'Main Road, Ichapuram',
        categories: categoriesMap,
        items: shopItems
      };
    });

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-0 sm:p-6 font-sans">
      <div className="w-full max-w-[1000px] h-[100dvh] sm:h-[90vh] bg-slate-900 sm:rounded-[2.5rem] sm:shadow-2xl sm:border-[6px] sm:border-slate-800 flex flex-col relative overflow-hidden text-gray-900 dark:text-white"> 
        <Toaster />

        {/* --- FULL WALLET HISTORY POPUP MODAL --- */}
        {isWalletHistoryOpen && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-slate-900 border border-amber-500/50 w-full max-w-sm rounded-[32px] p-5 text-white space-y-4 shadow-2xl overflow-y-auto max-h-[85vh]">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📜</span>
                  <h3 className="text-sm font-black text-amber-400">Complete Wallet History</h3>
                </div>
                <button onClick={() => setIsWalletHistoryOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                  <XCircle size={22} />
                </button>
              </div>

              <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
                {paymentHistory.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-10">No transactions found.</p>
                ) : (
                  paymentHistory.map((pay, i) => (
                    <div key={i} className="bg-slate-800/80 border border-slate-700/70 p-3.5 rounded-2xl flex justify-between items-center text-xs">
                      <div className="space-y-0.5">
                        <p className="font-black text-white">{pay.method}</p>
                        <p className="text-[10px] text-slate-400">{pay.date} • ID: {pay.id}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-black text-sm ${pay.type === 'CREDIT' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {pay.type === 'CREDIT' ? `+₹${pay.amount}` : `-₹${pay.amount}`}
                        </p>
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md ${pay.type === 'CREDIT' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                          {pay.status || 'Success'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <button 
                onClick={() => setIsWalletHistoryOpen(false)} 
                className="w-full bg-[#fc8019] hover:bg-[#e07015] text-slate-950 py-3 rounded-2xl font-black text-xs shadow-lg cursor-pointer transition"
              >
                Close History
              </button>
            </div>
          </div>
        )}

        {/* --- EDIT PROFILE & ADDRESS MODAL --- */}
        {isEditProfileModalOpen && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-slate-900 border border-amber-500/50 w-full max-w-sm rounded-[32px] p-6 text-white space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-sm font-black text-amber-400">Edit Name & Address</h3>
                <button onClick={() => setIsEditProfileModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                  <XCircle size={22} />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">Customer Name</label>
                  <input 
                    type="text" 
                    value={editProfileName} 
                    onChange={(e) => setEditProfileName(e.target.value)} 
                    className="w-full bg-slate-800 border border-slate-700 p-3 rounded-2xl text-xs font-bold text-white outline-none" 
                    placeholder="Enter your name" 
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">Street / Area Address</label>
                  <input 
                    type="text" 
                    value={address.street || ''} 
                    onChange={(e) => setAddress({...address, street: e.target.value})} 
                    className="w-full bg-slate-800 border border-slate-700 p-3 rounded-2xl text-xs font-bold text-white outline-none" 
                    placeholder="Enter street/area" 
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">Landmark</label>
                  <input 
                    type="text" 
                    value={address.landmark || ''} 
                    onChange={(e) => setAddress({...address, landmark: e.target.value})} 
                    className="w-full bg-slate-800 border border-slate-700 p-3 rounded-2xl text-xs font-bold text-white outline-none" 
                    placeholder="Enter landmark" 
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">District</label>
                  <input 
                    type="text" 
                    value={address.district || ''} 
                    onChange={(e) => setAddress({...address, district: e.target.value})} 
                    className="w-full bg-slate-800 border border-slate-700 p-3 rounded-2xl text-xs font-bold text-white outline-none" 
                    placeholder="Enter district" 
                  />
                </div>
              </div>

              <button 
                onClick={() => {
                  setAddress(prev => ({ ...prev, name: editProfileName }));
                  setIsEditProfileModalOpen(false);
                  toast.success('✓ Profile name & address updated successfully!');
                }} 
                className="w-full bg-[#fc8019] hover:bg-[#e07015] text-slate-950 py-3.5 rounded-2xl font-black text-xs shadow-lg cursor-pointer transition mt-2"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* --- INTERACTIVE SCRATCH CARD REWARD MODAL --- */}
        {scratchCardModal && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-500/60 w-full max-w-xs rounded-[36px] p-6 text-white text-center space-y-5 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl"></div>
              
              <div className="space-y-1">
                <span className="bg-amber-500/20 text-amber-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">Ichapuram Reward</span>
                <h3 className="text-xl font-black text-white mt-1">Scratch & Win! 🎁</h3>
                <p className="text-xs text-slate-400">You've unlocked a secret cashback reward.</p>
              </div>

              <div 
                onClick={handleScratchAction}
                className={`w-full h-36 rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all duration-500 relative overflow-hidden shadow-inner border-2 ${
                  isScratched 
                    ? 'bg-gradient-to-br from-emerald-600 to-teal-700 border-emerald-400' 
                    : 'bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 border-amber-300 animate-pulse'
                }`}
              >
                {!isScratched ? (
                  <div className="space-y-2 p-4">
                    <span className="text-3xl">🪙</span>
                    <p className="text-xs font-black text-slate-950 uppercase tracking-widest bg-white/40 px-3 py-1 rounded-xl backdrop-blur-sm">
                      Tap to Scratch Here!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1 animate-fadeIn">
                    <p className="text-[10px] uppercase font-bold text-emerald-200 tracking-wider">You Won</p>
                    <h2 className="text-4xl font-black text-white tracking-tight">₹{scratchCardModal.amount}</h2>
                    <p className="text-[10px] text-emerald-100 font-bold">Credited to Wallet 🟢</p>
                  </div>
                )}
              </div>

              <button 
                onClick={() => {
                  if (!isScratched) handleScratchAction();
                  setScratchCardModal(null);
                }} 
                className="w-full bg-[#fc8019] hover:bg-[#e07015] text-slate-950 py-3.5 rounded-2xl font-black text-xs shadow-lg cursor-pointer transition"
              >
                {isScratched ? "Awesome, Collect Money!" : "Scratch Now"}
              </button>
            </div>
          </div>
        )}

        {/* MAIN APP CONTENT (Direct Dashboard without Login module) */}
        <div className={`flex flex-col flex-1 w-full h-full font-sans relative overflow-hidden ${darkMode ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-900'}`}>

          {/* HEADER WITH LOGO */}
          <header className={`${darkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-white/90 border-b'} backdrop-blur-md border-b px-4 py-3 shrink-0 shadow-sm z-30 space-y-2`}>
            <div className="flex items-center justify-between">
              <button
                onClick={() => { setActiveTab('home'); setSelectedCategory(null); setSelectedShop(null); setIsPaymentScreen(false); setActiveTrackingOrder(null); }}
                className="flex items-center gap-2.5 text-left cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl overflow-hidden shadow-md border border-[#fc8019] flex items-center justify-center">
                  <img src="/src/assets/logo.png" alt="Foodiee Logo" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h1 className={`text-sm font-black leading-none ${darkMode ? 'text-white' : 'text-gray-900'}`}>Foodiee Portal</h1>
                  <p className="text-[10px] font-extrabold text-[#fc8019] mt-0.5">{address.name}</p>
                </div>
              </button>

              <div className="flex items-center gap-2">
                <button onClick={() => setShowNotificationModal(true)} className="relative p-2 rounded-xl bg-orange-50 dark:bg-slate-700 text-[#fc8019]" title="Offers">
                  <Bell size={16} />
                  {notifications.some(n => n.unread) && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
                  )}
                </button>

                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-black flex items-center gap-1.5 border shadow-sm transition ${darkMode ? 'bg-amber-500 text-slate-900 border-amber-400' : 'bg-slate-900 text-amber-400 border-slate-800'}`}
                >
                  {darkMode ? <Sun size={14} /> : <Moon size={14} />}
                  <span>{darkMode ? 'Day' : 'Night'}</span>
                </button>

                <button onClick={() => setActiveTab('wallet')} className="bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-full text-[11px] font-black text-[#fc8019] flex items-center gap-1.5 shadow-sm">
                  <Wallet size={13} /> ₹{walletBalance.toFixed(2)}
                </button>
                <button onClick={() => setIsDrawerOpen(true)} className="p-2 rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200">
                  <Menu size={18} />
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <div className={`flex items-center px-3.5 py-2.5 rounded-2xl gap-2.5 border ${darkMode ? 'bg-slate-700/80 border-slate-600 text-white' : 'bg-gray-100 border-gray-200 text-gray-800'} focus-within:border-[#fc8019]`}>
                <Search size={14} className="text-gray-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search dishes, groceries or address in Ichapuram..."
                  className="bg-transparent text-xs w-full outline-none font-bold placeholder:text-gray-400"
                />
                <button onClick={() => toast.success('🎤 Voice search listening...')} className="text-gray-400 hover:text-[#fc8019]">
                  <Mic size={15} />
                </button>
              </div>
            </div>
          </header>

          {/* NOTIFICATIONS MODAL */}
          {showNotificationModal && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
              <div className={`${darkMode ? 'bg-slate-800 text-white' : 'bg-white text-gray-900'} w-full max-w-sm p-5 rounded-3xl shadow-2xl space-y-4 text-xs`}>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-black text-sm flex items-center gap-1.5"><Bell size={15} className="text-[#fc8019]" /> Notifications</span>
                  <button onClick={() => { setShowNotificationModal(false); setNotifications(notifications.map(n => ({ ...n, unread: false }))); }} className="font-bold text-gray-400">✕</button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div key={notif.id} className={`p-3 rounded-2xl border ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-orange-50/50 border-orange-100'} space-y-1`}>
                      <div className="flex justify-between font-bold text-[#fc8019]">
                        <span>{notif.title}</span>
                        <span className="text-[9px] text-gray-400">{notif.time}</span>
                      </div>
                      <p className="text-[11px] text-gray-600 dark:text-gray-300">{notif.desc}</p>
                    </div>
                  ))}
                </div>

                <button onClick={() => { setShowNotificationModal(false); setNotifications(notifications.map(n => ({ ...n, unread: false }))); }} className="w-full bg-[#fc8019] text-white py-2.5 rounded-xl font-black">
                  Close
                </button>
              </div>
            </div>
          )}

          {/* RIGHT SIDE DRAWER */}
          {isDrawerOpen && (
            <div className="absolute inset-0 z-50 flex justify-end">
              <div className={`${darkMode ? 'bg-slate-800 text-white' : 'bg-white text-gray-900'} w-72 h-full shadow-2xl p-5 flex flex-col justify-between space-y-4 animate-fadeIn`}>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-200 dark:border-slate-700 pb-3">
                    <div className="flex items-center gap-2.5">
                      <img src={userPhoto} alt="Profile" className="w-10 h-10 rounded-full border border-[#fc8019] object-cover" />
                      <div>
                        <h3 className="text-xs font-black">{address.name}</h3>
                        <p className="text-[10px] text-gray-400">{address.mobile}</p>
                      </div>
                    </div>
                    <button onClick={() => setIsDrawerOpen(false)} className="text-xs font-bold text-gray-400">✕</button>
                  </div>

                  <div className="space-y-1.5 text-xs font-bold">
                    <label className="flex items-center gap-2.5 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer">
                      <Camera size={16} className="text-[#fc8019]" />
                      <span>Upload photo to DB</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                    </label>
                    <button onClick={() => { setActiveTab('wallet'); setIsDrawerOpen(false); }} className="w-full text-left p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2.5">
                      <Wallet size={16} className="text-[#fc8019]" /> My Wallet (₹{walletBalance.toFixed(2)})
                    </button>
                    <button onClick={() => { setActiveTab('favorites'); setIsDrawerOpen(false); }} className="w-full text-left p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2.5">
                      <Heart size={16} className="text-[#fc8019]" /> Favorites
                    </button>
                    <button onClick={() => { setActiveTab('history'); setIsDrawerOpen(false); }} className="w-full text-left p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2.5">
                      <Clock size={16} className="text-[#fc8019]" /> Order History
                    </button>
                    <button onClick={() => { setChatOpen(true); setIsDrawerOpen(false); }} className="w-full text-left p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2.5">
                      <MessageCircle size={16} className="text-[#fc8019]" /> Live Support
                    </button>
                    <button onClick={() => { setActiveTab('address'); setIsDrawerOpen(false); }} className="w-full text-left p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2.5">
                      <MapPin size={16} className="text-[#fc8019]" /> Saved Address
                    </button>
                  </div>
                </div>

                <button onClick={() => toast.success('✓ Session active')} className="w-full bg-slate-700 text-slate-200 p-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-400" /> Secure Portal Session
                </button>
              </div>
              <div className="flex-1 bg-black/40" onClick={() => setIsDrawerOpen(false)}></div>
            </div>
          )}

          {/* RATING MODAL */}
          {ratingModal && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className={`${darkMode ? 'bg-slate-800 text-white' : 'bg-white text-gray-900'} w-full max-w-sm p-5 rounded-3xl shadow-2xl space-y-3 text-xs`}>
                <h3 className="font-black text-center text-sm">Rate Order</h3>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} onClick={() => setStars(s)} className={`text-2xl ${s <= stars ? 'text-amber-400' : 'text-gray-300'}`}>★</button>
                  ))}
                </div>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Write a review..."
                  className={`w-full border p-3 rounded-xl outline-none text-xs ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'}`}
                />
                <div className="flex gap-2">
                  <button onClick={() => setRatingModal(null)} className="flex-1 bg-gray-200 dark:bg-slate-700 py-2.5 rounded-xl font-bold">Cancel</button>
                  <button onClick={() => submitRating(ratingModal)} className="flex-1 bg-[#fc8019] text-white py-2.5 rounded-xl font-bold">Submit</button>
                </div>
              </div>
            </div>
          )}

          {/* LIVE SUPPORT CHAT */}
          {chatOpen && (
            <div className="absolute inset-x-4 sm:right-6 sm:left-auto sm:w-96 bottom-16 z-50 p-2 animate-fadeIn">
              <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border rounded-3xl shadow-2xl p-4 space-y-3 text-xs`}>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-black text-sm flex items-center gap-1.5"><MessageCircle size={15} className="text-[#fc8019]" /> Support Chat</span>
                  <button onClick={() => setChatOpen(false)} className="font-bold text-gray-400">✕</button>
                </div>
                <div className="h-44 overflow-y-auto space-y-2 p-1 text-xs">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`p-2.5 rounded-2xl max-w-[80%] ${msg.sender === 'user' ? 'bg-[#fc8019] text-white ml-auto' : 'bg-gray-100 dark:bg-slate-700'}`}>
                      {msg.text}
                    </div>
                  ))}
                </div>
                <form onSubmit={sendChatMessage} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    placeholder="Type query..."
                    className={`flex-1 border p-2.5 rounded-2xl outline-none text-xs ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'}`}
                  />
                  <button type="submit" className="bg-[#fc8019] text-white px-4 rounded-2xl font-bold">Send</button>
                </form>
              </div>
            </div>
          )}

          {/* --- ADD MONEY MODAL --- */}
          {isAddMoneyModalOpen && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
              <div className="bg-slate-900 border border-amber-500/50 w-full max-w-sm rounded-3xl p-6 text-white space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-black text-amber-400">Add Money to Wallet</h3>
                  <button onClick={() => setIsAddMoneyModalOpen(false)} className="text-slate-400"><XCircle size={20} /></button>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Enter Custom Amount (₹)</label>
                  <input 
                    type="number" 
                    value={addAmountInput} 
                    onChange={(e) => setAddAmountInput(e.target.value)} 
                    placeholder="Enter amount (e.g. 100)" 
                    className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-sm font-black text-white outline-none" 
                  />
                </div>

                <button 
                  onClick={handleRazorpayPayment} 
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-3.5 rounded-2xl font-black text-xs shadow-lg flex items-center justify-center gap-2"
                >
                  <span>💳 Pay Securely with Razorpay</span>
                </button>

                <div className="space-y-2 pt-1 border-t border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Or Pay Directly via Apps</p>
                  <button onClick={() => handleUpiPayment('PhonePe', 'phonepe')} className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2.5 rounded-xl font-black text-xs shadow flex items-center justify-center gap-2">💜 Pay with PhonePe</button>
                  <button onClick={() => handleUpiPayment('Google Pay', 'gpay')} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl font-black text-xs shadow flex items-center justify-center gap-2">💙 Pay with Google Pay (GPay)</button>
                  <button onClick={() => handleUpiPayment('Paytm', 'paytm')} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-2.5 rounded-xl font-black text-xs shadow flex items-center justify-center gap-2">🤍 Pay with Paytm</button>
                </div>
              </div>
            </div>
          )}

          {/* MAIN SCROLLABLE CONTENT (Optimized grid for Laptop/Tablet) */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 pb-24">

            {successReceipt && (
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-xs space-y-0.5 text-gray-900 shadow">
                <p className="font-bold text-emerald-800 flex items-center gap-1"><CheckCircle2 size={14} /> Order Placed Successfully!</p>
                <p className="text-[11px]">ID: {successReceipt.id}</p>
              </div>
            )}

            {/* --- ZOMATO / SWIGGY STYLE LIVE DELIVERY TRACKING VIEW --- */}
            {activeTrackingOrder ? (
              <div className="space-y-3 pb-6 animate-fadeIn max-w-2xl mx-auto">
                <button onClick={() => setActiveTrackingOrder(null)} className="text-xs font-bold text-gray-400 flex items-center gap-1 hover:text-white transition">
                  <ArrowLeft size={14} /> Back to Dashboard
                </button>

                <div className="bg-slate-900 border border-slate-800 text-white rounded-[32px] overflow-hidden shadow-2xl space-y-4">
                  <div className="p-5 pb-2 flex justify-between items-center border-b border-slate-800">
                    <div>
                      <span className="bg-[#fc8019]/20 text-[#fc8019] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">Live Tracking</span>
                      <h3 className="text-base font-black mt-1 text-white">Order from {activeTrackingOrder.shopName || activeTrackingOrder.shop}</h3>
                      <p className="text-xs text-slate-400">Order ID: {activeTrackingOrder.orderId || activeTrackingOrder.id}</p>
                    </div>
                  </div>

                  <div className="w-full h-64 relative border-y border-slate-800">
                    <iframe 
                      title="Zomato Style Live Route Tracking" 
                      width="100%" 
                      height="100%" 
                      style={{ border: 0 }} 
                      loading="lazy" 
                      src={`https://maps.google.com/maps?q=${riderLocation.lat},${riderLocation.lng}&z=16&output=embed`}
                    ></iframe>
                    
                    <div className="absolute top-4 right-4 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-2xl text-center border border-emerald-400/40 backdrop-blur-md animate-pulse">
                      <p className="text-xl font-black leading-none">12</p>
                      <p className="text-[9px] font-bold uppercase tracking-wider opacity-90 mt-0.5">Mins</p>
                    </div>

                    <div className="absolute top-4 left-4 bg-slate-950/90 backdrop-blur-md border border-amber-500/30 px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5">
                      <span className="text-lg animate-bounce">🛵</span>
                      <div>
                        <p className="text-xs font-black text-white">Rider is on the way</p>
                        <p className="text-[10px] text-emerald-400 font-bold">{activeTrackingOrder.status || 'Out for delivery 🛵'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="px-5 space-y-3 pb-4">
                    <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-1">
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">Current Status</h4>
                      <p className="text-xs text-emerald-400 font-bold">{activeTrackingOrder.status || 'Out for delivery 🛵'}</p>
                    </div>

                    {((activeTrackingOrder.status || '').toLowerCase().includes('out for delivery') || activeTrackingOrder.deliveryOtp || activeTrackingOrder.delivery_otp) && (
                      <div className="bg-amber-500/20 border-2 border-amber-500 px-4 py-3 rounded-2xl text-center">
                        <p className="text-[11px] text-amber-300 font-black uppercase tracking-wider">Delivery OTP for Partner</p>
                        <h3 className="text-2xl font-black text-amber-400 tracking-[0.2em] mt-0.5">
                          {activeTrackingOrder.deliveryOtp || activeTrackingOrder.delivery_otp || '----'}
                        </h3>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : isPaymentScreen ? (
              <div className="space-y-4 max-w-2xl mx-auto">
                <button onClick={() => setIsPaymentScreen(false)} className="text-xs font-bold text-gray-400 flex items-center gap-1">
                  <ArrowLeft size={14} /> Back to Cart/Menu
                </button>

                <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} p-4 rounded-3xl border shadow-sm space-y-3`}>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-extrabold text-gray-400 uppercase flex items-center gap-1.5"><MapPin size={14} className="text-[#fc8019]" /> Delivery Address (GPS Synced)</span>
                    <button onClick={() => { setIsEditingAddress(!isEditingAddress); setEditableAddress(address); }} className="text-xs text-[#fc8019] font-black underline cursor-pointer">
                      {isEditingAddress ? 'Close' : 'Edit / GPS 📍'}
                    </button>
                  </div>

                  {!isEditingAddress ? (
                    <div className="space-y-1">
                      <p className="text-xs font-bold">{address.name} ({address.mobile})</p>
                      <p className="text-xs text-gray-400">
                        {address.houseNo ? `${address.houseNo}, ` : ''}{address.street}, {address.landmark ? `Near ${address.landmark}, ` : ''}{address.district}, {address.state} - {address.pincode}
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSaveEditedAddress} className="space-y-2.5 pt-2 border-t border-slate-700 text-xs">
                      <div>
                        <button type="button" onClick={detectLiveGpsLocation} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow cursor-pointer">
                          <Navigation size={14} /> Detect Live GPS Coordinates
                        </button>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold uppercase">Flat/House No</label>
                        <input type="text" value={editableAddress.houseNo || ''} onChange={(e) => setEditableAddress({...editableAddress, houseNo: e.target.value})} className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-xl text-xs font-bold text-white outline-none mt-0.5" />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold uppercase">Apartment / Area</label>
                        <input type="text" value={editableAddress.street} onChange={(e) => setEditableAddress({...editableAddress, street: e.target.value})} className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-xl text-xs font-bold text-white outline-none mt-0.5" required />
                      </div>
                      <div className="flex gap-2 pt-1">
                        <div className="flex-1">
                          <label className="text-[10px] text-slate-400 font-bold uppercase">District</label>
                          <input type="text" value={editableAddress.district} onChange={(e) => setEditableAddress({...editableAddress, district: e.target.value})} className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-xl text-xs font-bold text-white outline-none mt-0.5" required />
                        </div>
                        <div className="w-28">
                          <label className="text-[10px] text-slate-400 font-bold uppercase">Pincode</label>
                          <input type="text" value={editableAddress.pincode} onChange={(e) => setEditableAddress({...editableAddress, pincode: e.target.value})} className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-xl text-xs font-bold text-white outline-none mt-0.5" required />
                        </div>
                      </div>
                      <button type="submit" className="w-full bg-[#fc8019] text-slate-950 py-2.5 rounded-xl font-black text-xs shadow cursor-pointer mt-2">Save Address</button>
                    </form>
                  )}
                </div>

                <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} p-4 rounded-3xl border shadow-sm space-y-3 text-xs`}>
                  <span className="font-extrabold text-gray-400 uppercase">Payment Method</span>
                  {[
                    { name: `Wallet (₹${walletBalance.toFixed(2)})`, icon: '💰' },
                    { name: 'Razorpay Online', icon: '⚡' },
                    { name: 'COD', icon: '💵' }
                  ].map((method, idx) => (
                    <button key={idx} onClick={() => handlePayment(method.name)} className={`w-full border p-3.5 rounded-2xl text-xs font-bold flex justify-between items-center ${darkMode ? 'bg-slate-700 border-slate-600 hover:border-[#fc8019]' : 'bg-gray-50 border-gray-200'}`}>
                      <span>{method.icon} {method.name}</span>
                      <ChevronRight size={15} />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* FAVORITES */}
                {activeTab === 'favorites' && (
                  <div className="space-y-3 text-xs max-w-2xl mx-auto">
                    <h3 className="font-black text-gray-400 uppercase">Favorite Shops</h3>
                    {favorites.length === 0 ? (
                      <div className="text-center py-12 space-y-2">
                        <Heart size={36} className="mx-auto text-gray-400" />
                        <p className="text-gray-400 font-bold">No favorites added yet.</p>
                      </div>
                    ) : (
                      favorites.map(shop => (
                        <div key={shop.id} onClick={() => { setSelectedCategory('Food'); setSelectedShop(shop); }} className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} p-4 rounded-2xl border shadow-sm flex justify-between items-center cursor-pointer`}>
                          <div>
                            <h4 className="text-sm font-black text-[#fc8019]">{shop.name}</h4>
                            <p className="text-xs text-gray-400">{shop.category}</p>
                          </div>
                          <ChevronRight size={16} />
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* SAVED ADDRESSES */}
                {activeTab === 'address' && (
                  <div className="space-y-4 text-xs animate-fadeIn max-w-2xl mx-auto">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-gray-400 uppercase tracking-wider text-xs">Your Saved Addresses</h3>
                      <span className="text-xs text-amber-400 font-bold">Ichapuram Zone 📍</span>
                    </div>

                    <div className="space-y-3">
                      {savedAddresses.map((addr) => (
                        <div key={addr.id} className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-slate-700/80 p-5 rounded-3xl shadow-xl flex justify-between items-start relative overflow-hidden group hover:border-[#fc8019] transition-all">
                          <div className="space-y-1.5 relative z-10">
                            <span className="bg-[#fc8019]/20 text-[#fc8019] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">{addr.type}</span>
                            <p className="font-black text-white mt-1 text-xs">{addr.name} • <span className="text-slate-400 font-medium">{addr.mobile}</span></p>
                            <p className="text-xs text-slate-300 leading-relaxed">
                              {addr.houseNo ? `${addr.houseNo}, ` : ''}{addr.street}, {addr.landmark ? `Near ${addr.landmark}, ` : ''}{addr.district}, {addr.state} - {addr.pincode}
                            </p>
                          </div>
                          <button onClick={() => { setAddress(addr); toast.success(`✓ Active delivery address set to ${addr.type}`); }} className="bg-slate-800 hover:bg-[#fc8019] text-white hover:text-slate-950 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer shadow-md relative z-10">Select</button>
                        </div>
                      ))}
                    </div>

                    <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-amber-500/40 p-6 rounded-[32px] space-y-4 shadow-2xl relative overflow-hidden mt-6">
                      <div className="flex justify-between items-center relative z-10 border-b border-slate-800 pb-3">
                        <h4 className="font-black text-amber-400 uppercase text-xs flex items-center gap-2">
                          <span>📍</span> Add Complete Address with GPS
                        </h4>
                        <button type="button" onClick={detectGpsForNewAddress} className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-white px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-lg cursor-pointer">
                          <Navigation size={13} /> Detect GPS 📌
                        </button>
                      </div>

                      <div className="space-y-3 relative z-10">
                        <div>
                          <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Name</label>
                          <input type="text" value={newAddressInput.name} onChange={(e) => setNewAddressInput({...newAddressInput, name: e.target.value})} placeholder="Full Name" className="w-full bg-slate-800/90 border border-slate-700/80 p-3 rounded-2xl text-xs font-bold text-white outline-none focus:border-[#fc8019]" required />
                        </div>
                        <div>
                          <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Apartment / Area</label>
                          <input type="text" value={newAddressInput.street} onChange={(e) => setNewAddressInput({...newAddressInput, street: e.target.value})} placeholder="Area/Street" className="w-full bg-slate-800/90 border border-slate-700/80 p-3 rounded-2xl text-xs font-bold text-white outline-none focus:border-[#fc8019]" required />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">District</label>
                            <input type="text" value={newAddressInput.district} onChange={(e) => setNewAddressInput({...newAddressInput, district: e.target.value})} placeholder="District" className="w-full bg-slate-800/90 border border-slate-700/80 p-3 rounded-2xl text-xs font-bold text-white outline-none focus:border-[#fc8019]" required />
                          </div>
                          <div>
                            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Pincode</label>
                            <input type="text" value={newAddressInput.pincode} onChange={(e) => setNewAddressInput({...newAddressInput, pincode: e.target.value})} placeholder="Pincode" className="w-full bg-slate-800/90 border border-slate-700/80 p-3 rounded-2xl text-xs font-bold text-white outline-none focus:border-[#fc8019]" required />
                          </div>
                        </div>
                      </div>

                      <button onClick={handleAddNewAddress} className="w-full bg-gradient-to-r from-[#fc8019] via-amber-500 to-yellow-500 text-slate-950 py-3.5 rounded-2xl font-black text-xs shadow-xl mt-2 cursor-pointer transition">
                        Save Complete Address 📍
                      </button>
                    </div>
                  </div>
                )}

                {/* HOME (Laptop/Tablet optimized grid layout) */}
                {activeTab === 'home' && !selectedCategory && (
                  <div className="space-y-6 max-w-4xl mx-auto pb-6">
                    
                    {/* PROMO BANNER */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-rose-500 via-orange-500 to-amber-600 p-6 sm:p-8 rounded-3xl text-white shadow-xl">
                      <div className="flex justify-between items-center relative z-10">
                        <div className="space-y-2">
                          <span className="bg-white/20 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">Special Offer</span>
                          <p className="font-black text-xl sm:text-2xl tracking-tight">🎉 Ichapuram Food Fest & Delivery</p>
                          <p className="text-xs sm:text-sm opacity-90 font-medium">20% OFF on local tiffins, groceries & fast print services!</p>
                        </div>
                        <div className="w-16 h-16 rounded-3xl bg-white/25 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner border border-white/30 hidden sm:flex">🍕</div>
                      </div>
                    </div>

                    {/* 3D CATEGORIES GRID */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">Explore Categories</h3>
                        <span className="text-xs text-[#fc8019] font-bold">Ichapuram Specials</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                          { name: 'Food', icon: '🍲', desc: 'Restaurants & Tiffins', bg: 'bg-gradient-to-br from-amber-500/25 via-amber-600/10 to-yellow-500/5', border: 'border-amber-500/40 hover:border-amber-500' },
                          { name: 'Grocery', icon: '🛒', desc: 'Daily Essentials & Mart', bg: 'bg-gradient-to-br from-emerald-500/25 via-teal-600/10 to-green-500/5', border: 'border-emerald-500/40 hover:border-emerald-500' },
                          { name: 'Print', icon: '🖨️', desc: 'Document Print Service', bg: 'bg-gradient-to-br from-blue-500/25 via-indigo-600/10 to-cyan-500/5', border: 'border-blue-500/40 hover:border-blue-500' }
                        ].map(cat => (
                          <button key={cat.name} onClick={() => setSelectedCategory(cat.name)} className={`relative group overflow-hidden ${cat.bg} border ${cat.border} p-6 rounded-3xl flex flex-col items-center text-center cursor-pointer transition-all duration-300 shadow-lg`}>
                            <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-md flex items-center justify-center text-3xl mb-3 group-hover:scale-110 transition-transform">{cat.icon}</div>
                            <span className="text-sm font-black tracking-tight text-gray-900 dark:text-white group-hover:text-[#fc8019] transition-colors">{cat.name}</span>
                            <p className="text-[11px] text-slate-400 mt-1">{cat.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* RECENT ORDER WIDGET */}
                    {backendOrders.length > 0 && (() => {
                      const latestOrder = backendOrders[0];
                      return (
                        <div className="space-y-2 pt-2">
                          <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">Recent Order Status</h3>
                            <span className="text-xs text-amber-400 font-bold animate-pulse">Tap to track 🛵</span>
                          </div>

                          <div 
                            onClick={() => setActiveTrackingOrder(latestOrder)}
                            className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-amber-500/40 p-4 sm:p-5 rounded-3xl shadow-xl cursor-pointer hover:border-amber-500 transition-all"
                          >
                            <div className="flex justify-between items-center">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="bg-amber-500/20 text-amber-400 text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase">
                                    {latestOrder.status || 'Pending Approval'}
                                  </span>
                                  <span className="text-xs text-slate-400 font-bold">{latestOrder.orderId || `#ORD-${latestOrder.id}`}</span>
                                </div>
                                <h4 className="text-sm font-black text-white">{latestOrder.shopName || latestOrder.shop}</h4>
                                <p className="text-xs text-slate-400">{latestOrder.items}</p>
                              </div>

                              <div className="text-right space-y-1">
                                <span className="text-sm font-black text-[#fc8019]">₹{latestOrder.totalAmount || latestOrder.total}</span>
                                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                                  <ChevronRight size={18} />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                  </div>
                )}

                {/* STORES */}
                {(selectedCategory === 'Food' || selectedCategory === 'Grocery') && !selectedShop && (
                  <div className="space-y-4 max-w-4xl mx-auto">
                    <button onClick={() => setSelectedCategory(null)} className="text-xs font-bold text-gray-400 flex items-center gap-1 hover:text-white"><ArrowLeft size={14} /> Back to Categories</button>
                    <h3 className="text-xs font-black text-gray-400 uppercase">Available {selectedCategory} Stores in Ichapuram</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {dynamicShops.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-10 col-span-2">No {selectedCategory.toLowerCase()} shops added by owner yet.</p>
                      ) : (
                        dynamicShops.map(shop => (
                          <div key={shop.id} onClick={() => setSelectedShop(shop)} className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} p-4 rounded-3xl border shadow-md flex items-center gap-4 cursor-pointer hover:border-[#fc8019] transition`}>
                            <img src={shop.imageUrl} alt={shop.name} className="w-20 h-20 rounded-2xl object-cover shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-black text-[#fc8019] truncate">{shop.name}</h4>
                                <button onClick={(e) => { e.stopPropagation(); toggleFavorite(shop); }} className="text-sm">{favorites.some(f => f.id === shop.id) ? '❤️' : '🤍'}</button>
                              </div>
                              <p className="text-xs text-gray-400 mt-0.5">{shop.rating} • {shop.time}</p>
                              <p className="text-[11px] text-slate-500 truncate mt-1">{shop.address}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* SHOP MENU */}
                {(selectedCategory === 'Food' || selectedCategory === 'Grocery') && selectedShop && (
                  <div className="space-y-4 animate-fadeIn max-w-4xl mx-auto pb-16">
                    <button onClick={() => setSelectedShop(null)} className="text-xs font-bold text-slate-400 flex items-center gap-1 hover:text-white transition">
                      <ArrowLeft size={14} /> Back to Shops
                    </button>

                    <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-slate-950 p-6 rounded-3xl shadow-xl space-y-1.5 relative overflow-hidden">
                      <h3 className="text-lg font-black tracking-tight">{selectedShop.name}</h3>
                      <p className="text-xs font-bold opacity-90">{selectedShop.address} • {selectedShop.rating}</p>
                    </div>

                    {Object.keys(selectedShop.categories).length === 0 ? (
                      <div className="text-center py-16 space-y-2">
                        <span className="text-3xl">🍽️</span>
                        <p className="text-xs text-slate-400 font-bold">No menu items available in this shop yet.</p>
                      </div>
                    ) : (
                      Object.entries(selectedShop.categories).map(([categoryName, itemsList]) => (
                        <div key={categoryName} className="space-y-3">
                          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#fc8019]"></span>
                            <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider">{categoryName} ({itemsList.length})</h4>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {itemsList.map((item, index) => {
                              const itemName = item.itemName || item.name || 'Item';
                              const itemPrice = item.price || 0;
                              const itemId = item.id || index;
                              const itemImage = item.imageUrl && item.imageUrl.trim() !== '' ? item.imageUrl : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c';
                              const cartItem = cart.find(c => c.id === itemId);

                              return (
                                <div key={itemId} className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between gap-4 shadow-md hover:border-amber-500/50 transition">
                                  <img src={itemImage} alt={itemName} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                                  <div className="flex-1 min-w-0 space-y-1">
                                    <p className="font-black text-xs text-white truncate">{itemName}</p>
                                    <p className="text-[#fc8019] font-black text-xs">₹{itemPrice}</p>
                                    <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md font-bold">Fresh</span>
                                  </div>

                                  {cartItem ? (
                                    <div className="flex items-center bg-gradient-to-r from-[#fc8019] to-amber-500 text-slate-950 rounded-xl px-3 py-1.5 gap-2 font-black shrink-0 text-xs shadow">
                                      <button onClick={() => setCart(cart.map(c => c.id === itemId ? {...c, qty: c.qty - 1} : c).filter(c => c.qty > 0))}><Minus size={13}/></button>
                                      <span>{cartItem.qty}</span>
                                      <button onClick={() => setCart(cart.map(c => c.id === itemId ? {...c, qty: c.qty + 1} : c))}><Plus size={13}/></button>
                                    </div>
                                  ) : (
                                    <button onClick={() => setCart([...cart, { id: itemId, name: itemName, price: itemPrice, qty: 1 }])} className="bg-slate-800 hover:bg-[#fc8019] text-[#fc8019] hover:text-slate-950 border border-slate-700 px-4 py-2 rounded-xl font-black text-xs shrink-0 transition shadow">
                                      ADD +
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* PRINT */}
                {selectedCategory === 'Print' && (
                  <div className="space-y-4 max-w-xl mx-auto text-xs">
                    <button onClick={() => setSelectedCategory(null)} className="text-xs font-bold text-gray-400 flex items-center gap-1"><ArrowLeft size={14} /> Back</button>
                    <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} p-6 rounded-3xl border space-y-4 shadow-lg`}>
                      <h3 className="font-black text-sm flex items-center gap-2 text-[#fc8019]">🖨️ Document Print Service</h3>
                      <label className="block bg-slate-900 text-white text-center py-4 rounded-2xl cursor-pointer font-bold border border-slate-700">
                        <span>📁 Choose Document File</span>
                        <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => { if (e.target.files[0]) { setPrintDetails({...printDetails, fileName: e.target.files[0].name}); toast.success('✓ Uploaded!'); } }} />
                      </label>
                      {printDetails.fileName && <p className="text-xs text-emerald-400 font-bold">File: {printDetails.fileName}</p>}
                      <button onClick={() => { if(!printDetails.fileName) { toast.error('Upload doc'); return; } setIsPaymentScreen(true); }} className="w-full bg-[#fc8019] text-slate-950 py-3.5 rounded-2xl font-black text-xs shadow-lg">Proceed to Print Payment</button>
                    </div>
                  </div>
                )}

                {/* WALLET */}
                {activeTab === 'wallet' && (
                  <div className="space-y-4 max-w-xl mx-auto text-xs">
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 rounded-3xl text-white shadow-xl space-y-3">
                      <p className="text-xs uppercase font-bold tracking-wider opacity-90">Wallet Balance (Real-Time)</p>
                      <h2 className="text-3xl font-black">₹{walletBalance.toFixed(2)}</h2>
                      <button onClick={() => setIsAddMoneyModalOpen(true)} className="w-full bg-slate-900 hover:bg-slate-950 text-white py-3.5 rounded-2xl font-black text-xs shadow-md mt-2 flex items-center justify-center gap-2 cursor-pointer">+ Add Money 💳</button>
                    </div>

                    <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} p-5 rounded-3xl border space-y-3 shadow-sm`}>
                      <h3 className="font-black text-xs text-[#fc8019] uppercase tracking-wider">Recent Transactions</h3>
                      {paymentHistory.map((pay, i) => (
                        <div key={i} className="flex justify-between items-center text-xs border-b border-slate-700/50 pb-2.5">
                          <div><p className="font-bold">{pay.method}</p><p className="text-[10px] text-gray-400">{pay.date}</p></div>
                          <div className="text-right">
                            <p className={`font-black ${pay.type === 'CREDIT' ? 'text-emerald-400' : 'text-rose-400'}`}>{pay.type === 'CREDIT' ? `+₹${pay.amount}` : `-₹${pay.amount}`}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ORDER HISTORY */}
                {activeTab === 'history' && (
                  <div className="space-y-4 max-w-2xl mx-auto text-xs">
                    <div className="flex justify-between items-center">
                      <h3 className="font-black text-gray-400 uppercase">My Orders & Live Status</h3>
                      <button onClick={() => { if (phone) { fetch(`http://localhost:8080/api/orders/customer/${phone}`).then(res => res.json()).then(data => setBackendOrders(data)); toast.success('Refreshed!'); } }} className="text-xs bg-slate-800 text-amber-400 px-3 py-1.5 rounded-xl border border-slate-700">Refresh 🔄</button>
                    </div>

                    {backendOrders.length === 0 ? (
                      <div className="text-center py-16 text-xs text-gray-400">📦 No active or past orders found.</div>
                    ) : (
                      backendOrders.map((ord, i) => (
                        <div key={i} className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} p-5 rounded-3xl border space-y-3 shadow-md`}>
                          <div className="flex justify-between items-center font-black">
                            <span className="text-amber-400">{ord.orderId || `#ORD-${ord.id}`}</span>
                            <span className="text-[#fc8019] text-sm">₹{ord.totalAmount || ord.total}</span>
                          </div>
                          <p className="text-slate-300"><b>Shop:</b> {ord.shopName || ord.shop}</p>
                          <p className="text-slate-400"><b>Items:</b> {ord.items}</p>
                          <div className="flex justify-between items-center pt-2 border-t border-slate-700/60">
                            <span className="font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl">{ord.status}</span>
                            <button onClick={() => setActiveTrackingOrder(ord)} className="bg-[#fc8019] text-slate-950 px-4 py-2 rounded-xl font-black">
                              Track 🛵
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* PROFILE */}
                {activeTab === 'profile' && (
                  <div className="space-y-4 max-w-md mx-auto text-xs animate-fadeIn">
                    <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} p-6 rounded-3xl border text-center space-y-3 relative shadow-xl`}>
                      <button 
                        onClick={() => {
                          setEditProfileName(address.name || '');
                          setIsEditProfileModalOpen(true);
                        }} 
                        className="absolute top-4 right-4 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 px-3.5 py-1.5 rounded-xl font-black text-xs transition cursor-pointer"
                      >
                        ✏️ Edit Profile
                      </button>

                      <img src={userPhoto} alt="Profile" className="w-20 h-20 rounded-2xl mx-auto border-2 border-[#fc8019] object-cover shadow-lg" />
                      <h3 className="font-black text-base text-white">{address.name}</h3>
                      <p className="text-slate-400">{address.mobile}</p>
                      <p className="text-xs text-slate-400"><b>{address.type || 'Active'}:</b> {address.street}, {address.district}</p>
                    </div>
                  </div>
                )}
              </>
            )}

          </main>

          {/* FLOATING PROCEED TO PAY BAR */}
          {!isPaymentScreen && !activeTrackingOrder && selectedCategory !== 'Print' && cart.length > 0 && (
            <div className="absolute bottom-16 sm:bottom-4 inset-x-4 sm:inset-x-8 p-4 bg-slate-900/95 backdrop-blur-xl border border-slate-700 z-40 shadow-2xl rounded-3xl flex justify-between items-center">
              <div>
                <p className="text-[10px] text-slate-400 font-extrabold uppercase">{cart.reduce((a, b) => a + b.qty, 0)} Items Added</p>
                <p className="text-sm font-black text-[#fc8019]">₹{subtotal + deliveryFee}</p>
              </div>
              <button onClick={() => setIsPaymentScreen(true)} className="bg-gradient-to-r from-[#fc8019] to-amber-500 text-slate-950 px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2 shadow-lg">
                <span>Proceed to Pay</span> <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* TABLET / LAPTOP COMPATIBLE BOTTOM NAVIGATION BAR */}
          <nav className={`absolute bottom-0 inset-x-0 h-16 ${darkMode ? 'bg-slate-800/95 border-slate-700 text-slate-400' : 'bg-white/95 border-gray-200 text-gray-500'} backdrop-blur-md border-t flex justify-around items-center px-4 z-50 text-xs font-bold`}>
            <button onClick={() => { setActiveTab('home'); setSelectedCategory(null); setSelectedShop(null); setIsPaymentScreen(false); setActiveTrackingOrder(null); }} className={`flex items-center gap-2 transition ${activeTab === 'home' ? 'text-[#fc8019] scale-105' : 'hover:text-white'}`}>
              <ShoppingBag size={18} /><span>Home</span>
            </button>
            <button onClick={() => { setActiveTab('history'); setSelectedCategory(null); setSelectedShop(null); setIsPaymentScreen(false); setActiveTrackingOrder(null); }} className={`flex items-center gap-2 transition ${activeTab === 'history' ? 'text-[#fc8019] scale-105' : 'hover:text-white'}`}>
              <Clock size={18} /><span>History</span>
            </button>
            <button onClick={() => { setActiveTab('wallet'); setSelectedCategory(null); setSelectedShop(null); setIsPaymentScreen(false); setActiveTrackingOrder(null); }} className={`flex items-center gap-2 transition ${activeTab === 'wallet' ? 'text-[#fc8019] scale-105' : 'hover:text-white'}`}>
              <Wallet size={18} /><span>Wallet</span>
            </button>
            <button onClick={() => { setActiveTab('profile'); setSelectedCategory(null); setSelectedShop(null); setIsPaymentScreen(false); setActiveTrackingOrder(null); }} className={`flex items-center gap-2 transition ${activeTab === 'profile' ? 'text-[#fc8019] scale-105' : 'hover:text-white'}`}>
              <User size={18} /><span>Profile</span>
            </button>
          </nav>

        </div>

      </div>
    </div>
  );
}