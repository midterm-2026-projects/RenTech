import React, { useState } from 'react';
import { Plus, Bell } from 'lucide-react';

export default function AccountSettings() {
  // --- State for SMS Templates ---
  const defaultTemplates = {
    bookingConfirmation: "Hi {customerName}, your booking for {itemName} on {rentalDate} is confirmed! Show this QR when you pick up your item: {qrCode}. Thank you for choosing RENTECH.",
    returnReminder: "Hi {customerName}, this is a friendly reminder to return your rented item '{itemName}' by {returnDate}. Late returns are subject to penalties. - RENTECH",
    overdueAlert: "URGENT: {customerName}, your rental for '{itemName}' is overdue. Please return it immediately to avoid additional charges. - RENTECH",
    paymentConfirmation: "Hi {customerName}, we received your downpayment of ₱{downpaymentAmount} for '{itemName}'. Remaining balance ₱{balanceAmount} is due at pickup. - RENTECH"
  };

  const [templates, setTemplates] = useState({ ...defaultTemplates });
  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState("");

  // --- Actions ---
  const handleEdit = (key) => {
    setEditingKey(key);
    setEditValue(templates[key]);
  };

  const handleSave = (key) => {
    if (editValue.trim()) {
      setTemplates(prev => ({ ...prev, [key]: editValue }));
      setEditingKey(null);
    }
  };

  return (
    /* We limit the height of this preview container so it behaves correctly in your App.jsx layout view */
    <div className="w-full max-h-[85vh] flex flex-col bg-slate-50/50 text-slate-800 font-sans antialiased border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
      
      {/* 1. STICKY HEADER - Always locked at the top of the container */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-100 px-6 py-5 flex justify-between items-center shadow-sm shrink-0">
        <div className="max-w-[1092px] w-full mx-auto flex justify-between items-center">
          <div className="font-bold text-sm text-slate-900">Admin Portal</div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1 px-4 py-1.5 bg-white border border-slate-200 text-slate-800 font-semibold text-xs rounded-full shadow-sm hover:bg-slate-50">
              <Plus className="w-3.5 h-3.5" /> Add Item
            </button>
            <div className="relative p-2 bg-slate-100 rounded-full cursor-pointer">
              <Bell className="w-4 h-4 text-slate-600" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. SCROLLABLE BODY CONTAINER - Houses the configuration blocks */}
      <main className="flex-1 overflow-y-auto px-6 py-8 space-y-6 scrollbar-thin">
        <div className="max-w-[760px] mx-auto space-y-6">
          
          {/* Title Banner */}
          <div>
            <h2 className="text-3xl font-bold text-[#111827]">Account & Settings</h2>
            <p className="text-slate-500 text-sm mt-1">Manage your preferences and security.</p>
          </div>

          {/* Profile Block */}
          <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex gap-6">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <div className="flex-1 space-y-5">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Admin User</h3>
                <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold tracking-wider text-rose-600 bg-rose-50 rounded-md uppercase">
                  Admin Role
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</span>
                  <span className="text-slate-800 text-xs font-semibold">user@rentech.com</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone (Semaphore Linked)</span>
                  <span className="text-slate-800 text-xs font-semibold">+63 917 123 4567</span>
                </div>
              </div>
            </div>
          </section>

          {/* SMS Templates Block */}
          <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/></svg>
              <h3 className="text-slate-900">SMS Templates</h3>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Customize the SMS messages sent to customers. Use placeholders like <span className="text-slate-600 font-medium">{"{customerName}"}</span>, <span className="text-slate-600 font-medium">{"{itemName}"}</span>, etc. They will be replaced automatically.
            </p>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-[11px] font-mono text-slate-400 leading-relaxed">
              Available placeholders: <span className="text-slate-500">{"{customerName}, {itemName}, {rentalDate}, {returnDate}, {qrCode}, {downpaymentAmount}, {balanceAmount}"}</span>
            </div>

            {/* Sub-cards */}
            <div className="space-y-4 pt-2">
              {[
                { key: 'bookingConfirmation', label: 'Booking Confirmation' },
                { key: 'returnReminder', label: 'Return Reminder' },
                { key: 'overdueAlert', label: 'Overdue Alert' },
                { key: 'paymentConfirmation', label: 'Payment Confirmation' }
              ].map((item) => (
                <div key={item.key} className="border border-slate-200/60 rounded-2xl p-4 bg-white space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-slate-900">{item.label}</h4>
                    <div className="flex gap-2 text-[11px] font-bold text-rose-600">
                      {editingKey === item.key ? (
                        <>
                          <button onClick={() => handleSave(item.key)} className="hover:underline">Save</button>
                          <button onClick={() => setEditingKey(null)} className="text-slate-400 hover:underline">Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEdit(item.key)} className="hover:underline">Edit</button>
                          <button onClick={() => setTemplates(p => ({...p, [item.key]: defaultTemplates[item.key]}))} className="text-slate-400 hover:underline">Reset</button>
                        </>
                      )}
                    </div>
                  </div>
                  {editingKey === item.key ? (
                    <textarea
                      rows={3}
                      className="w-full text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                    />
                  ) : (
                    <div className="bg-slate-50 text-xs text-slate-600 rounded-xl p-3 leading-relaxed">
                      {templates[item.key]}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button onClick={() => setTemplates({...defaultTemplates})} className="text-xs font-bold text-rose-600 hover:underline pt-2 block">
              Reset all templates to defaults
            </button>
          </section>

        </div>
      </main>
    </div>
  );
}