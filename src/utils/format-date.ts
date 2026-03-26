export function formatDate(lastUpdate: string) {
  const date = new Date(lastUpdate)
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }
  const formattedDate = date.toLocaleDateString('pt-BR', options)

  return formattedDate
}
