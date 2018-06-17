import fs from 'fs'
import csv2json from 'csv2json'
import mkdirp from 'mkdirp'

const uploadDir = '../tmp'

export const storeFSCSV = ({ stream, companyName }) => {
  // Ensure upload directory exists
  mkdirp.sync(uploadDir)
  const fileName = `${uploadDir}${companyName}.json`
  fs.unlinkSync(fileName)
  return new Promise((resolve, reject) =>
    stream
      .pipe(csv2json({
        // Defaults to comma.
        separator: ','
      }))
      .pipe(fs.createWriteStream(fileName))
      .on('error', error => reject(error))
      .on('finish', () => resolve({ fileName }))
  )
}
