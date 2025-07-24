
import { useState, useEffect } from 'react';

export const useSlideshow = <T,>(items: T[], intervalSeconds: number): [T, number] => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;

    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
    }, intervalSeconds * 1000);

    return () => clearInterval(intervalId);
  }, [items.length, intervalSeconds]);

  return [items[currentIndex], currentIndex];
};
