import React, { Component } from "react"
import axios from "axios"
import io from "socket.io-client"

// this creates a socket and connects to our server
const socket = io(window.location.origin)

// when we successfully connect we log it.
socket.on("connect", () => {
  console.log("I am now connected to the server!")
})

export default class App extends Component {
  constructor() {
    super()
    this.state = {
      messages: [],
      newMessage: "",
    }
  }

  async componentDidMount() {
    // We need to HTTP fetch the messages like normal, because the socket only
    // gives us NEW messages, not OLD ones.
    const { data: messages } = await axios.get("/api/messages")
    this.setState({ messages })

    // Setup the socket to listen for new messages
    // As long as this component is mounted, it'll be listening
    // In a real app you might want to tear the socket down
    // when this component umounts in componentWillUnmount,
    // but in this simple example we'll ignore that for now since
    // App is always mounted
    socket.on("message-from-others", (message) => {
      this.setState({ messages: [...this.state.messages, message] })
    })
  }

  async handleSubmit(e) {
    e.preventDefault()
    await axios.post("/api/messages", {
      message: this.state.newMessage,
    })
    // Let's send the message over the socket.
    socket.emit("new-message", this.state.newMessage)
    // Fetch all new messages? Not necessary because our on 'new-message' handler
    // will trigger and update state for us.
    // const { data: messages } = await axios.get("/api/messages");
    // this.setState({ messages });
    // However we do need to take the currently typed message and put it into
    // state on our side, and clear out the newMessage state.
    this.setState({
      messages: [...this.state.messages, this.state.newMessage],
      newMessage: "",
    })
  }

  handleChange(e) {
    this.setState({ [e.target.name]: e.target.value })
  }

  render() {
    return (
      <main>
        <div className="messages">
          {this.state.messages.map((message) => (
            <div className="message">{message}</div>
          ))}
        </div>
        <form onSubmit={(e) => this.handleSubmit(e)}>
          <input
            type="text"
            name="newMessage"
            value={this.state.newMessage}
            onChange={(e) => this.handleChange(e)}
          />
          <button type="submit">Send</button>
        </form>
      </main>
    )
  }
}
