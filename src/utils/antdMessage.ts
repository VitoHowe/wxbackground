// 由于工具模块中不能直接使用 App.useApp()，这里通过可注入的全局引用来使用 antd 的实例
let _message: any = null;
let _notification: any = null;
let _modal: any = null;

export const setAntdApis = (apis: { message?: any; notification?: any; modal?: any } | null) => {
  _message = apis?.message ?? null;
  _notification = apis?.notification ?? null;
  _modal = apis?.modal ?? null;
};

export const messageApi = {
  success: (content: string) => _message?.success?.(content),
  error: (content: string) => _message?.error?.(content),
  info: (content: string) => _message?.info?.(content),
  warning: (content: string) => _message?.warning?.(content),
};

export const notificationApi = {
  open: (args: any) => _notification?.open?.(args),
};

export const modalApi = {
  confirm: (args: any) => _modal?.confirm?.(args),
};
