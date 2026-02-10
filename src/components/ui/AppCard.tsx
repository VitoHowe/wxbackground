'use client';

import React from 'react';
import { Card } from 'antd';
import type { CardProps } from 'antd';
import styles from './AppCard.module.css';

const AppCard: React.FC<CardProps> = ({ className, ...props }) => {
  return (
    <Card
      bordered={false}
      className={[styles.card, className].filter(Boolean).join(' ')}
      {...props}
    />
  );
};

export default AppCard;

