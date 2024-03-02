import type { GlobConfig } from '@/types/config'

import { warn } from '@/utils/log'
import { getAppEnvConfig } from '@/utils/env'

export const useGlobSetting = (): Readonly<GlobConfig> => {
  const {
    VITE_GLOB_APP_TITLE,
    VITE_GLOB_MENU_TITLE,
    // VITE_GLOB_API_URL,
    VITE_GLOB_SYSTEM_API_URL,
    VITE_GLOB_PRODUCT_API_URL,
    VITE_GLOB_CATEGORY_API_URL,
    VITE_GLOB_CERTIFICATE_API_URL,
    VITE_GLOB_USER_API_URL,
    VITE_GLOB_APP_API_URL,
    VITE_GLOB_OAUTH2_URL,
    VITE_GLOB_APP_SHORT_NAME,
    VITE_GLOB_API_URL_PREFIX,
    VITE_GLOB_UPLOAD_URL,
  } = getAppEnvConfig()

  // if (!/[a-zA-Z\_]*/.test(VITE_GLOB_APP_SHORT_NAME)) {
  //   warn(
  //     `VITE_GLOB_APP_SHORT_NAME Variables can only be characters/underscores, please modify in the environment variables and re-running.`
  //   )
  // }

  // Take global configuration
  const glob: Readonly<GlobConfig> = {
    title: VITE_GLOB_APP_TITLE,
    menuTitle: VITE_GLOB_MENU_TITLE,
    // apiUrl: VITE_GLOB_API_URL,
    systemApiUrl: VITE_GLOB_SYSTEM_API_URL,
    productApiUrl: VITE_GLOB_PRODUCT_API_URL,
    categoryApiUrl: VITE_GLOB_CATEGORY_API_URL,
    certificateApiUrl: VITE_GLOB_CERTIFICATE_API_URL,
    userApiUrl: VITE_GLOB_USER_API_URL,
    appApiUrl: VITE_GLOB_APP_API_URL,
    oAuth2Url: VITE_GLOB_OAUTH2_URL,
    shortName: VITE_GLOB_APP_SHORT_NAME,
    urlPrefix: VITE_GLOB_API_URL_PREFIX,
    uploadUrl: VITE_GLOB_UPLOAD_URL,
  }
  return glob as Readonly<GlobConfig>
}
