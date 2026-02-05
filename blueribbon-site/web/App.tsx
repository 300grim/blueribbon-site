import { useState, useEffect } from 'react';

export interface Stream {
  id: string;
  user_login: string;
  user_name: string;
  title: string;
  thumbnail_url: string;
  viewer_count: number;
  game_name: string;
  profile_image_url: string | null;
  started_at: string;
}

export default function App(): JSX.Element {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [featuredStreamId, setFeaturedStreamId] = useState<string | null>(null);

  // Mock data for preview mode
  const mockStreams: Stream[] = [
    {
      id: '1',
      user_login: 'streamer1',
      user_name: 'Streamer One',
      title: 'BlueRibbon RP - Epic Roleplay Session 🔴',
      thumbnail_url: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_streamer-1920x1080.jpg',
      viewer_count: 4250,
      game_name: 'Grand Theft Auto V',
      profile_image_url: 'https://static-cdn.jtvnw.net/jtv_user_pictures/default-profile_image-300x300.png',
      started_at: new Date().toISOString()
    },
    {
      id: '2',
      user_login: 'streamer2',
      user_name: 'Streamer Two',
      title: 'BlueRibbon RP - Crime Spree with the Crew!',
      thumbnail_url: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_streamer2-1920x1080.jpg',
      viewer_count: 1850,
      game_name: 'Grand Theft Auto V',
      profile_image_url: 'https://static-cdn.jtvnw.net/jtv_user_pictures/default-profile_image-300x300.png',
      started_at: new Date().toISOString()
    }
  ];

  const isPreviewMode = () => {
    try {
      return typeof window !== 'undefined' && !window.location.hostname.includes('localhost:5000');
    } catch {
      return false;
    }
  };

  const fetchStreams = async () => {
    try {
      setError(null);
      
      if (isPreviewMode()) {
        setStreams(mockStreams);
        setLoading(false);
        return;
      }

      // Change this URL when deploying to production
      const backendUrl = 'http://localhost:5000/api/streams';
      const response = await fetch(backendUrl, { timeout: 5000 });
      if (!response.ok) throw new Error('Backend not running. Start it with: cd backend && npm start');
      const data = await response.json();
      setStreams(data.streams || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      console.error('Error fetching streams:', err);
      setStreams(mockStreams);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStreams();
    const interval = setInterval(fetchStreams, 30000);
    return () => clearInterval(interval);
  }, []);

  // Get featured stream (most viewers) and rest
  const sortedStreams = [...streams].sort((a, b) => b.viewer_count - a.viewer_count);
  
  // Set featured stream on first load
  useEffect(() => {
    if (sortedStreams.length > 0 && !featuredStreamId) {
      setFeaturedStreamId(sortedStreams[0].id);
    }
  }, [streams, featuredStreamId]);
  
  const featuredStream = streams.find(s => s.id === featuredStreamId) || sortedStreams[0];
  const restStreams = sortedStreams.filter(s => s.id !== featuredStreamId);

  return (
    <div style={{ minHeight: '100vh', background: '#d1d5db', color: '#1e293b', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif', paddingBottom: '40px' }}>
      {/* Header */}
      <header style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '20px 0', position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ fontSize: '28px', fontWeight: '700', letterSpacing: '-0.5px', color: '#1e293b' }}>BlueRibbon RP</div>
              <div style={{ height: '20px', width: '1px', background: '#cbd5e1' }} />
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#64748b' }}>Live Streams</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div>
                <div style={{ fontSize: '20px', fontWeight: '600', color: '#3b82f6' }}>{streams.length}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>streams online</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 24px' }}>
        {error && !streams.length && (
          <div style={{ marginBottom: '32px', padding: '16px 20px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b', fontSize: '14px' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ height: '500px', background: 'linear-gradient(90deg, #9ca3af 25%, #6b7280 50%, #9ca3af 75%)', backgroundSize: '200% 100%', borderRadius: '12px', animation: 'loading 1.5s infinite', marginBottom: '40px' }} />
        ) : streams.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: '56px', marginBottom: '20px' }}>📡</div>
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>No streams currently live</h2>
            <p style={{ color: '#64748b', fontSize: '15px' }}>Check back soon for BlueRibbon RP streams</p>
          </div>
        ) : (
          <>
            {/* Featured Stream */}
            {featuredStream && (
              <>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>Featured Stream</h2>
                <FeaturedStreamCard stream={featuredStream} />
                
                {/* Other Streams */}
                {restStreams.length > 0 && (
                  <>
                    <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginTop: '40px', marginBottom: '16px' }}>Other Streams</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
                      {restStreams.map((stream) => (
                        <StreamCard key={stream.id} stream={stream} onSelectFeatured={() => setFeaturedStreamId(stream.id)} />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}
      </main>

      <style>{`
        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

function FeaturedStreamCard({ stream }: { stream: Stream }) {
  const formatViewers = (count: number | null | undefined) => {
    if (!count || count < 0) return '0';
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div style={{ background: '#ffffff', borderRadius: '12px', overflow: 'hidden', border: '3px solid #000000', marginBottom: '32px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' }}>
      {/* Player - Always visible, reduced height */}
      <div style={{ position: 'relative', paddingBottom: '42%', background: '#000000' }}>
        <iframe src={`https://player.twitch.tv/?channel=${stream.user_login}&parent=localhost`} width="100%" height="100%" frameBorder="0" style={{ position: 'absolute', top: 0, left: 0 }} allowFullScreen />
        {/* Live Badge */}
        <div style={{ position: 'absolute', top: '16px', left: '16px', background: '#3b82f6', color: 'white', padding: '8px 14px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '700', boxShadow: '0 2px 8px rgba(59, 130, 246, 0.4)', zIndex: 10 }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white', animation: 'pulse 1.5s infinite' }} />
          LIVE
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
          {stream.profile_image_url ? (
            <img src={stream.profile_image_url} alt={stream.user_name} style={{ width: '56px', height: '56px', borderRadius: '50%', border: '2px solid #e2e8f0', flexShrink: 0 }} />
          ) : (
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', border: '2px solid #e2e8f0', background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)', flexShrink: 0 }} />
          )}
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '4px', lineHeight: '1.3' }}>{stream.title || 'Untitled'}</h3>
            <p style={{ fontSize: '14px', color: '#64748b' }}>{stream.user_name || 'Unknown'}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '24px', fontSize: '14px', marginBottom: '16px', color: '#475569', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>👥</span>
            <span><strong style={{ color: '#1e293b' }}>{formatViewers(stream.viewer_count)}</strong> viewers</span>
          </div>
          <div style={{ width: '1px', background: '#e2e8f0' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🎮</span>
            <span>{stream.game_name || 'Variety'}</span>
          </div>
        </div>

        <a href={`https://twitch.tv/${stream.user_login}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', background: '#3b82f6', color: 'white', padding: '12px 24px', borderRadius: '8px', textAlign: 'center', fontWeight: '600', textDecoration: 'none', border: 'none', cursor: 'pointer', transition: 'all 0.2s', fontSize: '14px' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#2563eb'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = '#3b82f6'; e.currentTarget.style.boxShadow = 'none'; }}>
          Watch on Twitch
        </a>
      </div>
    </div>
  );
}

function StreamCard({ stream, onSelectFeatured }: { stream: Stream; onSelectFeatured: () => void }) {
  const [showPlayer, setShowPlayer] = useState(false);

  const formatViewers = (count: number | null | undefined) => {
    if (!count || count < 0) return '0';
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div style={{ background: '#ffffff', borderRadius: '12px', overflow: 'hidden', border: '3px solid #000000', transition: 'all 0.3s ease', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)' }} onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.15)'; e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
      {/* Thumbnail */}
      <div style={{ position: 'relative', paddingBottom: '56.25%', background: '#f1f5f9', overflow: 'hidden' }}>
        {!showPlayer ? (
          <button onClick={() => { setShowPlayer(true); onSelectFeatured(); }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', border: 'none', cursor: 'pointer', padding: 0, background: 'none' }}>
            <img src={stream.thumbnail_url || 'https://via.placeholder.com/640x360?text=Stream'} alt={stream.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }} onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')} onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')} />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.3s' }} onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(15, 23, 42, 0.3)')} onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(15, 23, 42, 0.4)')}>
              <div style={{ width: '56px', height: '56px', background: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#2563eb'; e.currentTarget.style.transform = 'scale(1.1)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = '#3b82f6'; e.currentTarget.style.transform = 'scale(1)'; }}>
                <svg style={{ width: '22px', height: '22px', color: 'white', marginLeft: '3px' }} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </div>
            </div>
          </button>
        ) : (
          <iframe src={`https://player.twitch.tv/?channel=${stream.user_login}&parent=localhost`} width="100%" height="100%" frameBorder="0" style={{ position: 'absolute', top: 0, left: 0 }} allowFullScreen />
        )}
        {/* Live Badge */}
        <div style={{ position: 'absolute', top: '12px', left: '12px', background: '#3b82f6', color: 'white', padding: '6px 12px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'white', animation: 'pulse 1.5s infinite' }} />
          LIVE
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
          {stream.profile_image_url ? (
            <img src={stream.profile_image_url} alt={stream.user_name} style={{ width: '44px', height: '44px', borderRadius: '50%', border: '2px solid #e2e8f0', flexShrink: 0 }} />
          ) : (
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', border: '2px solid #e2e8f0', background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)', flexShrink: 0 }} />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', marginBottom: '2px', lineHeight: '1.3', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{stream.title || 'Untitled'}</h3>
            <p style={{ fontSize: '13px', color: '#64748b' }}>{stream.user_name || 'Unknown'}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', fontSize: '13px', marginBottom: '12px', color: '#475569', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>👥</span>
            <span><strong style={{ color: '#1e293b' }}>{formatViewers(stream.viewer_count)}</strong></span>
          </div>
          <div style={{ width: '1px', background: '#e2e8f0' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>🎮</span>
            <span>{stream.game_name || 'Variety'}</span>
          </div>
        </div>

        <a href={`https://twitch.tv/${stream.user_login}`} target="_blank" rel="noopener noreferrer" style={{ display: 'block', width: '100%', background: '#3b82f6', color: 'white', padding: '10px 12px', borderRadius: '8px', textAlign: 'center', fontWeight: '600', textDecoration: 'none', border: 'none', cursor: 'pointer', transition: 'all 0.2s', fontSize: '14px' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#2563eb'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = '#3b82f6'; e.currentTarget.style.boxShadow = 'none'; }}>
          Watch on Twitch
        </a>
      </div>
    </div>
  );
}
