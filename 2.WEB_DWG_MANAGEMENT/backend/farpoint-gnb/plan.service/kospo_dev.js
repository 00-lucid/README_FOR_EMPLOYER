const { execSync } = require('child_process')
const os = require('os')

console.log('OS: ', os.type())

// Run command depending on the OS
if (os.type() === 'Linux') execSync('REGION=kospo nodemon --exec babel-node ./src/index.ts --extensions .ts', { stdio: 'inherit' })
else if (os.type() === 'Windows_NT') execSync('SET REGION=kospo&& nodemon --exec babel-node ./src/index.ts --extensions .ts', { stdio: 'inherit' })
else throw new Error('Unsupported OS found: ' + os.type())
