import React, { Component } from 'react';
import axios from 'axios';
import './Movie.css';
import URL from './Const.js';

class Movie extends Component {
  state = {
    posters: '',
  }

  constructor() {
    super()

    const make_grid = (ele, idx) => <Grid ele={ele} key={idx} />
    const make_grids = (data) => <Wrapper num={data[0]['scale']} item={data.map((ele, idx) => make_grid(ele, idx))}/>

    axios.get(URL.MOVIE)
    .then(res => res.data.data)
    .then(data => {
      let max = { 'h': 0, 'w': 2 ** data[0]['scale'] }
      let left = { 'x': 1, 'y': 1 }

      let pre_scale = 0
      for (let i of data) {
        if (max['h'] === 0) {
          max['h'] = 2 ** i['scale']
          left['area'] = max['w'] * max['h']
        }

        if (pre_scale !== 0 && i['scale'] !== pre_scale) {
          left['py'] = left['y'] + 2 ** i['scale']
          left['px'] = left['x']
        }

        i['row'] = { 'start': 1, 'end': 1 }
        i['col'] = { 'start': 1, 'end': 1 }

        i['row']['start'] = left['y']
        i['row']['end'] = i['row']['start'] + 2 ** i['scale']

        i['col']['start'] = left['x']
        i['col']['end'] = i['col']['start'] + 2 ** i['scale']

        left['area'] -= (2 ** i['scale']) ** 2
        left['x'] = i['col']['end']

        if (left['x'] > max['w']) {
          left['x'] = left['px']
          left['y'] = left['py']
        }

        if (left['area'] === 0) {
          left['x'] = 1
          left['y'] = i['row']['end']
          max['h'] = 0
        }

        pre_scale = i['scale']
      }
      return data
    })
    .then(data => make_grids(data))
    .then(wrapper => this.setState({...this, posters: wrapper}))
    .catch(err => console.log(err))
    .finally(() => null)
  }

  render() {
    return <div>{this.state.posters}</div>;
  }
}

class Wrapper extends Component {
  make_style(row, col) {
    return {
      gridTemplateRows: 'repeat(' + row + ', 1fr)',
      gridTemplateColumns: 'repeat(' + 2 ** col + ', 1fr)',
    }
  }

  render() {
    return <div
      className='wrapper'
      style={this.make_style(null, this.props.num, this.props.num)}>{this.props.item}
    </div>
  }

  componentDidMount() {
    const first = document.querySelector('.grid-item').offsetWidth
    const max_row = Math.max(...this.props.item.map(ele => ele.props.ele['row']['end']))
    document.querySelectorAll('.wrapper').forEach(
      ele => {
        ele.style.height = 140 / 2 ** this.props.num * max_row + 'vw';
        ele.style.gridTemplateRows = 'repeat(' + max_row + ', 1fr)';
        // this.make_style(
        //   this.props.item[0].props.ele['col']['end'],
        //   max_row,
        //   this.props.num
        // )
      }
    )
    console.log(document.querySelector('.wrapper').style)

    document.querySelectorAll('.grid-item').forEach(
      ele => {
        if (ele.offsetWidth > 600)
          ele.style.backgroundSize = 'initial'
      }
    )
  }
}

class Grid extends Component {
  make_style(ele) {
    return {
      gridRowStart: ele['row']['start'],
      gridRowEnd: ele['row']['end'],
      gridColumnStart: ele['col']['start'],
      gridColumnEnd: ele['col']['end'],
      backgroundImage: 'url(' + ele['img'] + ')',
    }
  }

  render() {
    return <div
      className='grid-item'
      style={this.make_style(this.props.ele)}>
    </div>
  }
}

export default Movie;
