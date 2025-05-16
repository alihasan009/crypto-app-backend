const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Dummy user data (in a real app, use a database)
let users = [];
let userIdCounter = 1;

// --- Auth Routes ---
app.post('/api/auth/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }
  if (users.find(user => user.email === email)) {
    return res.status(409).json({ message: 'User already exists.' });
  }
  const newUser = { id: userIdCounter++, email, password, balance: { BTC: 0, ETH: 0, LTC: 0 }, alerts: [] };
  users.push(newUser);
  console.log('Registered new user:', newUser);
  // In a real app, you would return a token (e.g., JWT)
  res.status(201).json({ message: 'User registered successfully.', userId: newUser.id });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }
  const user = users.find(user => user.email === email && user.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }
  console.log('User logged in:', user);
  // In a real app, you would return a token (e.g., JWT)
  res.status(200).json({ message: 'Login successful.', userId: user.id, token: `dummy-token-${user.id}` });
});

// --- Wallet Routes (Placeholder) ---
app.get('/api/wallet/:userId/balance', (req, res) => {
  const userId = parseInt(req.params.userId);
  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }
  res.status(200).json(user.balance || { BTC: 0, ETH: 0, LTC: 0 });
});

app.post('/api/wallet/:userId/send', (req, res) => {
  const userId = parseInt(req.params.userId);
  const { currency, amount, recipientAddress } = req.body;
  const user = users.find(u => u.id === userId);

  if (!user) return res.status(404).json({ message: 'User not found.' });
  if (!currency || !amount || !recipientAddress) {
    return res.status(400).json({ message: 'Currency, amount, and recipient address are required.' });
  }
  if (!user.balance || user.balance[currency] === undefined || user.balance[currency] < amount) {
    return res.status(400).json({ message: 'Insufficient balance or unsupported currency.' });
  }

  // Simulate transaction
  user.balance[currency] -= amount;
  console.log(`Simulated send: User ${userId} sent ${amount} ${currency} to ${recipientAddress}`);
  res.status(200).json({ message: `Successfully sent ${amount} ${currency}. New balance: ${user.balance[currency]}` });
});

app.get('/api/wallet/:userId/receive_address/:currency', (req, res) => {
    const userId = parseInt(req.params.userId);
    const { currency } = req.params;
    const user = users.find(u => u.id === userId);

    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (!currency) return res.status(400).json({ message: 'Currency is required.' });

    // Simulate generating a receive address
    const receiveAddress = `DUMMY_${currency}_ADDRESS_FOR_USER_${userId}`;
    console.log(`Generated receive address for User ${userId}, Currency ${currency}: ${receiveAddress}`);
    res.status(200).json({ address: receiveAddress });
});


// --- Free Mining (Ad Watching) Route (Placeholder) ---
app.post('/api/mining/:userId/watched_ad', (req, res) => {
  const userId = parseInt(req.params.userId);
  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }
  // Simulate rewarding user for watching an ad (e.g., small amount of a specific crypto)
  const rewardAmount = 0.0001;
  const rewardCurrency = 'BTC'; // Or a custom in-app token
  if (user.balance[rewardCurrency] === undefined) user.balance[rewardCurrency] = 0;
  user.balance[rewardCurrency] += rewardAmount;
  console.log(`User ${userId} rewarded ${rewardAmount} ${rewardCurrency} for watching an ad.`);
  res.status(200).json({ message: `You have been rewarded ${rewardAmount} ${rewardCurrency}!`, newBalance: user.balance });
});

// --- Alerts Routes (Placeholder) ---
app.post('/api/alerts/:userId/create', (req, res) => {
  const userId = parseInt(req.params.userId);
  const { currency, condition, value } = req.body;
  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }
  if (!currency || !condition || value === undefined) {
    return res.status(400).json({ message: 'Currency, condition, and value are required for an alert.' });
  }
  const newAlert = { id: user.alerts.length + 1, currency, condition, value, active: true };
  user.alerts.push(newAlert);
  console.log(`User ${userId} created alert:`, newAlert);
  res.status(201).json({ message: 'Alert created successfully.', alert: newAlert });
});

app.get('/api/alerts/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }
  res.status(200).json(user.alerts);
});

app.delete('/api/alerts/:userId/:alertId', (req, res) => {
    const userId = parseInt(req.params.userId);
    const alertId = parseInt(req.params.alertId);
    const user = users.find(u => u.id === userId);

    if (!user) return res.status(404).json({ message: 'User not found.' });

    const alertIndex = user.alerts.findIndex(a => a.id === alertId);
    if (alertIndex === -1) {
        return res.status(404).json({ message: 'Alert not found.' });
    }

    user.alerts.splice(alertIndex, 1);
    console.log(`User ${userId} deleted alert ID: ${alertId}`);
    res.status(200).json({ message: 'Alert deleted successfully.' });
});

// --- News/Education (Placeholder - could be a static list or fetch from external API) ---
app.get('/api/news', (req, res) => {
    const newsArticles = [
        {
            id: 1,
            title: 'Bitcoin Hits New All-Time High!',
            source: 'Crypto News Today',
            date: '2025-05-15',
            snippet: 'Bitcoin (BTC) has surpassed previous records, reaching a new all-time high of...',
            fullContent: 'Detailed content about Bitcoin hitting new all-time high...'
        },
        {
            id: 2,
            title: 'Understanding DeFi: A Beginner\'s Guide',
            source: 'Learn Crypto',
            date: '2025-05-14',
            snippet: 'Decentralized Finance (DeFi) is transforming the financial landscape. This guide explains...',
            fullContent: 'A comprehensive guide to understanding DeFi concepts...'
        },
    ];
    res.status(200).json(newsArticles);
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

