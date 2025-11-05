// Quick test to verify the TrainerClients component imports correctly
import TrainerClients from './src/pages/trainer/TrainerClients.jsx';

console.log('TrainerClients component imported successfully:', typeof TrainerClients);
console.log('Component name:', TrainerClients.name);

// Test that it's a valid React component
if (typeof TrainerClients === 'function') {
  console.log('✅ TrainerClients is a valid React component');
} else {
  console.log('❌ TrainerClients is not a valid React component');
}