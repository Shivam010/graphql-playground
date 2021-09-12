import * as React from 'react'
import * as fetch from 'isomorphic-fetch'
import Popup from './Popup'
import { throttle } from 'lodash'
import { Button } from './Button'
import { styled, css } from '../styled'
import { deserializeState } from '../state/localStorage'
import { RootState } from '../state/workspace/reducers'

export interface Props {
  onRequestClose: (endpoint: string) => void
  endpoint: string
}

export interface State {
  endpoint: string
  valid?: boolean
  noOfDocs?: number
}

export default class EndpointPopup extends React.Component<Props, State> {

  checkEndpoint = throttle(() => {
    if (this.state.endpoint.match(/^https?:\/\/\w+(\.\w+)*(:[0-9]+)?\/?.*$/)) {
      fetch(this.state.endpoint, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `{
        __schema {
          queryType {
            kind
          }
        }
      }`,
        }),
      })
        .then(res => {
          this.setState({ valid: res.status < 400 })
        })
        .catch(err => {
          this.setState({ valid: false })
        })
    }
  }, 500) as any

  constructor(props) {
    super(props)
    this.state = {
      endpoint: props.endpoint,
    }
  }

  componentDidMount() {
    this.checkEndpoint()
  }

  render() {
    const { valid } = this.state
    const list = this.savedEndpoints();
    return (
      <Popup onRequestClose={this.close} darkBg={true}>
        <Wrapper>
          <LogoWrapper>
            <Logo>
              <img src={require('../assets/logo.png')} alt="" />
              <Heading>GraphQL Playground</Heading>
            </Logo>
          </LogoWrapper>
          <Form action="" onSubmit={this.submit}>
            <Input
              type="text"
              placeholder="Enter an endpoint url..."
              value={this.state.endpoint}
              onChange={this.onChangeEndpoint}
              valid={typeof valid === 'boolean' && valid}
              invalid={typeof valid === 'boolean' && !valid}
              autoFocus={true}
            />

            {valid && (
              <Button purple={true} onClick={this.close}>
                Use Endpoint
              </Button>
            )}
          </Form>

          <Group>
            <Message>
              {list.length > 0 ? "Your saved workspaces:" : "You don't have any saved workspaces."}
            </Message>
            {list.map((st, i) => {
              const select = e => {
                this.state = st;
                this.close();
              }
              return <Item key={i} onClick={select}>
                {st.endpoint}
              </Item>
            })}
          </Group>
        </Wrapper>

        <PlaygroundDeveloper href="https://github.com/Shivam010">
          • Maintained By Shivam •
        </PlaygroundDeveloper>
      </Popup>
    )
  }

  private onChangeEndpoint = e => {
    this.setState({ endpoint: e.target.value }, this.checkEndpoint)
  }

  private submit = e => {
    e.preventDefault()
    this.close()
  }

  private close = () => {
    if (this.state.valid) {
      this.props.onRequestClose(this.state.endpoint)
    }
  }

  private savedEndpoints = () => {
    const state: RootState = deserializeState()

    const list: State[] = [];
    if (state) {
      /* tslint:disable-next-line */
      console.log("Saved state", state.workspaces.size);
      state.workspaces.forEach((ws, url) => {
        if (url !== "") {
          list.push({
            endpoint: url,
            valid: true,
            noOfDocs: ws.docs.size,
          })
        }
      })
    } else {
      /* tslint:disable-next-line */
      console.log("No saved workspaces state")
    }
    return list;
  }
}

const Wrapper = styled.div`
  box-sizing: border-box;
  margin-bottom: 50px;
`

const Form = styled.form`
  width: 100%;
  display: flex;
  flex: 1 1 auto;

  .button.button {
    padding-right: ${p => p.theme.sizes.small16};
    padding-left: ${p => p.theme.sizes.small16};
    background: #da1b7f;

    &:hover {
      background: ${p => p.theme.colours.purple};
    }
  }
`

interface InputProps {
  valid: boolean
  invalid: boolean
}

// prettier-ignore
const Input = styled<InputProps, 'input'>('input')`
  background: ${p => p.theme.colours.white10};
  border-radius: ${p => p.theme.sizes.smallRadius};
  padding: ${p => `${p.theme.sizes.small16} ${p.theme.sizes.medium25}`};
  font-weight: ${p => p.theme.sizes.fontSemiBold};
  color: white;
  font-size: 16px;
  display: block;
  width: 100%;
  text-align: center;
  flex: 1 1 auto;
  display: flex;

  transition: 250ms color;

  ${(p: any) =>
    p.valid ? css`
      color: ${k => k.theme.colours.green};
    `
      : p.invalid ? css`
      color: ${k => k.theme.colours.red};
    `
        : ``
  }
`

const Heading = styled.h1`
  margin-left: 38px;
  font-weight: 400;
  color: ${p => p.theme.colours.white};
`

const LogoWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`

const Logo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;

  img {
    width: 78px;
    height: 78px;
  }
`

const Group = styled.div`
  color: white;
  font-weight: bold;
  letter-spacing: 1px;
  width: 100%;
  display: flex;
  flex-direction: column;
`

const Message = styled.div`
  margin-top: 10px;
`

const Item = styled.div`
  width: 100%;
  margin-top: 10px;
  padding: 10px 0;
  text-align: center;
  background: rgb(218, 27, 127);
  border-radius: ${p => p.theme.sizes.smallRadius};

  white-space: nowrap;
  transition: background 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
  cursor: pointer;

  &:hover {
    background: rgb(204 12 141);
    transform: translate3D(0, 0, 0);
  }
`

const PlaygroundDeveloper = styled.a`
  color: ${p => p.theme.editorColours.textInactive};
  font-size: 12px;
  font-weight: bold;
  letter-spacing: 1px;
  cursor: pointer;

  width: 100%;
  text-align: center;
  position: fixed;
  bottom: 0;
  left: 0;
  text-decoration: none;

  padding: 10px;
  margin-bottom: 10px;

  &:hover {
    color: white;
  }
`