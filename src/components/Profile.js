import React, { useState } from "react";
import axios from "axios";

const Profile = () => {
  const [customerId, setCustomerId] = useState('');
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  const fetchProfile = () => {
    setError('');
    setProfile(null);

    if (!customerId) {
      setError('Please enter a Customer ID.');
      return;
    }

    axios.get(`/api/profile/${customerId}`)
      .then(response => {
        if (response.data.length === 0) {
          setError('No active profile found for this ID.');
          return;
        }
        setProfile(response.data[0]);
      })
      .catch(error => {
        setError(`Error: ${error.message}`);
      });
  };

  return (
    <div>
      <input
        type="text"
        id="customerId"
        value={customerId}
        onChange={(e) => setCustomerId(e.target.value)}
        placeholder="Enter Customer ID"
      />
      <button id="fetchProfile" onClick={fetchProfile}>Fetch Profile</button>
      <div id="profile">
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {profile && (
          <div>
            <div className="profile-item"><strong>Customer ID:</strong> {profile.custID}</div>
            <div className="profile-item"><strong>Username:</strong> {profile.username}</div>
            <div className="profile-item"><strong>First Name:</strong> {profile.firstName}</div>
            <div className="profile-item"><strong>Last Name:</strong> {profile.lastName}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
