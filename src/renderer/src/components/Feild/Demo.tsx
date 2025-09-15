import { Feild, FeildContainer } from './Feild'

export const FeildDemo = () => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <div
        style={{
          width: '80%'
        }}
      >
        <h4>number feild</h4>
        <Feild.Number
          onChangeDefaultValue={(v) => {
            console.log(v)
          }}
        />
        <br></br>
        <h4>string feild</h4>
        <Feild.String
          onChangeDefaultValue={(v) => {
            console.log(v)
          }}
        />{' '}
        <br></br>
        <h4>boolean feild</h4>
        <Feild.Boolean
          onChangeDefaultValue={(v) => {
            console.log(v)
          }}
        ></Feild.Boolean>{' '}
        <br></br>
        <h4>state feild</h4>
        <Feild.State
          onChangeDefaultValue={(v) => {
            console.log(v)
          }}
        />
        <br></br>
        <hr />
        <br />
        <h4>number container</h4>
        <FeildContainer
          type="Number"
          onChangeDefaultValue={(e) => {
            console.log(e)
          }}
        ></FeildContainer>
      </div>
    </div>
  )
}
