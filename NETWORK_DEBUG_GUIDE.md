# Network Detection Debug Guide

## 🔍 Debug Information Added

I've added comprehensive debugging to help identify why testnet and devnet might not be distinguished correctly.

## 📋 Debug Logs

When you connect your wallet, check the browser console (F12 → Console) for these debug messages:

### 1. Sui Client RPC URL
```
Sui client RPC URL: https://fullnode.testnet.sui.io:443
```
This shows which RPC endpoint the Sui client is using.

### 2. Wallet Information
```javascript
Current wallet info: {
  name: "Sui Wallet",
  chains: ["sui:testnet"],
  features: ["standard:connect", "standard:network"],
  accounts: 1
}
```

### 3. Wallet Chain Detection
```
Detected wallet chain: sui:testnet
```

### 4. Wallet Network Feature
```
Detected wallet network feature: sui:testnet
```

### 5. Final Result
```
Final detected network: Sui Testnet
```

## 🔧 Detection Methods (Priority Order)

### Method 1: RPC URL Detection
- **Testnet**: `rpcUrl.includes('testnet')`
- **Devnet**: `rpcUrl.includes('devnet')`
- **Mainnet**: `rpcUrl.includes('mainnet')`
- **Localnet**: `rpcUrl.includes('localhost')`

### Method 2: Wallet Chains (More Precise)
- **Testnet**: `chain === 'sui:testnet'` or `chain.endsWith('testnet')`
- **Devnet**: `chain === 'sui:devnet'` or `chain.endsWith('devnet')`
- **Mainnet**: `chain === 'sui:mainnet'` or `chain.endsWith('mainnet')`
- **Localnet**: `chain === 'sui:localnet'` or `chain.endsWith('localnet')`

### Method 3: Wallet Features
- Uses `currentWallet.features["standard:network"]`
- Same precise matching as Method 2

## 🧪 Testing Steps

### Step 1: Connect to Testnet
1. Open your Sui wallet
2. Switch to **Testnet** network
3. Connect wallet to the app
4. Check console logs
5. Verify display shows "Sui Testnet" (orange)

### Step 2: Connect to Devnet
1. Switch wallet to **Devnet** network
2. Refresh the page or reconnect
3. Check console logs
4. Verify display shows "Sui Devnet" (purple)

### Step 3: Compare Logs
Look for differences in the debug output:
- Are the `chains` arrays different?
- Are the `features` returning different values?
- Is the RPC URL correct?

## 🐛 Common Issues & Solutions

### Issue 1: Both show as Devnet
**Possible Cause**: Wallet returns same chain identifier for both networks
**Solution**: Check if wallet's `chains` array is correctly updated

### Issue 2: Always shows default network
**Possible Cause**: Detection methods are failing
**Solution**: Check if wallet supports `standard:network` feature

### Issue 3: Network doesn't update on switch
**Possible Cause**: Event listeners not working
**Solution**: Manually refresh page after switching networks

## 📊 Expected Console Output

### For Testnet Connection:
```
Sui client RPC URL: https://fullnode.testnet.sui.io:443
Current wallet info: { name: "Sui Wallet", chains: ["sui:testnet"], ... }
Detected wallet chain: sui:testnet
Final detected network: Sui Testnet
```

### For Devnet Connection:
```
Sui client RPC URL: https://fullnode.devnet.sui.io:443
Current wallet info: { name: "Sui Wallet", chains: ["sui:devnet"], ... }
Detected wallet chain: sui:devnet
Final detected network: Sui Devnet
```

### When Disconnected:
- **No console output** (network status is hidden)
- **No visual indicator** in the navbar

## 🔍 Next Steps

1. **Test the app** with both Testnet and Devnet
2. **Copy the console logs** for both networks
3. **Share the logs** so I can see exactly what the wallet is returning
4. **Check the visual display** to confirm colors and text are correct

## 💡 Quick Fix

If the issue persists, try:
1. **Hard refresh** the page (Ctrl+Shift+R)
2. **Disconnect and reconnect** the wallet
3. **Clear browser cache** for the app
4. **Switch networks in wallet** then refresh page

The debug logs will help us identify exactly where the network detection is failing and fix the specific issue with your wallet setup.
