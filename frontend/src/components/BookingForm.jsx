import React, { useState } from 'react';
import DatePicker from './DatePicker'; 

export default function BookingForm({ onClose }) {
  const [step, setStep] = useState(1);
  const [bookingFor, setBookingFor] = useState('me'); 
  
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0]; 
  });

  const price = 4500;
  const minDownpayment = price / 2; 


  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: '',
    size: 'S',
    paymentMethod: 'GCash',
    downpayment: minDownpayment
  });

  const balance = price - formData.downpayment;

  const handleToggleUser = (userType) => {
    setBookingFor(userType);
    setFormData(prev => ({
      ...prev,
      name: '' 
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDownpaymentChange = (e) => {
    const value = Math.max(minDownpayment, Math.min(price, Number(e.target.value)));
    setFormData(prev => ({ ...prev, downpayment: value }));
  };

  const formatReadableDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${parseInt(month, 10)}/${parseInt(day, 10)}/${year}`;
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modalContainer}>
        
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.headerTitle}>Complete Booking</h2>
          <button style={styles.closeButton} onClick={onClose}>&times;</button>
        </div>

        {/* Progress Tracker */}
        <div style={styles.progressContainer}>
          <div style={styles.stepWrapper}>
            <div style={{...styles.stepCircle, ...(step >= 1 ? styles.stepActive : styles.stepInactive)}}>
              {step > 1 ? '✓' : '1'}
            </div>
            <span style={styles.stepLabel}>Details</span>
          </div>
          <div style={{...styles.progressLine, ...(step >= 2 ? styles.lineActive : styles.lineInactive)}} />
          
          <div style={styles.stepWrapper}>
            <div style={{...styles.stepCircle, ...(step >= 2 ? styles.stepActive : styles.stepInactive)}}>
              {step > 2 ? '✓' : '2'}
            </div>
            <span style={styles.stepLabel}>Payment</span>
          </div>
          <div style={{...styles.progressLine, ...(step >= 3 ? styles.lineActive : styles.lineInactive)}} />
          
          <div style={styles.stepWrapper}>
            <div style={{...styles.stepCircle, ...(step >= 3 ? styles.stepActive : styles.stepInactive)}}>3</div>
            <span style={styles.stepLabel}>Receipt</span>
          </div>
        </div>

        {}
        <div style={styles.contentScrollBox}>
          
          {}
          {step === 1 && (
            <div>
              <div style={styles.productCard}>
                <div style={styles.productImgMock}>👗</div>
                <div>
                  <div style={styles.productName}>Emerald Silk Mermaid Evening Gown</div>
                  <div style={styles.productDate}>Date: {formatReadableDate(selectedDate)}</div>
                  <div style={styles.productPrice}>₱{price.toLocaleString()}</div>
                </div>
              </div>

              <label style={styles.fieldLabel}>WHO IS THIS BOOKING FOR?</label>
              <div style={styles.toggleRow}>
                <button 
                  type="button"
                  onClick={() => handleToggleUser('me')} 
                  style={{...styles.toggleBtn, ...(bookingFor === 'me' ? styles.toggleBtnActive : styles.toggleBtnInactive)}}
                >
                  Me
                </button>
                <button 
                  type="button"
                  onClick={() => handleToggleUser('someone')} 
                  style={{...styles.toggleBtn, ...(bookingFor === 'someone' ? styles.toggleBtnActive : styles.toggleBtnInactive)}}
                >
                  Someone else
                </button>
              </div>

              <input 
                type="text" 
                name="name"
                placeholder="Full Name"
                value={formData.name} 
                onChange={handleInputChange}
                style={{...styles.selectField, backgroundColor: '#fafafa', marginBottom: '12px', fontWeight: '500'}} 
              />

              <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                <input 
                  type="text" 
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone} 
                  onChange={handleInputChange}
                  style={styles.selectField}
                />
                <input 
                  type="text" 
                  name="address"
                  placeholder="Address"
                  value={formData.address} 
                  onChange={handleInputChange}
                  style={styles.selectField}
                />
              </div>

              <textarea 
                name="notes"
                placeholder="Special notes (e.g., size preference, theme)"
                value={formData.notes} 
                onChange={handleInputChange}
                style={{ ...styles.selectField, height: '60px', resize: 'none', marginBottom: '12px' }}
              />

              <DatePicker 
                selectedDate={selectedDate} 
                onDateChange={setSelectedDate} 
                label="RENTAL DATE"
              />

              <label style={styles.fieldLabel}>SIZE</label>
              <select name="size" value={formData.size} onChange={handleInputChange} style={styles.selectField}>
                <option value="S">Small (S)</option>
                <option value="M">Medium (M)</option>
                <option value="L">Large (L)</option>
              </select>

              <div style={styles.downpaymentBox}>
                <label style={styles.downpaymentLabel}>REQUIRED DOWNPAYMENT</label>
                <div style={styles.downpaymentInputWrapper}>
                  <span style={{marginRight: '5px'}}>₱</span>
                  <input 
                    type="number" 
                    name="downpayment"
                    min={minDownpayment}
                    max={price}
                    step="100"
                    value={formData.downpayment} 
                    onChange={handleDownpaymentChange}
                    style={styles.downpaymentInput} 
                  />
                </div>
                <p style={styles.downpaymentSubtext}>Minimum 50% (₱{minDownpayment.toLocaleString()}) required to secure booking.</p>
              </div>
            </div>
          )}
          {step === 2 && (
            <div>
              <h3 style={styles.sectionTitle}>Payment Method</h3>
              <p style={styles.sectionSubtitle}>Select how you'd like to pay the downpayment.</p>
              
              <div style={styles.paymentGrid}>
                <div 
                  aria-label="Select GCash"
                  onClick={() => setFormData({...formData, paymentMethod: 'GCash'})}
                  style={{...styles.paymentCard, ...(formData.paymentMethod === 'GCash' ? styles.paymentCardActive : {})}}
                >
                  <div style={{fontSize: '24px', marginBottom: '4px'}}>📱</div>
                  <div>GCash</div>
                </div>
                <div 
                  aria-label="Select Card"
                  onClick={() => setFormData({...formData, paymentMethod: 'Card'})}
                  style={{...styles.paymentCard, ...(formData.paymentMethod === 'Card' ? styles.paymentCardActive : {})}}
                >
                  <div style={{fontSize: '24px', marginBottom: '4px'}}>💳</div>
                  <div>Card</div>
                </div>
              </div>

              <div style={styles.summaryNoticeBox}>
                <div style={{fontWeight: 'bold', color: '#1a1a1a'}}>Downpayment: ₱{formData.downpayment.toLocaleString()}</div>
                <div style={{color: '#666', fontSize: '13px', marginTop: '4px'}}>
                  Remaining balance: ₱{balance.toLocaleString()} (payable at pickup).
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{textAlign: 'center'}}>
              <h3 style={{...styles.sectionTitle, fontSize: '22px', margin: '10px 0'}}>Booking Confirmed!</h3>
              <p style={{...styles.sectionSubtitle, marginBottom: '20px'}}>
                Your reservation data has been recorded successfully.
              </p>
              
              <div style={styles.receiptCard}>
                <div style={{fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: '8px', marginBottom: '10px', textAlign: 'left'}}>
                  Emerald Silk Mermaid Evening Gown
                </div>
                <table style={styles.receiptTable}>
                  <tbody>
                    <tr><td style={{padding: '4px 0', color: '#666'}}>Date</td><td style={{textAlign: 'right', fontWeight: '500'}}>{formatReadableDate(selectedDate)}</td></tr>
                    <tr><td style={{padding: '4px 0', color: '#666'}}>Customer</td><td style={{textAlign: 'right', fontWeight: '500'}}>{formData.name || 'N/A'}</td></tr>
                    <tr><td style={{padding: '4px 0', color: '#666'}}>Size</td><td style={{textAlign: 'right', fontWeight: '500'}}>{formData.size}</td></tr>
                    <tr><td style={{padding: '4px 0', color: '#666'}}>Payment Method</td><td style={{textAlign: 'right', fontWeight: '500'}}>{formData.paymentMethod}</td></tr>
                    <tr><td style={{padding: '4px 0', color: '#666'}}>Downpayment</td><td style={{textAlign: 'right', color: '#b94a48', fontWeight: '700'}}>₱{formData.downpayment.toLocaleString()}</td></tr>
                    <tr><td style={{padding: '4px 0', color: '#666'}}>Balance</td><td style={{textAlign: 'right', fontWeight: '700'}}>₱{balance.toLocaleString()}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {}
        <div style={styles.footer}>
          {step < 3 ? (
            <>
              <button style={styles.btnCancel} onClick={onClose}>Cancel</button>
              <button 
                onClick={() => {
                  if (step === 2) {
                    setStep(3); 
                  } else {
                    setStep(prev => prev + 1);
                  }
                }} 
                style={styles.btnAction}
              >
                {step === 1 ? 'Continue to Payment' : 'Confirm Payment'}
              </button>
            </>
          ) : (
            <button onClick={onClose} style={{...styles.btnAction, width: '100%'}}>Close</button>
          )}
        </div>

      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(30, 30, 30, 0.25)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, fontFamily: 'system-ui, -apple-system, sans-serif' },
  modalContainer: { backgroundColor: '#ffffff', borderRadius: '24px', width: '430px', maxHeight: '88vh', display: 'flex', flexDirection: 'column', boxShadow: '0 16px 48px rgba(0,0,0,0.12)', overflow: 'hidden' },
  header: { padding: '24px 24px 8px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { margin: 0, fontSize: '19px', fontWeight: '700', color: '#111' },
  closeButton: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#bbb' },
  progressContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 24px 20px 24px', borderBottom: '1px solid #f7f7f7' },
  stepWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '55px' },
  stepCircle: { width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700' },
  stepActive: { backgroundColor: '#b94a48', color: '#fff' },
  stepInactive: { backgroundColor: '#f0f0f0', color: '#999' },
  stepLabel: { fontSize: '10px', marginTop: '5px', color: '#777', fontWeight: '500' },
  progressLine: { height: '2px', flex: 1, marginLeft: '6px', marginRight: '6px', marginBottom: '14px', backgroundColor: '#e8e8e8' },
  lineActive: { backgroundColor: '#b94a48' },
  contentScrollBox: { padding: '0 24px 20px 24px', overflowY: 'auto', flex: 1 },
  productCard: { display: 'flex', backgroundColor: '#f8f9fa', borderRadius: '16px', padding: '12px', margin: '15px 0', alignItems: 'center', gap: '12px' },
  productImgMock: { width: '48px', height: '48px', borderRadius: '10px', backgroundColor: '#eaeaea', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' },
  productName: { fontSize: '13px', fontWeight: '700', color: '#222' },
  productDate: { fontSize: '11px', color: '#777', margin: '3px 0' },
  productPrice: { fontSize: '14px', fontWeight: '700', color: '#b94a48' },
  fieldLabel: { display: 'block', fontSize: '10px', fontWeight: '700', color: '#666', marginBottom: '6px', marginTop: '16px', letterSpacing: '0.5px' },
  toggleRow: { display: 'flex', gap: '10px', marginBottom: '12px' },
  toggleBtn: { flex: 1, padding: '11px', borderRadius: '10px', border: '1px solid #e0e0e0', fontWeight: '600', cursor: 'pointer', fontSize: '13px' },
  toggleBtnActive: { backgroundColor: '#b94a48', color: '#fff', borderColor: '#b94a48' },
  toggleBtnInactive: { backgroundColor: '#fff', color: '#444' },
  selectField: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e8e8e8', backgroundColor: '#fafafa', fontSize: '13px', boxSizing: 'border-box' },
  downpaymentBox: { backgroundColor: '#f8f9fa', borderRadius: '14px', padding: '14px', marginTop: '16px' },
  downpaymentLabel: { fontSize: '10px', fontWeight: '700', color: '#666' },
  downpaymentInputWrapper: { display: 'flex', alignItems: 'center', borderBottom: '1px solid #ddd', padding: '4px 0', margin: '4px 0' },
  downpaymentInput: { border: 'none', background: 'none', fontSize: '16px', fontWeight: '700', outline: 'none', width: '100%' },
  downpaymentSubtext: { fontSize: '10px', color: '#888', margin: 0 },
  sectionTitle: { margin: '16px 0 4px 0', fontSize: '16px', fontWeight: '700', color: '#111' },
  sectionSubtitle: { margin: '0 0 16px 0', fontSize: '13px', color: '#666' },
  paymentGrid: { display: 'flex', gap: '12px', margin: '16px 0' },
  paymentCard: { flex: 1, border: '1px solid #e5e5e5', borderRadius: '14px', padding: '16px', textAlign: 'center', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
  paymentCardActive: { borderColor: '#b94a48', backgroundColor: '#fff5f5' },
  summaryNoticeBox: { backgroundColor: '#f8f9fa', padding: '14px', borderRadius: '12px', marginTop: '16px' },
  receiptCard: { border: '1px solid #f0f0f0', borderRadius: '14px', padding: '14px', textAlign: 'left', backgroundColor: '#fff' },
  receiptTable: { width: '100%', fontSize: '13px', borderCollapse: 'collapse' },
  footer: { padding: '16px 24px 24px 24px', borderTop: '1px solid #f7f7f7', display: 'flex', gap: '12px' },
  btnCancel: { flex: 1, padding: '12px', borderRadius: '24px', border: '1px solid #e0e0e0', backgroundColor: '#fff', cursor: 'pointer', fontWeight: '600' },
  btnAction: { flex: 2, padding: '12px', borderRadius: '24px', border: 'none', backgroundColor: '#b94a48', color: '#fff', cursor: 'pointer', fontWeight: '600' }
};