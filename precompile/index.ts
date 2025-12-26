import path from 'path'
import { Project, Node } from 'ts-morph'

const pj = new Project({
  tsConfigFilePath: path.resolve(__dirname, '../tsconfig.node.json') // 你要编译的那个 ts
})
// import { IPC_File } from '../src/main/File/File'
import fs from 'fs/promises'

// console.log(IPC_File)

const module_path = path.resolve(__dirname, '../src/main/API/api2.ts')

const main = (module_path) => {
  //   const ipcDecls = exportedVars.get('IPC_api2') // 过滤，模糊查询
  const source = pj.getSourceFileOrThrow(module_path)
  // 导出的东西
  const exportedVars = source.getExportedDeclarations() // Map<string, Node[]> {"IPC_File" => [VariableDeclaration]}
  const ipcDecls = Array.from(exportedVars.entries())
    .filter(([name]) => name.startsWith('IPC_'))
    .map(([name, nodes]) => {
      const decl = nodes[0]

      if (!Node.isVariableDeclaration(decl)) throw new Error('必须是 const 变量')
      return decl
    })
  if (ipcDecls.length <= 0) {
    throw new Error('没有找到模块')
  }
  const ipcvar = ipcDecls[0]

  if (!Node.isVariableDeclaration(ipcvar)) {
    // 类型守卫。必须判const，后面的Initializer才能允许出现
    throw new Error('IPC_模块 必须是 const')
  }

  const name = ipcvar.getName()
  // 生成 main 里使用的，绑定监听事件的

  const general_main = () => {
    const code = `
    import {BrowserWindow} from 'electron'
    import {IPCMAIN_HANDLE} from './IPCMAIN'
    import {${name}} from '${module_path.replace(/\.ts$/, '').replace(/\\/g, '/')}' // 导入路径代码 
    export const BIND_IPCMAIN_HANDLE = (mainWindow:BrowserWindow)=>{
            IPCMAIN_HANDLE(${name}(mainWindow));
        }
    `
    fs.writeFile('src/main/general.ts', code)
  }
  general_main()

  // 初始化表达式
  const initializer = ipcvar.getInitializer() // 等号右边的东西就是 initializer

  if (!initializer || !Node.isArrowFunction(initializer)) {
    throw new Error('必须是箭头函数')
  }
  const body = initializer.getBody()

  let objectLiteral
  // 拆掉括号
  if (Node.isObjectLiteralExpression(body)) {
    objectLiteral = body
  } else if (Node.isParenthesizedExpression(body)) {
    const expr = body.getExpression()
    if (!Node.isObjectLiteralExpression(expr)) {
      throw new Error('箭头函数必须返回字面量类型')
    }
    objectLiteral = expr
  } else throw new Error('箭头函数返回类型不支持')

  const methods = objectLiteral
    .getProperties()
    .filter(Node.isPropertyAssignment)
    .map((p) => {
      const name = p.getName().replace(/^['"]|["']$/g, '') // 清洗掉代码里的引号
      const fn = p.getInitializer()
      return {
        name,
        fn: fn.getText(),
        parameters: fn
          .getParameters()
          .slice(1)
          .map((d) => {
            return {
              name: d.getName(),
              type: d.getType().getText()
            }
          }),
        returnType: fn.getReturnType().getText()
      }
    })

  fs.writeFile('./out.json', JSON.stringify(methods))

  const converUpperCameICase = (name: string) => {
    const words = name.split('-')
    let ans = ''
    for (const w of words) {
      if (w.length > 0) {
        const w_upper = w[0].toUpperCase() + w.slice(1)
        ans += w_upper
      }
    }
    return ans
  }
  const generalInterface = () => {
    let interface_items: string[] = []
    let preload_items: string[] = []
    for (const item of methods) {
      const fn_name = converUpperCameICase(item['name'])
      interface_items.push(
        `${fn_name} : (${item['parameters'].map((p) => `${p['name']}:${p['type']}`)})=>${item['returnType']}`
      )
      const parameters_list = item['parameters'].map((p) => p['name']).join(',')
      preload_items.push(
        `${fn_name} : async (${parameters_list})=>{return await ipcRenderer.invoke("${item['name']}", ${parameters_list})}`
      )
    }

    const api_interface_code = `export interface general_api_interface  {${interface_items.join('\n')}}`
    const preload_code = `
    import { ipcRenderer } from 'electron'
    export const general_preload_expose = () => {
  return {
  ${preload_items.join(',\n')}
  }}`

    fs.writeFile('type/general.d.ts', api_interface_code)
    fs.writeFile('src/preload/general.ts', preload_code)
  }

  generalInterface()
}
main(module_path)
// 生成 preload 的
/**
 ArrowFunction
 └─ ParenthesizedExpression
     └─ ObjectLiteralExpression
 */
