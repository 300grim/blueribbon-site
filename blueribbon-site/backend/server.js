const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;

app.get('/api/streams', async (req, res) =&gt; {
  res.json({ streams: [] });
});

app.listen(PORT, () =&gt; {
  console.log('Server running on port ' + PORT);
});
