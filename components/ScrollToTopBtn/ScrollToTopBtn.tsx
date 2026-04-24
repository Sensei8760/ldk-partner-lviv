'use client';

import {
  useEffect,
  useState,
  type CSSProperties,
  type MouseEvent,
} from 'react';
import css from './ScrollToTopBtn.module.css';

type Props = {
  showAfter?: number;
};

type ButtonStyle = CSSProperties & {
  '--fillScale': string;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export default function ScrollToTopBtn({ showAfter = 700 }: Props) {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    const update = () => {
      const scrollTop = window.scrollY || 0;
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;

      const currentProgress = maxScroll > 0 ? scrollTop / maxScroll : 0;

      setProgress(clamp(currentProgress, 0, 1));
      setIsVisible(scrollTop > showAfter);

      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;

      ticking = true;
      window.requestAnimationFrame(update);
    };

    update();

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [showAfter]);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });

    e.currentTarget.blur();
  };

  const minScale = 0.48;
  const fillScale = minScale + progress * (1 - minScale);

  const buttonStyle: ButtonStyle = {
    '--fillScale': fillScale.toString(),
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${css.btn} ${isVisible ? css.show : ''}`}
      aria-label="Повернутись догори"
      title="Догори"
      style={buttonStyle}
    >
      <svg
        className={css.icon}
        width="24"
        height="24"
        viewBox="0 0 32 32"
        aria-hidden="true"
        focusable="false"
      >
        <use
          href="/icons/symbol-defs.svg#arrow_back_ios_new"
          xlinkHref="/icons/symbol-defs.svg#arrow_back_ios_new"
        />
      </svg>
    </button>
  );
}