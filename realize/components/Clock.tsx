
import React, { useState, useEffect } from 'react';

const Clock: React.FC = () => {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  const time = date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  const day = date.toLocaleDateString('ja-JP', { weekday: 'long' });
  const fullDate = date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="text-right">
      <p className="text-6xl font-black text-white drop-shadow-lg">{time}</p>
      <p className="text-xl font-semibold text-slate-300 drop-shadow-md">{`${fullDate} (${day})`}</p>
    </div>
  );
};

export default Clock;
