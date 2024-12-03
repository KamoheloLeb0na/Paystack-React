import React, { useState } from 'react';
import { usePaystackPayment } from 'react-paystack';
import './App.css';

const PaystackHookExample = () => {
  const [email, setEmail] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [serviceTier, setServiceTier] = useState('Basic');
  const [startTime, setStartTime] = useState('06:00');
  const [endTime, setEndTime] = useState('18:00');
  const [isDangerousLocation, setIsDangerousLocation] = useState(false);
  const [isAdverseWeather, setIsAdverseWeather] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);
  const [isSpecialEquipment, setIsSpecialEquipment] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const calculateTotal = () => {
    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);
    const durationInHours = Math.max(3, (end - start) / 3600000);

    let rates;
    switch (serviceTier) {
      case 'Basic':
        rates = {
          daytime: 100,
          nighttime: 150,
          danger: 50,
          weather: 30,
        };
        break;
      case 'Intermediate':
        rates = {
          daytime: 150,
          nighttime: 200,
          danger: 75,
          weather: 30,
        };
        break;
      case 'Advanced':
        rates = {
          daytime: 200,
          nighttime: 250,
          danger: 80,
          weather: 50,
          emergency: 200,
          specialEquipment: 100
        };
        break;
      default:
        rates = {};
    }

    let amount = 0;

    for (let i = 0; i < durationInHours; i++) {
      const hour = (start.getHours() + i) % 24;
      if (hour >= 6 && hour < 18) {
        amount += rates.daytime;
      } else {
        amount += rates.nighttime;
      }
    }

    if (isDangerousLocation) {
      amount += rates.danger * durationInHours;
    }
    if (isAdverseWeather) {
      amount += rates.weather * durationInHours;
    }
    if (serviceTier === 'Advanced') {
      if (isEmergency) {
        amount += rates.emergency; // One-time charge for emergency response
      }
      if (isSpecialEquipment) {
        amount += rates.specialEquipment; // One-time charge for special equipment
      }
    }

    setTotalAmount(amount * 100); // Convert to cents
  };

  const config = {
    reference: new Date().getTime().toString(),
    email: email,
    currency: 'ZAR',
    amount: totalAmount,
    publicKey: 'pk_test_9bd0e71b397cce126a809dcf363d94e10b433b29',
  };

  const onSuccess = (reference) => {
    console.log('Payment successful:', reference);
    alert('Thank you! Your payment was successful.');
  };

  const onClose = () => {
    console.log('Payment process was closed.');
    alert('Payment was not completed. Please try again.');
  };

  const initializePayment = usePaystackPayment(config);

  const handlePayment = () => {
    if (email) {
      setIsLoading(true);
      setErrorMessage('');
      calculateTotal();
      setTimeout(() => {
        setShowPayment(true);
        setIsLoading(false);
      }, 1000); // Simulate loading
    } else {
      setErrorMessage('Please enter a valid email address to proceed.');
    }
  };

  return (
    <div className="payment-container" style={{margin:'10px'}}>
      {!showPayment ? (
        <div className="email-form" style={{margin:'15px'}}>
          <h2>Secure Payment Portal</h2>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="email-input"
          />

          {errorMessage && <div className="error-message">{errorMessage}</div>}

          <div className="service-selection">
            <label>Select Security Tier:</label>
            <select onChange={(e) => setServiceTier(e.target.value)} value={serviceTier}>
              <option value="Basic">Basic</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div className="time-selection">
            <label>Start Time:</label>
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            <label>End Time:</label>
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>

          <div className="additional-charges">
            <label>Additional Charges:</label>
            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={isDangerousLocation}
                  onChange={() => setIsDangerousLocation(!isDangerousLocation)}
                />
                Dangerous Location (R{serviceTier === 'Basic' ? 50 : serviceTier === 'Intermediate' ? 75 : 80} per hour)
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={isAdverseWeather}
                  onChange={() => setIsAdverseWeather(!isAdverseWeather)}
                />
                Adverse Weather (R{serviceTier === 'Basic' ? 30 : serviceTier === 'Intermediate' ? 30 : 50} per hour)
              </label>
              {serviceTier === 'Advanced' && (
                <>
                  <label>
                    <input
                      type="checkbox"
                      checked={isEmergency}
                      onChange={() => setIsEmergency(!isEmergency)}
                    />
                    Emergency Response (R200)
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={isSpecialEquipment}
                      onChange={() => setIsSpecialEquipment(!isSpecialEquipment)}
                    />
                    Special Equipment (R100)
                  </label>
                </>
              )}
            </div>
          </div>


          <button onClick={handlePayment} className="pay-button">
            Continue to Payment
          </button>

          {isLoading && (
            <div className="loading-spinner">
              <img src="spinner.gif" alt="Loading..." />
            </div>
          )}
        </div>
      ) : (
        <div className="payment-details">
          <h3>Email: {email}</h3>
          <p>Chosen Security Tier: {serviceTier}</p>
          <p>Total Amount: {totalAmount / 100} ZAR</p>
          <p>Click the button below to proceed with the payment.</p>
          <button
            onClick={() => {
              initializePayment(onSuccess, onClose);
            }}
            className="pay-button"
          >
            Pay Now
          </button>
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <PaystackHookExample />
    </div>
  );
}

export default App;
