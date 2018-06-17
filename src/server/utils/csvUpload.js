import fs from 'fs'
import csv2json from 'csv2json'
import mkdirp from 'mkdirp'

const uploadDir = '../tmp'

export default ({ stream, companyName }) => {
  // Ensure upload directory exists
  mkdirp.sync(uploadDir)
  const filePath = `${uploadDir}${companyName}.json`
  fs.unlinkSync(filePath)
  return new Promise((resolve, reject) =>
    stream
      .pipe(csv2json({
        // Defaults to comma.
        separator: ','
      }))
      .pipe(fs.createWriteStream(filePath))
      .on('error', error => reject(error))
      .on('finish', () => resolve({ filePath }))
  )
}
