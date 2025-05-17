module.exports = {
  readEvents: async (fileName) => {
    console.log('Reading events')

    const fm = FileManager.iCloud()

    const filePath = fm.joinPath(fm.documentsDirectory(), fileName)
    console.log(filePath)

    if (!fm.fileExists(filePath)) {
      fm.writeString(
        filePath,
        JSON.stringify([
          {
            title: '🍾🎆',
            month: 1,
            day: 2,
          },
          {
            title: '🎃',
            month: 10,
            day: 31,
          },
        ]),
      )
    }

    if (fm.fileExists(filePath)) {
      const isDownloaded = fm.isFileDownloaded(filePath)

      if (!isDownloaded) {
        await fm.downloadFileFromiCloud(filePath)
      }

      const json = JSON.parse(fm.readString(filePath))
      return json
    }
  },
  writeEvents: async (events, fileName) => {
    console.log('Writing events')
    const fm = FileManager.iCloud()
    const filePath = fm.joinPath(fm.documentsDirectory(), fileName)

    if (fm.fileExists(filePath)) {
      const isDownloaded = fm.isFileDownloaded(filePath)

      if (!isDownloaded) {
        await fm.downloadFileFromiCloud(filePath)
      }

      fm.writeString(filePath, JSON.stringify(events))
    } else {
    }
  },
}
