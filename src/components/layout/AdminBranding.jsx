import React, { useState, useEffect } from 'react';
import { db, doc, setDoc, getDoc, serverTimestamp } from '../../config/firebase';
import { useDatabase } from '../../contexts/DatabaseContext';
import {
  FiUser, FiSave, FiInstagram, FiYoutube, FiGlobe,
  FiPhone, FiMail, FiMapPin, FiImage, FiLink,
  FiMessageCircle, FiCheckCircle, FiEye, FiRefreshCw
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const DEFAULT_BRANDING = {
  adminName: 'Admin',
  instituteName: '',
  tagline: '',
  aboutText: '',
  adminPhoto: '',
  logoUrl: '',
  instagramId: '',
  telegramId: '',
  youtubeLink: '',
  websiteUrl: '',
  whatsappNumber: '',
  emailContact: '',
  phoneNumber: '',
  address: '',
  upiId: '',
  qrCodeImage: '',
  showQRToStudents: true,
  showSocialLinks: true,
  showContactInfo: true,
  customBanner: '',
  customMessage: '',
  themeColor: '#F97316'
};

export default function AdminBranding() {
  const { addLog, uploadFile } = useDatabase();
  const [branding, setBranding] = useState({ ...DEFAULT_BRANDING });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [uploading, setUploading] = useState('');

  useEffect(() => { loadBranding(); }, []);

  const loadBranding = async () => {
    try {
      setLoading(true);
      const snap = await getDoc(doc(db, 'settings', 'branding'));
      if (snap.exists()) {
        setBranding({ ...DEFAULT_BRANDING, ...snap.data() });
      }
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const updateField = (key, value) => {
    setBranding(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleImageUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Select an image'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Max 5MB'); return; }
    try {
      setUploading(field);
      const url = await uploadFile(file, 'branding');
      updateField(field, url);
      toast.success('Image uploaded');
    } catch (error) { toast.error('Upload failed'); }
    finally { setUploading(''); }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await setDoc(doc(db, 'settings', 'branding'), {
        ...branding,
        updatedAt: serverTimestamp()
      }, { merge: true });
      setHasChanges(false);
      toast.success('Branding saved! Students will see changes instantly.');
      await addLog({ type: 'success', message: 'Branding updated', details: 'Admin profile and links saved' });
    } catch (error) { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const generateQRDataUrl = (text) => {
    // Simple QR placeholder — in production use a QR library
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FiUser },
    { id: 'social', label: 'Social & Links', icon: FiLink },
    { id: 'contact', label: 'Contact', icon: FiPhone },
    { id: 'qr', label: 'QR & Payment', icon: FiImage },
    { id: 'display', label: 'Display Settings', icon: FiEye }
  ];

  if (loading) {
    return (
      <div className="page-container pt-16 md:pt-6 flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="page-container pt-16 md:pt-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-dark-800 flex items-center space-x-2">
            <FiUser className="text-primary-500" />
            <span>Branding & Links</span>
          </h1>
          <p className="text-dark-400 text-sm mt-1">Your profile visible to students</p>
        </div>
        <button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className="btn-primary py-2.5 px-5 flex items-center space-x-2 disabled:opacity-40"
        >
          {saving ? <FiRefreshCw className="animate-spin" size={16} /> : <FiSave size={16} />}
          <span>{saving ? 'Saving...' : 'Save All'}</span>
        </button>
      </div>

      {/* Unsaved Banner */}
      {hasChanges && (
        <div className="card mb-5 bg-amber-50 border-l-4 border-amber-500 animate-slide-up">
          <div className="flex items-center justify-between">
            <p className="text-sm text-amber-700 font-medium">⚠️ You have unsaved changes</p>
            <button onClick={handleSave} className="px-3 py-1 bg-amber-500 text-white rounded-lg text-xs font-bold">Save</button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-2xl p-1 mb-6 overflow-x-auto no-scrollbar">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all flex-shrink-0 ${
                activeTab === tab.id ? 'bg-white text-primary-600 shadow-sm' : 'text-dark-400'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-5 animate-slide-up">
          {/* Photo & Name */}
          <div className="card">
            <h3 className="font-bold text-dark-700 mb-4">Admin Profile</h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-5">
              <div className="relative">
                <img
                  src={branding.adminPhoto || `https://ui-avatars.com/api/?name=${branding.adminName}&background=F97316&color=fff&size=120`}
                  alt="Admin"
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-gray-200"
                />
                <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-primary-600 transition-all">
                  <FiImage size={14} />
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'adminPhoto')} />
                </label>
              </div>
              <div className="flex-1 w-full">
                <div className="mb-3">
                  <label className="block text-xs font-semibold text-dark-500 mb-1 uppercase">Your Name</label>
                  <input type="text" value={branding.adminName} onChange={(e) => updateField('adminName', e.target.value)} placeholder="e.g., Saksham Gupta" className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-500 mb-1 uppercase">Institute / Channel Name</label>
                  <input type="text" value={branding.instituteName} onChange={(e) => updateField('instituteName', e.target.value)} placeholder="e.g., SG Academy" className="input-field" />
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-dark-500 mb-1 uppercase">Tagline</label>
              <input type="text" value={branding.tagline} onChange={(e) => updateField('tagline', e.target.value)} placeholder="e.g., Making JEE/NEET Easy!" className="input-field" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-dark-500 mb-1 uppercase">About</label>
              <textarea value={branding.aboutText} onChange={(e) => updateField('aboutText', e.target.value)} placeholder="Tell students about yourself..." rows={3} className="input-field resize-y" />
            </div>
          </div>

          {/* Logo */}
          <div className="card">
            <h3 className="font-bold text-dark-700 mb-3">Institute Logo</h3>
            <div className="flex items-center space-x-4">
              {branding.logoUrl && (
                <img src={branding.logoUrl} alt="Logo" className="w-16 h-16 rounded-xl object-contain border" />
              )}
              <div className="flex-1">
                <input type="text" value={branding.logoUrl} onChange={(e) => updateField('logoUrl', e.target.value)} placeholder="Logo URL" className="input-field text-sm mb-2" />
                <label className="btn-secondary text-xs inline-flex items-center space-x-1 cursor-pointer px-3 py-2">
                  <FiImage size={12} />
                  <span>{uploading === 'logoUrl' ? 'Uploading...' : 'Upload Logo'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'logoUrl')} />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Social & Links Tab */}
      {activeTab === 'social' && (
        <div className="space-y-4 animate-slide-up">
          <div className="card">
            <h3 className="font-bold text-dark-700 mb-4">Social Media & Links</h3>
            <div className="space-y-4">
              {[
                { key: 'instagramId', label: 'Instagram ID', icon: FiInstagram, placeholder: '@your_username', color: 'text-pink-500' },
                { key: 'telegramId', label: 'Telegram ID / Link', icon: FiMessageCircle, placeholder: '@channel or https://t.me/...', color: 'text-blue-500' },
                { key: 'youtubeLink', label: 'YouTube Channel', icon: FiYoutube, placeholder: 'https://youtube.com/@channel', color: 'text-red-500' },
                { key: 'websiteUrl', label: 'Website URL', icon: FiGlobe, placeholder: 'https://yourwebsite.com', color: 'text-green-500' }
              ].map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.key}>
                    <label className="block text-xs font-semibold text-dark-500 mb-1.5 uppercase flex items-center space-x-1.5">
                      <Icon className={item.color} size={14} />
                      <span>{item.label}</span>
                    </label>
                    <input
                      type="text"
                      value={branding[item.key]}
                      onChange={(e) => updateField(item.key, e.target.value)}
                      placeholder={item.placeholder}
                      className="input-field"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Preview */}
          <div className="card bg-gray-50">
            <h3 className="font-semibold text-dark-600 text-sm mb-3">Preview (as students see it)</h3>
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center space-x-3 mb-3">
                <img
                  src={branding.adminPhoto || `https://ui-avatars.com/api/?name=${branding.adminName}&background=F97316&color=fff`}
                  alt="" className="w-12 h-12 rounded-xl"
                />
                <div>
                  <p className="font-bold text-dark-800">{branding.adminName || 'Your Name'}</p>
                  <p className="text-xs text-dark-400">{branding.instituteName || 'Institute Name'}</p>
                </div>
              </div>
              {branding.tagline && <p className="text-sm text-dark-500 italic mb-3">"{branding.tagline}"</p>}
              <div className="flex flex-wrap gap-2">
                {branding.instagramId && (
                  <span className="badge bg-pink-100 text-pink-600 text-xs">📸 {branding.instagramId}</span>
                )}
                {branding.telegramId && (
                  <span className="badge bg-blue-100 text-blue-600 text-xs">✈️ {branding.telegramId}</span>
                )}
                {branding.youtubeLink && (
                  <span className="badge bg-red-100 text-red-600 text-xs">▶️ YouTube</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Tab */}
      {activeTab === 'contact' && (
        <div className="card animate-slide-up">
          <h3 className="font-bold text-dark-700 mb-4">Contact Information</h3>
          <div className="space-y-4">
            {[
              { key: 'emailContact', label: 'Email', icon: FiMail, placeholder: 'your@email.com', type: 'email' },
              { key: 'phoneNumber', label: 'Phone Number', icon: FiPhone, placeholder: '+91 XXXXX XXXXX', type: 'tel' },
              { key: 'whatsappNumber', label: 'WhatsApp Number', icon: FiMessageCircle, placeholder: '+91 XXXXX XXXXX', type: 'tel' },
              { key: 'address', label: 'Address / Location', icon: FiMapPin, placeholder: 'City, State', type: 'text' }
            ].map(item => {
              const Icon = item.icon;
              return (
                <div key={item.key}>
                  <label className="block text-xs font-semibold text-dark-500 mb-1.5 uppercase flex items-center space-x-1.5">
                    <Icon className="text-primary-500" size={14} />
                    <span>{item.label}</span>
                  </label>
                  <input
                    type={item.type}
                    value={branding[item.key]}
                    onChange={(e) => updateField(item.key, e.target.value)}
                    placeholder={item.placeholder}
                    className="input-field"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* QR & Payment Tab */}
      {activeTab === 'qr' && (
        <div className="space-y-5 animate-slide-up">
          <div className="card">
            <h3 className="font-bold text-dark-700 mb-4">QR Code for Students</h3>
            <p className="text-sm text-dark-400 mb-4">Upload a QR code image (payment, WhatsApp group, etc.) that students can scan</p>
            
            <div className="flex flex-col sm:flex-row items-start gap-5">
              <div className="w-48 h-48 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                {branding.qrCodeImage ? (
                  <img src={branding.qrCodeImage} alt="QR Code" className="w-full h-full object-contain p-2" />
                ) : (
                  <div className="text-center p-4">
                    <span className="text-4xl">📱</span>
                    <p className="text-xs text-dark-400 mt-2">No QR uploaded</p>
                  </div>
                )}
              </div>
              <div className="flex-1 w-full">
                <input
                  type="text"
                  value={branding.qrCodeImage}
                  onChange={(e) => updateField('qrCodeImage', e.target.value)}
                  placeholder="QR Code image URL"
                  className="input-field text-sm mb-3"
                />
                <label className="btn-primary text-sm inline-flex items-center space-x-2 cursor-pointer">
                  <FiImage size={14} />
                  <span>{uploading === 'qrCodeImage' ? 'Uploading...' : 'Upload QR Image'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'qrCodeImage')} />
                </label>
              </div>
            </div>
          </div>

          {/* Auto QR from links */}
          <div className="card">
            <h3 className="font-bold text-dark-700 mb-4">Auto-Generated QR Codes</h3>
            <p className="text-sm text-dark-400 mb-4">These are auto-generated from your links above</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Instagram', value: branding.instagramId ? `https://instagram.com/${branding.instagramId.replace('@', '')}` : '' },
                { label: 'Telegram', value: branding.telegramId?.startsWith('http') ? branding.telegramId : branding.telegramId ? `https://t.me/${branding.telegramId.replace('@', '')}` : '' },
                { label: 'YouTube', value: branding.youtubeLink },
                { label: 'Website', value: branding.websiteUrl }
              ].filter(item => item.value).map((item, i) => (
                <div key={i} className="text-center">
                  <img
                    src={generateQRDataUrl(item.value)}
                    alt={item.label}
                    className="w-full aspect-square rounded-xl border bg-white p-1"
                  />
                  <p className="text-xs text-dark-600 font-medium mt-2">{item.label}</p>
                </div>
              ))}
              {![branding.instagramId, branding.telegramId, branding.youtubeLink, branding.websiteUrl].some(Boolean) && (
                <p className="col-span-full text-center text-dark-400 text-sm py-4">Add social links to generate QR codes</p>
              )}
            </div>
          </div>

          {/* UPI */}
          <div className="card">
            <h3 className="font-bold text-dark-700 mb-3">UPI Payment (Optional)</h3>
            <input
              type="text"
              value={branding.upiId}
              onChange={(e) => updateField('upiId', e.target.value)}
              placeholder="yourname@upi"
              className="input-field mb-3"
            />
            {branding.upiId && (
              <div className="text-center">
                <img
                  src={generateQRDataUrl(`upi://pay?pa=${branding.upiId}&pn=${branding.adminName}`)}
                  alt="UPI QR"
                  className="w-40 h-40 mx-auto rounded-xl border bg-white p-1"
                />
                <p className="text-xs text-dark-400 mt-2">UPI Payment QR</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Display Settings Tab */}
      {activeTab === 'display' && (
        <div className="space-y-4 animate-slide-up">
          <div className="card">
            <h3 className="font-bold text-dark-700 mb-4">Visibility Controls</h3>
            <div className="space-y-3">
              {[
                { key: 'showQRToStudents', label: 'Show QR Code to Students', desc: 'Display QR on student\'s Admin Info page' },
                { key: 'showSocialLinks', label: 'Show Social Links', desc: 'Display Instagram, Telegram, YouTube links' },
                { key: 'showContactInfo', label: 'Show Contact Info', desc: 'Display email, phone, address' }
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-dark-700">{item.label}</p>
                    <p className="text-[10px] text-dark-400">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => updateField(item.key, !branding[item.key])}
                    className={`relative w-12 h-7 rounded-full transition-all duration-300 ${branding[item.key] ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-300 ${branding[item.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Banner */}
          <div className="card">
            <h3 className="font-bold text-dark-700 mb-3">Custom Message for Students</h3>
            <textarea
              value={branding.customMessage}
              onChange={(e) => updateField('customMessage', e.target.value)}
              placeholder="Write a message students will see on the Admin Info page..."
              rows={3}
              className="input-field resize-y"
            />
          </div>

          {/* Theme Color */}
          <div className="card">
            <h3 className="font-bold text-dark-700 mb-3">Brand Color</h3>
            <div className="flex items-center space-x-3">
              <input type="color" value={branding.themeColor} onChange={(e) => updateField('themeColor', e.target.value)} className="w-12 h-12 rounded-xl border cursor-pointer" />
              <span className="text-sm font-mono text-dark-500">{branding.themeColor}</span>
              <div className="w-20 h-10 rounded-xl" style={{ background: branding.themeColor }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}