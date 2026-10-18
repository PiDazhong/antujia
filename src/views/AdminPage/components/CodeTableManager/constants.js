import { API_BASE_URL } from '../../../../config/uploadModules';

export const CODE_TABLE_BASE = `${API_BASE_URL}/damonshome-server/codeTable`;

// 系统内置 Code：文件管理依赖 moudle 作为模块列表来源，不允许删除
// （登录密码已迁移到独立的 password.json，由「登录管理」tab 维护）
export const PROTECTED_CODES = ['moudle'];
