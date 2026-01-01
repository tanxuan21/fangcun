export function GetTodayTimeBegin2End(): { begin: string; end: string } {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return {
    begin: `${year}-${month}-${day} 00:00:00`,
    end: `${year}-${month}-${day} 23:59:59`
  }
}
