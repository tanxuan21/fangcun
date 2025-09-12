export type file_api = {
  SaveCSVFile: (book_name: string, content: any) => Promise<string | null>
}
