import { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';
import './App.css';

// Displays a modal for sending an invoice
function SendModal({ onClose }) {
  const [invoice, setInvoice] = useState('');
  const [paymentMessage, setPaymentMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (window.webln) {
      try {
        console.log('WebLN is available');
        await window.webln.enable();
        const result = await window.webln.sendPayment(invoice);
        setPaymentMessage(result.preimage ? "Payment successful!" : 'Payment failed...');
        if (result.preimage) setInvoice('');
      } catch (error) {
        console.error('Payment failed:', error);
        setPaymentMessage(`Payment failed: ${error.message}`);
      }
    }
  };

  return (
    <div className="modal">
      <h2>Send Invoice</h2>
      <form onSubmit={handleSubmit}>
        <label>Invoice:</label>
        <br />
        <input type="text" value={invoice} onChange={e => setInvoice(e.target.value)} />
        <br />
        <button type="submit">Submit</button>
      </form>
      <button onClick={onClose}>Close</button>
      {paymentMessage && <p>{paymentMessage}</p>}
    </div>
  );
}

// Displays a modal for receiving an amount
function ReceiveModal({ onClose }) {
  const [amount, setAmount] = useState('');
  const [invoice, setInvoice] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (window.webln) {
      try {
        await window.webln.enable();
        const { paymentRequest } = await window.webln.makeInvoice({ amount });
        setInvoice(paymentRequest);
        setMessage('Invoice created successfully.');
      } catch (error) {
        console.error('Error creating invoice:', error);
        setMessage(`Error creating invoice: ${error.message}`);
      }
    } else {
      setMessage('WebLN not supported.');
    }
  };

  return (
    <div className="modal">
      <h2>Receive Amount</h2>
      <form onSubmit={handleSubmit}>
        <label>Amount:</label>
        <br />
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} />
        <br />
        <button type="submit">Submit</button>
      </form>
      <button onClick={onClose}>Close</button>
      {invoice ? (
        <>
          <p>{message}</p>
          <QRCode value={invoice} size={256} level="H" />
          <br />
          <span>Invoice: {invoice}</span>
        </>
      ) : (
        <p>{message}</p>
      )}
    </div>
  );
}

// Main App component
export default function App() {
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [balance, setBalance] = useState(null);

  const fetchBalance = async () => {
    if (window.webln) {
      await window.webln.enable();
      const { balance } = await window.webln.getBalance();
      setBalance(balance);
    }
  };

  useEffect(() => {
    if (!balance) fetchBalance();
  }, [balance]);

  return (
    <main>
      <h3>Balance: {balance}</h3>
      <div className='button-row'>
        <button onClick={() => setShowSendModal(true)}>Send</button>
        <button onClick={() => setShowReceiveModal(true)}>Receive</button>
      </div>
      {showSendModal && <SendModal onClose={() => setShowSendModal(false)} />}
      {showReceiveModal && <ReceiveModal onClose={() => setShowReceiveModal(false)} />}
    </main>
  );
}
