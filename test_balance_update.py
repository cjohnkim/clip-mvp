#!/usr/bin/env python3

import requests
import json

# Test the balance update endpoint
def test_balance_update():
    # First, let's get a token by logging in
    login_url = "http://localhost:5001/api/auth/login"
    login_data = {
        "email": "cjohnkim@gmail.com",
        "password": "SimpleClip123"
    }
    
    print("1. Attempting to login...")
    login_response = requests.post(login_url, json=login_data)
    print(f"Login response status: {login_response.status_code}")
    print(f"Login response: {login_response.text}")
    
    if login_response.status_code != 200:
        print("❌ Login failed")
        return
    
    login_result = login_response.json()
    token = login_result.get('access_token')
    if not token:
        print("❌ No access token in login response")
        return
    
    print(f"✅ Login successful, token: {token[:20]}...")
    
    # Now test the balance update
    balance_url = "http://localhost:5001/api/accounts/balance"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    balance_data = {
        "total_balance": 1500.50
    }
    
    print("\n2. Attempting to update balance...")
    balance_response = requests.put(balance_url, json=balance_data, headers=headers)
    print(f"Balance update response status: {balance_response.status_code}")
    print(f"Balance update response: {balance_response.text}")
    
    if balance_response.status_code == 200:
        print("✅ Balance update successful")
    else:
        print("❌ Balance update failed")

if __name__ == "__main__":
    test_balance_update()