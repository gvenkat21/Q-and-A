import React, { Component } from 'react';

export class TextField extends Component {
  constructor(props) {
    super(props);
    this.state = {value: ''};

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleKeyDown = (e) => {
    console.log(e)
    if (e.key === 'Enter') {
      this.handleSubmit(e)
    }
  }

  handleSubmit(event) {
    this.props.setLoader(true);
    this.props.setQueryData(this.state.value);
    console.log('Text was submitted: ' + this.state.value);
    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          <textarea className="text-field" type="text" value={this.state.value} onChange={this.handleChange} onKeyDown={this._handleKeyDown} />
        </label><br></br> <br></br>
        <input className="submit-button" type="submit" value="Submit your query"></input>
      </form>
    );
  }
}