import path from 'path'
import fs from 'fs'
import uuid from 'uuid'
import mkdirp from 'mkdirp'

const uploadDir = path.join(__dirname, '../public/images')


// Ensure upload directory exists
mkdirp.sync(uploadDir)

export const storeFS = ({ stream, filename }) => {
  const id = uuid.v4()
  const path = `${uploadDir}/${id}-${filename}`
  return new Promise((resolve, reject) =>
    stream
      .on('error', error => {
        if (stream.truncated)
          // Delete the truncated file
          fs.unlinkSync(path)
        reject(error)
      })
      .pipe(fs.createWriteStream(path))
      .on('error', error => reject(error))
      .on('finish', () => resolve({ path }))
  )
}
