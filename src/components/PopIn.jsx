import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

const PopIn = ({
  children,
  distance = 50,
  direction = 'vertical',
  duration = 0.5,
  ease = 'power3.out',
  initialOpacity = 0,
  scale = 0.98,
  delay = 0,
}) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const axis = direction === 'horizontal' ? 'x' : 'y';

    // Set the initial state
    gsap.set(el, {
      [axis]: distance,
      scale,
      opacity: initialOpacity,
    });

    // Animate to the final state
    gsap.to(el, {
      [axis]: 0,
      scale: 1,
      opacity: 1,
      duration,
      ease,
      delay,
    });

    // Clean up
    return () => {
      gsap.killTweensOf(el);
    };
  }, [distance, direction, duration, ease, initialOpacity, scale, delay]);

  // The fix is adding style={{ width: '100%' }} to the div below
  return (
    <div ref={ref} style={{ width: '100%' }}>
      {children}
    </div>
  );
};

export default PopIn;
