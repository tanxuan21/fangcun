class Words {
  database_path: string = '/Users/tanxuan21/Documents/FangCun/data/words/data.json'
  data: {
    [key: string]: string
  } = {}

  async load() {
    const json_str = await window.api.readFile(this.database_path)
    this.data = JSON.parse(json_str)
  }
}

const WordsInstance = new Words()
await WordsInstance.load()
export { WordsInstance }
