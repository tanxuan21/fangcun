import { MenuContainer } from './MenuContainer'
// import { MenuProvider } from './MenuContent'
import { MenuItem } from './MenuItem'
export const MenuDemo = () => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill,110px)',
        gap: '10px',
        padding: '20px'
      }}
    >
      {Array(20)
        .fill(0)
        .map((item, i) => {
          return (
            <MenuContainer
              key={i}
              id={i + ''}
              Styles={{
                width: '110px',
                maxHeight: '200px'
              }}
              trigger={['ContextMenu']}
              ui={
                <>
                  {Array(10)
                    .fill(0)
                    .map((item, idx) => (
                      <MenuItem key={idx} id={idx + ''}>
                        菜单项 {idx}
                      </MenuItem>
                    ))}
                </>
              }
            >
              <div
                key={i}
                style={{
                  borderRadius: '10px',
                  width: '100px',
                  height: '100px',
                  background: '#cccccc4b',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                普通菜单
              </div>
            </MenuContainer>
          )
        })}
    </div>
  )
}
