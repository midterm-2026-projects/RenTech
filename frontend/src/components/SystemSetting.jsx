import React, { useState, useEffect } from 'react';
import { LogOut, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

const MOCK_DB_INITIAL = {
  profile: { 
    name: 'Admin User', 
    role: 'Admin Role', 
    email: 'user@rentech.com', 
    phone: '+63 917 123 4567' 
  },
  integrations: [
    { id: 1, name: "Semaphore SMS Gateway", status: "Connected", desc: "Automated return reminders & booking confirmations." },
    { id: 2, name: "PayMongo Payments", status: "Active", desc: "Secure GCash & Credit Card downpayments." }
  ],
  templates: {
    bookingConfirmation: "Hi {customerName}, your booking for {itemName} on {rentalDate} is confirmed! Show this QR when you pick up your item: {qrCode}. Thank you for choosing RENTECH.",
    returnReminder: "Hi {customerName}, this is a friendly reminder to return your rented item '{itemName}' by {returnDate}. Late returns are subject to penalties. - RENTECH",
    overdueAlert: "URGENT: {customerName}, your rental for '{itemName}' is overdue. Please return it immediately to avoid additional charges. - RENTECH",
    paymentConfirmation: "Hi {customerName}, we received your downpayment of ₱{downpaymentAmount} for '{itemName}'. Remaining balance ₱{balanceAmount} is due at pickup. - RENTECH"
  }
};

const DEFAULT_TEMPLATES_REF = { ...MOCK_DB_INITIAL.templates };

export default function AccountSettings() {
  const [templates, setTemplates] = useState({});
  const [profile, setProfile] = useState({ name: '', role: '', email: '', phone: '' });
  const [integrations, setIntegrations] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setTemplates({ ...MOCK_DB_INITIAL.templates });
      setProfile({ ...MOCK_DB_INITIAL.profile });
      setIntegrations([...MOCK_DB_INITIAL.integrations]);
      setIsLoading(false);
    }, 600); 

    return () => clearTimeout(timer);
  }, []);

  const handleEdit = (key) => {
    setEditingKey(key);
    setEditValue(templates[key] || "");
  };

  const handleSave = (key) => {

    if (!editValue || !editValue.trim()) {
      setErrorMessage("Template content cannot be blank or empty.");
      return;
    }

    setErrorMessage(null);

    setTemplates(prev => ({ ...prev, [key]: editValue.trim() }));
    setEditingKey(null);
    triggerNotification("Template modified successfully (Mock Save)!");
  };

  const handleResetSingle = (key) => {
    setTemplates(prev => ({ ...prev, [key]: DEFAULT_TEMPLATES_REF[key] }));
    triggerNotification("Template reverted to system default.");
  };

  const handleResetAll = () => {
    setTemplates({ ...DEFAULT_TEMPLATES_REF });
    triggerNotification("All templates reset to defaults.");
  };

  const handleSignOut = () => {
    triggerNotification("Signing out user session state...");
  };

  const triggerNotification = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  if (isLoading) {
    return (
      <div className="w-full h-[50vh] flex flex-col items-center justify-center gap-2 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
        <p className="text-sm font-medium">Loading component states from mock runtime...</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col bg-slate-50/50 text-slate-800 font-sans antialiased">

      {errorMessage && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-3 flex items-center gap-2 text-red-700 text-[15px] font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="ml-auto hover:underline">Dismiss</button>
        </div>
      )}
      {successMessage && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-3 flex items-center gap-2 text-emerald-700 text-[15px] font-semibold">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}



      <main className="flex-1 overflow-y-auto px-6 py-8 space-y-6 scrollbar-thin">
        <div className="max-w-[760px] mx-auto space-y-6">
          
          <div>
            <h2 className="text-3xl font-bold text-[#111827]">Account & Settings</h2>
            <p className="text-slate-500 text-base mt-1">Manage preferences and system notifications.</p>
          </div>

          <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex gap-6">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <div className="flex-1 space-y-5">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{profile.name}</h3>
                <span className="inline-block mt-1 px-2 py-0.5 text-[11px] font-bold tracking-wider text-rose-600 bg-rose-50 rounded-md uppercase">
                  {profile.role}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                <div>
                  <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Email Address</span>
                  <span className="text-slate-800 text-[15px] font-semibold">{profile.email}</span>
                </div>
                <div>
                  <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Phone Link</span>
                  <span className="text-slate-800 text-[15px] font-semibold">{profile.phone}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-slate-900 font-bold text-base">System Integrations</h3>
            <div className="space-y-3">
              {integrations.map((integration) => (
                <div key={integration.id} className="flex justify-between items-center border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                  <div>
                    <h4 className="text-[15px] font-bold text-slate-900">{integration.name}</h4>
                    <p className="text-slate-400 text-[13px] mt-0.5">{integration.desc}</p>
                  </div>
                  <span className="text-[13px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                    {integration.status}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-slate-900 font-bold text-base">SMS Templates</h3>
            
            <div className="space-y-4 pt-2">
              {[
                { key: 'bookingConfirmation', label: 'Booking Confirmation' },
                { key: 'returnReminder', label: 'Return Reminder' },
                { key: 'overdueAlert', label: 'Overdue Alert' },
                { key: 'paymentConfirmation', label: 'Payment Confirmation' }
              ].map((item) => (
                <div key={item.key} className="border border-slate-200/60 rounded-2xl p-4 bg-white space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[15px] font-bold text-slate-900">{item.label}</h4>
                    <div className="flex gap-2 text-[13px] font-bold text-rose-600">
                      {editingKey === item.key ? (
                        <>
                          <button onClick={() => handleSave(item.key)} className="hover:underline">Save</button>
                          <button onClick={() => setEditingKey(null)} className="text-slate-400 hover:underline">Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEdit(item.key)} className="hover:underline">Edit</button>
                          <button onClick={() => handleResetSingle(item.key)} className="text-slate-400 hover:underline">Reset</button>
                        </>
                      )}
                    </div>
                  </div>
                  {editingKey === item.key ? (
                    <textarea
                      rows={3}
                      className="w-full text-[15px] text-slate-600 bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-rose-400"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                    />
                  ) : (
                    <div className="bg-slate-50 text-[15px] text-slate-600 rounded-xl p-3 leading-relaxed">
                      {templates[item.key]}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button onClick={handleResetAll} className="text-[15px] font-bold text-rose-600 hover:underline pt-2 block">
              Reset all templates to defaults
            </button>
          </section>

          <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-2">
            <h3 className="text-base font-bold text-slate-900">Account Actions</h3>
            <button onClick={handleSignOut} className="flex items-center gap-1.5 px-4 py-2 bg-rose-50/60 text-rose-700 font-bold text-[15px] rounded-xl border border-rose-100/70 hover:bg-rose-100/50 transition mt-2">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </section>

        </div>
      </main>
    </div>
  );
}