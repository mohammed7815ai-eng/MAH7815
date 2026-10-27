// Windows build of the Iraq edition: same app, its own name, ID, installer art and terms,
// so it installs side by side with the Kurdistan edition.
const base = require('./package.json').build;

module.exports = {
  ...base,
  appId: 'iq.health.cancerscreening',
  productName: 'Cancer Screening Guide Iraq',
  extraMetadata: { edition: 'iraq', productName: 'Cancer Screening Guide Iraq' },
  directories: { output: 'release-iraq' },
  nsis: {
    ...base.nsis,
    artifactName: 'Cancer-Screening-Guide-Iraq-Setup-${version}.${ext}',
    installerSidebar: 'build-iraq/installerSidebar.bmp',
    uninstallerSidebar: 'build-iraq/installerSidebar.bmp',
    installerHeader: 'build-iraq/installerHeader.bmp',
    license: 'build-iraq/license.txt',
    shortcutName: 'Cancer Screening Guide Iraq',
    uninstallDisplayName: 'Cancer Screening Guide Iraq ${version}',
  },
  portable: { artifactName: 'Cancer-Screening-Guide-Iraq-Portable-${version}.${ext}' },
};
