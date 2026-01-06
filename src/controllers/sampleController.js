const mongoose = require('mongoose');

const sampleController = {
  getMessage: (req, res) => {
    res.json({ message: 'Talkify backend up and running' });
  },
  getDbStatus: (req, res) => {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
      99: 'uninitialized',
    };

    const state = states[mongoose.connection.readyState] || 'unknown';
    res.json({ status: state });
  },
};

module.exports = sampleController;
