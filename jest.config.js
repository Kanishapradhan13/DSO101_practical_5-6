module.exports = {
    testEnvironment: 'jsdom',
    reporters: [
      'default',
      ['jest-junit', {
        outputDirectory: '.',
        outputName: 'junit.xml',
      }]
    ],
    collectCoverageFrom: [
      'src/**/*.{js,jsx}',
      '!src/index.js',
      '!src/reportWebVitals.js'
    ]
  };