/**
 * 文件上传模块配置
 * 用户可在此修改子文件夹名和 API 端点
 */

// 开发环境连本地后端，生产环境走当前域名（相对路径）
export const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:3001' : '';

// 图片基础地址：
// - 开发环境：本地 node 服务通过 /damonshome 静态目录提供（http://localhost:3001/damonshome）
// - 生产环境：nginx 将 /damonshome/ 指向服务器图片目录（/damonshome/<模块>/<文件名>）
export const FILE_BASE_URL = import.meta.env.DEV
  ? 'http://localhost:3001/damonshome'
  : '/damonshome';


// API 端点配置
export const API_ENDPOINTS = {
  // 登录校验：POST { password }，成功返回 data.token
  login: '/damonshome-server/login',
  // 校验 token 探登录态（需登录）：POST 无 body
  verify: '/damonshome-server/verify',
  // 上传文件：POST multipart/form-data（formData 中需包含 moduleName 和 file）
  // 返回 data: { filename: 磁盘uuid文件名, originalname: 原始显示名 }
  upload: () => '/damonshome-server/files/upload',
  // 获取文件列表：POST body { moduleName }
  list: () => '/damonshome-server/files/list',
  // 删除文件：POST body { moduleName, filename }
  delete: () => '/damonshome-server/files/delete',
  // 查询模块列表（码表 moudle）：POST 无 body
  moduleList: () => '/damonshome-server/module/queryModuleList',
  // 新增模块：POST body { moduleName }
  moduleCreate: () => '/damonshome-server/module/create',
  // 删除模块（含模块下全部图片数据）：POST body { moduleName }
  moduleDelete: () => '/damonshome-server/module/deleteModule',
  // 查询模块内容列表（info.json）：POST body { moduleName }
  moduleQuery: () => '/damonshome-server/module/query',
  // 新增条目：POST body { moduleName, fileUrl, fileName, fileDesc, fileSubDesc }
  // 必填：fileUrl（纯路径，如 /header/xxx.png，前端展示时自行拼 FILE_BASE_URL 前缀）、fileName、fileDesc（多语言对象 { zh, en, ar }）
  // fileSubDesc 可选（同为多语言对象，缺省为 { zh: '', en: '', ar: '' }）
  moduleAdd: () => '/damonshome-server/module/add',
  // 编辑条目：POST body { moduleName, fileId, fileDesc, fileSubDesc }
  // fileId 必填，fileDesc / fileSubDesc 为多语言对象，至少传一个
  moduleEdit: () => '/damonshome-server/module/edit',
  // 删除条目：POST body { moduleName, fileId }
  moduleItemDelete: () => '/damonshome-server/module/delete',
  // 模块排序：POST body { moduleNames: string[] }
  moduleSort: () => '/damonshome-server/module/sort',
  // 条目排序：POST body { moduleName, fileIds: string[] }
  moduleItemSort: () => '/damonshome-server/module/sortItems',
  // 查询文本条目列表（shark.json，空文本返回 `${sharkKey}_${LANG}` 占位）：POST body { moduleName }
  sharkQuery: () => '/damonshome-server/module/shark/query',
  // 新增文本条目：POST body { moduleName, sharkKey, sharkText? }
  // sharkKey 同模块内唯一必填；sharkText 为 { zh, en, ar } 对象，选填
  sharkAdd: () => '/damonshome-server/module/shark/add',
  // 编辑文本条目（sharkKey 不可修改）：POST body { moduleName, sharkKey, sharkText }
  sharkEdit: () => '/damonshome-server/module/shark/edit',
  // 删除文本条目：POST body { moduleName, sharkKey }
  sharkDelete: () => '/damonshome-server/module/shark/delete',
  // 文本条目排序：POST body { moduleName, sharkKeys: string[] }
  sharkSort: () => '/damonshome-server/module/shark/sort',
  // 登录密码查询（需登录）：POST 无 body，返回 [{ password, desc }]
  passwordQuery: () => '/damonshome-server/password/query',
  // 登录密码批量保存（需登录）：POST body { items: [{ password, desc }] }，整表替换，至少留一条
  passwordSave: () => '/damonshome-server/password/save',
  // 登录密码删除（需登录）：POST body { password }，最后一条不允许删除
  passwordDelete: () => '/damonshome-server/password/delete',
};
