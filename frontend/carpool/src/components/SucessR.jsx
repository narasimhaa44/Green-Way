import React from 'react';
import { CheckCircle, Mail, User, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SuccessR = () => {
  const navigate = useNavigate();
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f0f9ff', fontFamily: 'system-ui, sans-serif' }}>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.5; }
          100% { transform: scale(1.3); opacity: 0; }
        }
      `}</style>

      <div style={{ position: 'relative', width: '100%', maxWidth: '450px', backgroundColor: '#ffffff', borderRadius: '24px', padding: '40px 30px', boxShadow: '0 20px 40px -15px rgba(56, 189, 248, 0.3)', textAlign: 'center', overflow: 'hidden' }}>
        
        {/* Animated Icon */}
        <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 24px', animation: 'float 3s ease-in-out infinite' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#bae6fd', borderRadius: '50%', animation: 'pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite' }}></div>
          <div style={{ position: 'relative', zIndex: 10, width: '100%', height: '100%', backgroundColor: '#38bdf8', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 10px 15px -3px rgba(56, 189, 248, 0.4)' }}>
            <CheckCircle size={48} color="white" />
          </div>
        </div>
        
        <h1 style={{ margin: '0 0 8px', fontSize: '26px', fontWeight: '700', color: '#0f172a' }}>Ride Registered!</h1>
        <p style={{ margin: '0 0 32px', fontSize: '15px', color: '#64748b' }}>Your journey is confirmed and ready to go</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ padding: '10px', backgroundColor: '#e0f2fe', borderRadius: '12px', color: '#0ea5e9' }}>
              <Mail size={22} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>Check Your Email</h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: '1.4' }}>Confirmation details have been sent to your inbox</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ padding: '10px', backgroundColor: '#ede9fe', borderRadius: '12px', color: '#8b5cf6' }}>
              <User size={22} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>User Assignment</h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: '1.4' }}>You'll receive user details shortly once assigned</p>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => navigate("/")}
          style={{ width: '100%', padding: '14px', borderRadius: '14px', border: 'none', backgroundColor: '#38bdf8', color: 'white', fontSize: '16px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#0ea5e9'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(14, 165, 233, 0.4)'; }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#38bdf8'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          Book Another Ride <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

export default SuccessR;