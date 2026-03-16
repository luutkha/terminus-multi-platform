module.exports = {
  packagerConfig: {
    name: 'Terminus',
    executableName: 'Terminus',
    asar: {
      unpack: '**/node_modules/{backend,electron-squirrel-startup}/**/*'
    },
    extraResource: [
      './backend'
    ],
    // Include client/dist files directly
    files: [
      'main.js',
      'preload.js',
      'client/**/*'
    ]
  },
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'Terminus'
      }
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['win32']
    }
  ]
};
