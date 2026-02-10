'use client';

import React, { useMemo } from 'react';
import styles from './ActionCard.module.css';

type Tone = 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'accent';

export type ActionCardProps = {
  icon: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  tone?: Tone;
  className?: string;
};

const toneToColor: Record<Tone, string> = {
  primary: 'var(--app-primary)',
  accent: 'var(--app-accent)',
  success: '#16A34A',
  warning: '#F59E0B',
  danger: '#DC2626',
  neutral: 'rgba(15, 23, 42, 0.7)',
};

const ActionCard: React.FC<ActionCardProps> = ({
  icon,
  title,
  description,
  onClick,
  disabled,
  tone = 'primary',
  className,
}) => {
  const style = useMemo(
    () =>
      ({
        ['--tone' as any]: toneToColor[tone],
      }) as React.CSSProperties,
    [tone]
  );

  return (
    <button
      type="button"
      className={[styles.card, className].filter(Boolean).join(' ')}
      style={style}
      onClick={onClick}
      disabled={disabled}
    >
      <span className={styles.iconWrap} aria-hidden="true">
        {icon}
      </span>
      <span className={styles.text}>
        <span className={styles.title}>{title}</span>
        {description ? <span className={styles.desc}>{description}</span> : null}
      </span>
    </button>
  );
};

export default ActionCard;

