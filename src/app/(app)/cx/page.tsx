'use client'
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthProvider"; 

export default function CX() {
  const { username, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);

  useEffect(() => {
    if (username && token && !iframeSrc) {
      setIframeSrc(`https://pluridashlab?user_name=${username}&AltitudeToken=${token}`);
      setLoading(false); 
    }
  }, [username, token, iframeSrc]);

  if (loading || !iframeSrc) {
    return <div>Carregando...</div>; 
  }

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <iframe
        src={iframeSrc}
        width="100%"
        height="100%"
        title="CX"
      />
    </div>
  );
}
