import styles from './styles.module.scss'

class PieMenu {
  container: HTMLElement | null = null
  menu_container = document.createElement('div')
  constructor() {}
  mount(el: HTMLElement) {
    // 绑定事件
    el.appendChild(this.render())
    el.removeEventListener('contextmenu', this.handle_content_menu)
    el.addEventListener('contextmenu', this.handle_content_menu)
  }

  handle_content_menu = (event: MouseEvent) => {
    event.preventDefault()
    this.show_menu(event)
  }

  show_menu(event: MouseEvent) {
    this.menu_container.style.left = `${event.clientX}px`
    this.menu_container.style.top = `${event.clientY}px`
    this.menu_container.style.display = 'block'
  }
  hide_menu() {
    this.menu_container.style.display = ''
  }
  render() {
    this.menu_container.classList.add(styles['menu-container'])
    return this.menu_container
  }
}

export { PieMenu }
