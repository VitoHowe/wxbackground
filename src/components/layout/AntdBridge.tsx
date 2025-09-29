'use client';

import React, { useEffect } from 'react';
import { App } from 'antd';
import { setAntdApis } from '@/utils/antdMessage';

const AntdBridge: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const apis = App.useApp();

  useEffect(() => {
    setAntdApis({ message: apis.message, notification: apis.notification, modal: apis.modal });
    return () => setAntdApis(null);
  }, [apis]);

  return <>{children}</>;
};

export default AntdBridge;
