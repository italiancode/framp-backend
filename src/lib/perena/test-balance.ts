import { getUSDStarBalance } from './client';

// A known Solana wallet with USD* tokens (you can replace with a wallet you know has tokens)
const TEST_WALLET = 'BenJy1n3WTx9mTjEvy63e8Q1j4RqUc6E4VBMz3ir4Wo6'; 

async function testBalance() {
  console.log('Testing USD* balance fetching...');
  
  try {
    console.log(`Checking balance for wallet: ${TEST_WALLET}`);
    const balance = await getUSDStarBalance(TEST_WALLET);
    console.log(`Balance result: ${balance}`);
  } catch (error) {
    console.error('Error in test:', error);
  }
}

// Run the test
testBalance();

// Export for importing in Node scripts
export { testBalance }; 