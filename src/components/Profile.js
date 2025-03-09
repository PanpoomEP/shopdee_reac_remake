import React, {useState} from "react";
import axios from "axios";

document.getElementById('fetchProfile').addEventListener('click', function() {
    const customerId = document.getElementById('customerId').value;
    const profileDiv = document.getElementById('profile');
  
    // Clear the profile div
    profileDiv.innerHTML = '';
  
    if (!customerId) {
      profileDiv.innerHTML = '<p style="color: red;">Please enter a Customer ID.</p>';
      return;
    }
  
    // Fetch the profile data from the API
    fetch(`/api/profile/${customerId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        return response.json();
      })
      .then(data => {
        if (data.length === 0) {
          profileDiv.innerHTML = '<p style="color: red;">No active profile found for this ID.</p>';
          return;
        }
  
        const profile = data[0];
        profileDiv.innerHTML = `
          <div class="profile-item"><strong>Customer ID:</strong> ${profile.custID}</div>
          <div class="profile-item"><strong>Username:</strong> ${profile.username}</div>
          <div class="profile-item"><strong>First Name:</strong> ${profile.firstName}</div>
          <div class="profile-item"><strong>Last Name:</strong> ${profile.lastName}</div>
        `;
      })
      .catch(error => {
        profileDiv.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
      });
  });
  