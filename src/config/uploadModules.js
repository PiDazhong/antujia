/**
 * 文件上传模块配置
 * 用户可在此修改子文件夹名和 API 端点
 */

// 服务器基础地址（本地开发环境）
export const API_BASE_URL = 'http://localhost:3000';


// API 端点配置
export const API_ENDPOINTS = {
  // 权限校验：POST { password }
  checkAuth: '/antujia-server/checkAuth',
  // 上传文件：POST multipart/form-data（formData 中需包含 moduleName 和 file）
  // 返回 data: { filename: 磁盘uuid文件名, originalname: 原始显示名 }
  upload: () => '/antujia-server/files/upload',
  // 获取文件列表：POST body { moduleName }
  list: () => '/antujia-server/files/list',
  // 删除文件：POST body { moduleName, filename }
  delete: () => '/antujia-server/files/delete',
  // 查询模块列表（码表 moudle）：POST 无 body
  moduleList: () => '/antujia-server/module/queryModuleList',
  // 新增模块：POST body { moduleName }
  moduleCreate: () => '/antujia-server/module/create',
  // 删除模块（含模块下全部图片数据）：POST body { moduleName }
  moduleDelete: () => '/antujia-server/module/deleteModule',
  // 查询模块内容列表（info.json）：POST body { moduleName }
  moduleQuery: () => '/antujia-server/module/query',
  // 新增条目：POST body { moduleName, fileUrl, fileName, fileDesc, fileSubDesc }
  // 必填：fileUrl（纯路径，如 /header/xxx.png，前端展示时自行拼 /icons 前缀）、fileName、fileDesc（多语言对象 { zh, en, ar }）
  // fileSubDesc 可选（同为多语言对象，缺省为 { zh: '', en: '', ar: '' }）
  moduleAdd: () => '/antujia-server/module/add',
  // 编辑条目：POST body { moduleName, fileId, fileDesc, fileSubDesc }
  // fileId 必填，fileDesc / fileSubDesc 为多语言对象，至少传一个
  moduleEdit: () => '/antujia-server/module/edit',
  // 删除条目：POST body { moduleName, fileId }
  moduleItemDelete: () => '/antujia-server/module/delete',
  // 模块排序：POST body { moduleNames: string[] }
  moduleSort: () => '/antujia-server/module/sort',
  // 条目排序：POST body { moduleName, fileIds: string[] }
  moduleItemSort: () => '/antujia-server/module/sortItems',
};
