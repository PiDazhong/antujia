/**
 * Less → SCSS 一次性迁移脚本
 * 覆盖项目内实际用到的 less 语法：
 *   1. 变量        @name: value        → $name: value（先收集定义名再替换引用，不会误伤 @media/@import）
 *   2. 无参混入    .name() {}          → @mixin name {}；调用 .name(); → @include name;
 *   3. 规则混入    .respond-mobile({…}) → @include respond-mobile {…}（@rules() → @content）
 *   4. fade()      fade(@c, 55%)       → rgba($c, 0.55)
 *   5. @import     xxx.less            → xxx.scss
 */
import { glob } from 'glob';
import { readFile, writeFile, rm } from 'fs/promises';

const files = await glob('src/**/*.less');

// ---- 1. 收集全部 less 变量名（行首 @name: 定义）----
const varNames = new Set();
for (const file of files) {
  const src = await readFile(file, 'utf8');
  for (const m of src.matchAll(/^\s*@([a-zA-Z][\w-]*)\s*:/gm)) {
    varNames.add(m[1]);
  }
}
console.log('variables:', [...varNames].length);

for (const file of files) {
  let s = await readFile(file, 'utf8');

  // fade(@color, N%) → rgba($color, 0.NN)
  s = s.replace(/fade\(\s*@([\w-]+)\s*,\s*(\d+(?:\.\d+)?)%\s*\)/g, (_, c, p) => {
    const ratio = Number(p) / 100;
    const alpha = ratio === 0 || ratio === 1 ? String(ratio) : String(ratio);
    return `rgba(@${c}, ${alpha})`;
  });

  // 混入定义 .name() { → @mixin name {
  s = s.replace(/^(\s*)\.([\w-]+)\(\)\s*\{/gm, '$1@mixin $2 {');
  // 规则混入定义 .respond-mobile(@rules) { → @mixin respond-mobile {
  s = s.replace(/^(\s*)\.respond-mobile\(@rules\)\s*\{/gm, '$1@mixin respond-mobile {');
  // 定义体内传递规则 @rules(); → @content;
  s = s.replace(/@rules\(\);?/g, '@content;');

  // 规则混入调用 .respond-mobile({ → @include respond-mobile {
  s = s.replace(/\.respond-mobile\(\{/g, '@include respond-mobile {');
  // 其收尾 }); → }（本项目中 }); 只出现在规则混入收尾）
  s = s.replace(/^\s*\}\);\s*$/gm, '}');

  // 无参混入调用 .name(); → @include name;
  s = s.replace(/\.(flex-center|flex-between|text-ellipsis|on-dark|section-head|section-eyebrow|section-title)\(\);/g, '@include $1;');

  // 变量引用 @name → $name（按收集到的定义名精确替换）
  for (const name of varNames) {
    s = s.replace(new RegExp(`@${name}\\b`, 'g'), `$${name}`);
  }

  // 多行变量值并成一行（@font-family-base）
  s = s.replace(/(\$font-family-base:)\s*\n\s*/g, '$1 ');

  // @import 路径与注释中的 .less → .scss
  s = s.replace(/\.less/g, '.scss');

  const out = file.replace(/\.less$/, '.scss');
  await writeFile(out, s);
  console.log('converted:', out);
}

// 删除原 .less 文件
for (const file of files) await rm(file);
console.log('done');
