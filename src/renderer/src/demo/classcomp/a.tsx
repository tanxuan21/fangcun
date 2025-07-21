import { useEffect, useState } from 'react'

class B {
  dataB: { id: number; ACom: A | null } = { id: 1, ACom: null }
  render() {
    return (
      <div key={this.dataB.id}>
        <span>{this.dataB.id}</span>
        <button
          onClick={() => {
            console.log('父组件', this.dataB.ACom?.get_dataA())
            // 为什么这里得到的都是旧状态？
          }}
        >
          获取父组件的状态
        </button>
      </div>
    )
  }
}

class A {
  dataA: {
    c: number
  } = { c: 0 }

  get_dataA() {
    return this.dataA
  }

  create_sub() {
    const b1 = new B()
    const b2 = new B()
    const b3 = new B()
    b1.dataB.ACom = this
    b2.dataB.ACom = this
    b3.dataB.ACom = this

    b2.dataB.id = 2
    b3.dataB.id = 3
    return [b1, b2, b3]
  }
  render() {
    const [B_data, set_B_data] = useState<B[]>([])
    useEffect(() => {
      set_B_data(this.create_sub()) // 创建子组件（节点），从文件读取等等。。。
    }, [])
    return (
      <div>
        <button
          onClick={() => {
            this.dataA.c = this.dataA.c + 1
            console.log('父组件', this.dataA)
          }}
        >
          更新父组件状态
        </button>
        {B_data.map((item) => {
          return item.render()
        })}
      </div>
    )
  }
}

export const ATest = () => {
  return <>{new A().render()}</>
}
