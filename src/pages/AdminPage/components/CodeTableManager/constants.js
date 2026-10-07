import { API_BASE_URL } from '../../../../config/uploadModules';

export const CODE_TABLE_BASE = `${API_BASE_URL}/damonshome-server/codeTable`;

// 系统内置 Code：文件管理依赖 moudle 作为模块列表来源，auth_password 为管理页口令，均不允许删除
export const PROTECTED_CODES = ['moudle', 'auth_password'];
