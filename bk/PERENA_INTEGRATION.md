# Perena USD* Integration Documentation

This document explains how the Perena USD* token integration works in our platform, specifically focusing on the on-ramp (fiat to USD*) and off-ramp (USD* to fiat) processes.

## Overview

Perena's USD* is a yield-bearing stablecoin LP token backed by various stablecoins (USDC, USDT, PYUSD). Our integration allows users to:

1. **On-ramp**: Convert fiat currency to USD* tokens
2. **Off-ramp**: Convert USD* tokens back to fiat currency
3. **Earn yield**: Automatically earn ~5.2% APR while holding USD* tokens

## Architecture

The integration consists of several key components:

- **Client Library** (`src/lib/perena/client.ts`): Core functions for interacting with the Perena SDK
- **Fiat Bridge** (`src/lib/perena/fiat-bridge.ts`): Handles conversion between fiat and USD*
- **API Routes**: 
  - `/api/perena/onramp`: API endpoint for processing on-ramp requests
  - `/api/perena/offramp`: API endpoint for processing off-ramp requests
- **UI Components**: 
  - `src/app/dashboard/wallet/usdstar.tsx`: Wallet component for USD* balance and operations
  - `src/app/dashboard/offramp/perena/page.tsx`: Dedicated off-ramp page

## On-ramp Process

The on-ramp process (converting fiat to USD*) works as follows:

1. **User Interface**:
   - User enters the amount they wish to convert to USD*
   - User selects a payment method (card or bank transfer)
   - User initiates the on-ramp by clicking "Deposit Funds"

2. **API Request**:
   - The UI makes a POST request to `/api/perena/onramp` with the amount, wallet address, and payment method
   - The API validates the request and user authentication

3. **Fiat Processing**:
   - The system records the on-ramp request in the database
   - The payment is processed (in production, this would integrate with a payment processor)
   - The system calculates the USD* amount based on the current exchange rate and fees

4. **Token Minting**:
   - The `mintUSDStar` function is called to mint USD* tokens to the user's wallet
   - This function interacts with the Perena protocol to deposit stablecoins and receive USD* tokens
   - The transaction is recorded on the Solana blockchain

5. **Completion**:
   - The user receives a success notification
   - The wallet balance is refreshed to show the updated USD* amount

## Off-ramp Process

The off-ramp process (converting USD* to fiat) works as follows:

1. **User Interface**:
   - User enters the amount of USD* they wish to convert to fiat
   - User selects the target currency (USD, NGN, GHS, KES, etc.)
   - User provides their bank details (bank name and account number)
   - User initiates the off-ramp by clicking "Withdraw Funds"

2. **API Request**:
   - The UI makes a POST request to `/api/perena/offramp` with the amount, wallet address, and banking details
   - The API validates the request and user authentication

3. **Token Redemption**:
   - The system records the off-ramp request in the database
   - The `redeemUSDStar` function is called to redeem USD* tokens for stablecoins
   - This function interacts with the Perena protocol to burn USD* tokens and withdraw stablecoins
   - The transaction is recorded on the Solana blockchain

4. **Fiat Transfer**:
   - The system calculates the fiat amount based on the current exchange rate and fees
   - It initiates a fiat transfer using Flutterwave to the user's bank account
   - The transfer reference is recorded for tracking purposes

5. **Completion**:
   - The user receives a notification that the off-ramp has been initiated
   - The wallet balance is refreshed to show the reduced USD* amount
   - The fiat transfer is processed by Flutterwave (typically within 1-2 business days)

## Exchange Rates and Fees

- **Exchange Rate**: The current exchange rate between USD* and fiat currencies is provided by the `getUSDStarExchangeRate` function
- **Fees**: We apply a 1% fee on both on-ramp and off-ramp operations
- **APR**: Users earn approximately 5.2% APR on their USD* holdings (actual rate may vary based on Perena pool performance)

## Security Considerations

- All operations involving token transfers require authentication
- The off-ramp process includes multiple validation steps to ensure funds are sent to verified bank accounts
- The integration uses environment variables to store sensitive keys and endpoints
- Server-side validations are implemented to prevent malicious inputs

## Technical Implementation Details

The key functions that power this integration are:

- `mintUSDStar`: Mints USD* tokens by depositing stablecoins
- `redeemUSDStar`: Redeems USD* tokens for stablecoins
- `getUSDStarBalance`: Retrieves the current USD* balance for a wallet
- `getUSDStarExchangeRate`: Gets the current exchange rate between USD* and various currencies
- `processOnRamp`: Handles the complete on-ramp process
- `processOffRamp`: Handles the complete off-ramp process

## Future Enhancements

Planned improvements to the integration include:

1. Support for more payment methods and currencies
2. Enhanced transaction monitoring and reporting
3. Integration with mobile wallets for smoother on/off-ramp experiences
4. Automatic recurring deposits for dollar-cost averaging
5. Ability to set up automatic withdrawals based on yield thresholds 