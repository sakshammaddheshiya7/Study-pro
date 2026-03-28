import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, doc, getDoc } from '../../config/firebase';
import {
  FiArrowLeft, FiInstagram, FiYoutube, FiGlobe, FiPhone,
  FiMail, FiMapPin, FiMessageCircle, FiExternalLink, FiCopy
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AdminInfo() {
  const navigate = useNavigate();
  const [branding, setBranding] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'branding'));
        if (snap.exists()) setBranding(snap.data());
      } catch (error) { console.error(error); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const openLink = (url) => {
    if (!url) return;
    let finalUrl = url;
    if (!url.startsWith('http')) finalUrl = 'https://' + url;
    window.open(finalUrl, '_blank');
  };

  const copyText = (text) => {
    navigator.clipboard?.writeText(text);
    toast.success('Copied!');
  };

  if (loading) {
    return (
      <div className="page-container pt-4 flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!branding) {
    return (
      <div className="page-container pt-4">
        <div className="flex items-center space-x-3 mb-6">
          <button onClick={() => navigate('/student')} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
            <FiArrowLeft size={18} />
          </button>
          <h1 className="text-xl font-bold text-dark-800">About</h1>
        </div>
        <div className="card p-12 text-center">
          <p className="text-5xl mb-3">👤</p>
          <p className="text-dark-500">Admin info not set up yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container pt-4 animate-fade-in">
      <div className="flex items-center space-x-3 mb-6">
        <button onClick={() => navigate('/student')} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
          <FiArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-bold text-dark-800">About Us</h1>
      </div>

      {/* Profile Hero */}
      <div className="card mb-5 text-center overflow-hidden" style={{ borderTop: `4px solid ${branding.themeColor || '#F97316'}` }}>
        {branding.logoUrl && (
          <img src={branding.logoUrl} alt="Logo" className="w-16 h-16 mx-auto rounded-xl mb-3 object-contain" />
        )}
        <img
          src={branding.adminPhoto || `https://ui-avatars.com/api/?name=${branding.adminName}&background=F97316&color=fff&size=120`}
          alt="Admin"
          className="w-24 h-24 rounded-full mx-auto mb-3 border-4 border-white shadow-lg object-cover"
        />
        <h2 className="text-xl font-extrabold text-dark-800">{branding.adminName || 'Admin'}</h2>
        {branding.instituteName && (
          <p className="text-sm text-primary-500 font-semibold mt-1">{branding.instituteName}</p>
        )}
        {branding.tagline && (
          <p className="text-sm text-dark-400 italic mt-2">"{branding.tagline}"</p>
        )}
        {branding.aboutText && (
          <p className="text-sm text-dark-500 mt-3 leading-relaxed max-w-lg mx-auto">{branding.aboutText}</p>
        )}
      </div>

      {/* Custom Message */}
      {branding.customMessage && (
        <div className="card mb-5 bg-primary-50 border-l-4" style={{ borderColor: branding.themeColor || '#F97316' }}>
          <p className="text-sm text-dark-700 leading-relaxed">📢 {branding.customMessage}</p>
        </div>
      )}

      {/* Social Links */}
      {branding.showSocialLinks && (
        <div className="mb-5">
          <h3 className="section-title mb-3">Follow Us</h3>
          <div className="grid grid-cols-2 gap-3">
            {branding.instagramId && (
              <button onClick={() => openLink(`https://instagram.com/${branding.instagramId.replace('@', '')}`)}
                className="card p-4 flex items-center space-x-3 hover:shadow-card-hover active:scale-95 transition-all">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-amber-500 rounded-xl flex items-center justify-center">
                  <FiInstagram className="text-white" size={18} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-dark-800">Instagram</p>
                  <p className="text-xs text-dark-400">{branding.instagramId}</p>
                </div>
              </button>
            )}
            {branding.telegramId && (
              <button onClick={() => openLink(branding.telegramId.startsWith('http') ? branding.telegramId : `https://t.me/${branding.telegramId.replace('@', '')}`)}
                className="card p-4 flex items-center space-x-3 hover:shadow-card-hover active:scale-95 transition-all">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                  <FiMessageCircle className="text-white" size={18} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-dark-800">Telegram</p>
                  <p className="text-xs text-dark-400">{branding.telegramId}</p>
                </div>
              </button>
            )}
            {branding.youtubeLink && (
              <button onClick={() => openLink(branding.youtubeLink)}
                className="card p-4 flex items-center space-x-3 hover:shadow-card-hover active:scale-95 transition-all">
                <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                  <FiYoutube className="text-white" size={18} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-dark-800">YouTube</p>
                  <p className="text-xs text-dark-400">Watch Videos</p>
                </div>
              </button>
            )}
            {branding.websiteUrl && (
              <button onClick={() => openLink(branding.websiteUrl)}
                className="card p-4 flex items-center space-x-3 hover:shadow-card-hover active:scale-95 transition-all">
                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                  <FiGlobe className="text-white" size={18} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-dark-800">Website</p>
                  <p className="text-xs text-dark-400 truncate max-w-[100px]">{branding.websiteUrl}</p>
                </div>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Contact */}
      {branding.showContactInfo && (branding.emailContact || branding.phoneNumber || branding.whatsappNumber) && (
        <div className="mb-5">
          <h3 className="section-title mb-3">Contact</h3>
          <div className="card space-y-3">
            {branding.emailContact && (
              <button onClick={() => copyText(branding.emailContact)} className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                <div className="flex items-center space-x-3">
                  <FiMail className="text-primary-500" size={18} />
                  <span className="text-sm text-dark-700">{branding.emailContact}</span>
                </div>
                <FiCopy className="text-dark-300" size={14} />
              </button>
            )}
            {branding.phoneNumber && (
              <button onClick={() => copyText(branding.phoneNumber)} className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                <div className="flex items-center space-x-3">
                  <FiPhone className="text-primary-500" size={18} />
                  <span className="text-sm text-dark-700">{branding.phoneNumber}</span>
                </div>
                <FiCopy className="text-dark-300" size={14} />
              </button>
            )}
            {branding.whatsappNumber && (
              <button onClick={() => openLink(`https://wa.me/${branding.whatsappNumber.replace(/[^0-9]/g, '')}`)} className="w-full flex items-center justify-between p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-all">
                <div className="flex items-center space-x-3">
                  <FiMessageCircle className="text-green-600" size={18} />
                  <span className="text-sm text-dark-700">WhatsApp</span>
                </div>
                <FiExternalLink className="text-green-500" size={14} />
              </button>
            )}
            {branding.address && (
              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl">
                <FiMapPin className="text-primary-500 mt-0.5" size={18} />
                <span className="text-sm text-dark-700">{branding.address}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* QR Code */}
      {branding.showQRToStudents && branding.qrCodeImage && (
        <div className="card mb-5 text-center">
          <h3 className="section-title mb-3">Scan QR Code</h3>
          <img src={branding.qrCodeImage} alt="QR" className="w-48 h-48 mx-auto rounded-2xl border-2 border-gray-200 p-1 bg-white" />
          <p className="text-xs text-dark-400 mt-3">Scan to connect</p>
        </div>
      )}

      <p className="text-center text-xs text-dark-400 py-4">Developer: Saksham Gupta</p>
    </div>
  );
}