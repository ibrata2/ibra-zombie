// Stamps the game icon and version info into the Windows exe (pure JS, no wine needed)
const fs = require('fs'), path = require('path');
exports.default = async function (ctx) {
  if (ctx.electronPlatformName !== 'win32') return;
  const { load } = require('resedit/cjs'); const ResEdit = await load();
  const exe = path.join(ctx.appOutDir, ctx.packager.appInfo.productFilename + '.exe');
  const exeObj = ResEdit.NtExecutable.from(fs.readFileSync(exe)), res = ResEdit.NtExecutableResource.from(exeObj);
  const ico = ResEdit.Data.IconFile.from(fs.readFileSync(path.join(__dirname, '..', 'build', 'icon.ico')));
  const groups = ResEdit.Resource.IconGroupEntry.fromEntries(res.entries);
  ResEdit.Resource.IconGroupEntry.replaceIconsForResource(res.entries, groups.length ? groups[0].id : 1, groups.length ? groups[0].lang : 1033, ico.icons.map(i => i.data));
  const vi = ResEdit.Resource.VersionInfo.fromEntries(res.entries)[0], [a, b, c] = ctx.packager.appInfo.version.split('.').map(Number);
  vi.setFileVersion(a, b, c, 0); vi.setProductVersion(a, b, c, 0);
  vi.setStringValues({ lang: 1033, codepage: 1200 }, { ProductName: 'IBRA ZOMBIE', FileDescription: 'IBRA ZOMBIE', CompanyName: 'IBRAPROGRAM', LegalCopyright: '(c) 2026 Ibrahim Al-Khazraji', OriginalFilename: 'IBRA ZOMBIE.exe', InternalName: 'IBRA ZOMBIE' });
  vi.outputToResourceEntries(res.entries); res.outputResource(exeObj);
  fs.writeFileSync(exe, Buffer.from(exeObj.generate()));
  console.log('  • icon + version stamped into', path.basename(exe));
};
