'use client';

import React from 'react';
import { Statistic } from 'antd';
import type { StatisticProps } from 'antd';
import AppCard from './AppCard';
import styles from './KpiTiles.module.css';

type Tone = 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'accent';

export type KpiTileItem = {
  key: string;
  title: React.ReactNode;
  value: StatisticProps['value'];
  prefix?: StatisticProps['prefix'];
  suffix?: StatisticProps['suffix'];
  tone?: Tone;
};

const toneToColor: Record<Tone, string> = {
  primary: 'var(--app-primary)',
  accent: 'var(--app-accent)',
  success: '#16A34A',
  warning: '#F59E0B',
  danger: '#DC2626',
  neutral: 'rgba(15, 23, 42, 0.7)',
};

const KpiTiles: React.FC<{ items: KpiTileItem[] }> = ({ items }) => {
  return (
    <div className={styles.grid}>
      {items.map((item) => (
        <AppCard key={item.key} className={styles.tile}>
          <Statistic
            title={item.title}
            value={item.value}
            prefix={item.prefix}
            suffix={item.suffix}
            valueStyle={{
              fontSize: 26,
              fontWeight: 900,
              letterSpacing: '-0.02em',
              color: toneToColor[item.tone ?? 'neutral'],
            }}
          />
        </AppCard>
      ))}
    </div>
  );
};

export default KpiTiles;

