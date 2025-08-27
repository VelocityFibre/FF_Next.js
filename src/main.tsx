import ReactDOM from 'react-dom/client'

function App() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        textAlign: 'center',
        color: 'white',
        padding: '2rem',
        borderRadius: '10px',
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ fontSize: '3rem', margin: '0 0 1rem 0', fontWeight: 'bold' }}>
          🚀 FibreFlow React
        </h1>
        <p style={{ fontSize: '1.2rem', margin: '0 0 2rem 0', opacity: 0.9 }}>
          Production Deployment Successful ✅
        </p>
        <div style={{ fontSize: '1rem', opacity: 0.8 }}>
          Build System: Working<br/>
          Firebase Hosting: Active<br/>
          React Application: Operational
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />)