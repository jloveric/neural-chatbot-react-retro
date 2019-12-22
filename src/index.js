import React, { Component } from 'react';
import { BasicBot } from 'neural-chatbot';
import { UserData } from 'neural-phrasex';

import defaultConfig from './Chatbot';

class NeuralChatbotRetro extends Component {

  static defaultProps = {
    backgroundColor: 'black',
    botColor: 'green',
    userColor: 'orange',
    botSymbol: '',
    userSymbol: '>',
    startMessage: "Loading up.  Wait a bit.",
    finishedLoadingMessage: "Ok,I'm ready.",
    fontSize: "large",
    botConfig: defaultConfig
  }

  constructor(props) {
    super(props)
    this.props = props

    this.state = {
      value: "",
      list: [],
      response: ''
    }

    this.userData = null
    this.bot = null
    this.botConfig = this.props.config
    // create a ref to store the textInput DOM element
    this.textInput = React.createRef();
    this.focus = this.focus.bind(this);
  }

  focus() {
    // Explicitly focus the text input using the raw DOM API
    // Note: we're accessing "current" to get the DOM node
    this.textInput.current.focus();
  }

  computeBotText(text) {
    return { text: text, user: "bot", color: this.props.botColor, symbol: this.props.botSymbol }
  }
  computeUserText(text) {
    return { text: text, user: "user", color: this.props.userColor, symbol: this.props.userSymbol }
  }

  async addText(text, func) {
    await this.setState((state) => {
      let list = state.list
      list.push(func(text))
      return { input: list }
    })
  }

  async addTextClear(text, func) {
    await this.setState((state) => {
      let list = state.list
      list.push(func(text))
      return { input: list, value: '' }
    })
  }

  componentDidMount() {
    this.addTextClear(this.props.startMessage, this.computeBotText.bind(this))

    this.bot = new BasicBot()
    
    this.bot.initialize(this.props.botConfig).then(() => {
      this.userData = new UserData()
      this.userData.initialize()
      this.addText(this.props.finishedLoadingMessage, this.computeBotText.bind(this))
    })
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
  }

  async handleSubmit(event) {
    event.preventDefault()
    // this.setState({title : event.target.value})
    // value needs to be copied before being used in setState
    console.log('event.target', event.target)
    let inputValue = this.state.value
    console.log('this.state', this.state)

    this.addTextClear(inputValue, this.computeUserText.bind(this))

    if (this.bot) {
      try {
        let ans = await this.bot.getResult(inputValue, this.userData)
        this.addTextClear(ans.response, this.computeBotText.bind(this))
        console.log('ans', ans.response)
      } catch (error) {
        console.log('error', error)
      }
      return 'Testing'
    }
  }

  render() {
    return (<form id="mainForm" autoComplete="off" onSubmit={this.handleSubmit.bind(this)} style={{ backgroundColor: this.props.backgroundColor, border: 'none', "fontSize": this.props.fontSize }}>
      {
        this.state.list.map((val, id) => {
          return <div key={id} style={{ color: val.color, borderColor: this.props.backgroundColor, border: 'none' }} dangerouslySetInnerHTML={{__html : val.symbol + val.text}}/>
        })
      }
      <div style={{ color: this.props.userColor, display: "inline-block", "textAlign": "right" }}>{this.props.userSymbol}</div>
      <input ref={this.textInput} autoFocus type="text" name="name" value={this.state.value} onChange={this.handleChange.bind(this)}
        style={{ "fontSize": this.props.fontSize, backgroundColor: this.props.backgroundColor, color: this.props.userColor, border: "none", autoComplete: "off", outline: "none" }} />
    </form>)
  }
}

export default NeuralChatbotRetro