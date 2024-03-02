export function checkFileType(file: File, accepts: string[]) {
  const newTypes = accepts.join('|')
  // const reg = /\.(jpg|jpeg|png|gif|txt|doc|docx|xls|xlsx|xml)$/i;
  const reg = new RegExp('\\.(' + newTypes + ')$', 'i')

  return reg.test(file.name)
}
