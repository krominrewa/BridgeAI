/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 安全的服务端教学代理地址；留空则只用本地规则提示。密钥绝不放在前端。 */
  readonly VITE_TEACHING_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}