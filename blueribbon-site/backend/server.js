import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();

const CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: FRONTEND_URL,
  methods: ['GET', 'POST'],
  credentials: true
}));

let accessToken = null;
let tokenExpiresAt = 0;

async function getAccessToken() {
  if (accessToken && Date.now() &lt; tokenExpiresAt) {
    return accessToken;
  }

  try {
    const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
      params: {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'client_credentials'
      }
    });

    accessToken = response.data.access_token;
    tokenExpiresAt = Date.now() + (response.data.expires_in * 1000) - 60000;
    return accessToken;
  } catch (error) {
    console.error('Error getting access token:', error.message);
    throw error;
  }
}

async function getStreams() {
  try {
    const token = await getAccessToken();

    const response = await axios.get('https://api.twitch.tv/helix/streams', {
      headers: {
        'Client-ID': CLIENT_ID,
        'Authorization': `Bearer ${token}`
      },
      params: {
        first: 100
      }
    });

    const streams = response.data.data.filter(stream =&gt;
      stream.title.toLowerCase().includes('blueribbon rp')
    );

    const userIds = [...new Set(streams.map(s =&gt; s.user_id))];
    let users = [];

    if (userIds.length &gt; 0) {
      const userResponse = await axios.get('https://api.twitch.tv/helix/users', {
        headers: {
          'Client-ID': CLIENT_ID,
          'Authorization': `Bearer ${token}`
        },
        params: {
          id: userIds
        }
      });
      users = userResponse.data.data;
    }

    const enrichedStreams = streams.map(stream =&gt; {
      const user = users.find(u =&gt; u.id === stream.user_id);
      return {
        id: stream.id,
        user_login: stream.user_login,
        user_name: stream.user_name,
        title: stream.title,
        thumbnail_url: stream.thumbnail_url,
        viewer_count: stream.viewer_count,
        game_name: stream.game_name,
        profile_image_url: user?.profile_image_url || null,
        started_at: stream.started_at
      };
    });

    return enrichedStreams.sort((a, b) =&gt; b.viewer_count - a.viewer_count);
  } catch (error) {
    console.error('Error fetching streams:', error.message);
    throw error;
  }
}

app.get('/api/streams', async (req, res) =&gt; {
  try {
    const streams = await getStreams();
    res.json({ streams });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Failed to fetch streams' });
  }
});

app.listen(PORT, () =&gt; {
  console.log(`Backend running on port ${PORT}`);
  console.log(`CORS enabled for: ${FRONTEND_URL}`);
});
