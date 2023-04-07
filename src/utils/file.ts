export const getFileExtName = (fileName: string) => {
  const index = fileName.lastIndexOf('.')
  if (index === -1) {
    return ''
  }
  return fileName.substring(index + 1)
}

export const changeFileName = (fileName: string, newName: string) => {
  const index = fileName.lastIndexOf('.')
  if (index === -1) {
    return newName
  }
  return newName + fileName.substring(index)
}
