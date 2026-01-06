const sampleController = {
  getMessage: (req, res) => {
    res.json({ message: 'Talkify backend up and running' });
  },
};

module.exports = sampleController;
