const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withAndroidPointerTaggingDisabled(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;

    const application = manifest?.manifest?.application?.[0];
    if (!application) {
      return config;
    }

    application.$ = application.$ ?? {};

    // Disable Android native heap pointer tagging / memtagging.
    // These can trigger native aborts on some devices when combined with certain native libs.
    // Values are strings in the manifest.
    application.$['android:allowNativeHeapPointerTagging'] = 'false';
    application.$['android:memtagMode'] = 'off';

    return config;
  });
};
