const express = require('express');
const app = express();
const PORT = 5000;

app.get('/api/streams', (req, res) =&gt;
res.json({ streams: [] });
});

app.listen(PORT, () =&gt; {
  console.log('Server on port ' + PORT); 
});
