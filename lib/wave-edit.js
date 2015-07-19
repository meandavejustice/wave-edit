var EventEmitter = require('events').EventEmitter
var debounce = require('lodash.debounce')
var inherits = require('inherits')
var xtend = require('xtend')
var h = require('virtual-dom/h')
var main = require('main-loop')
var drawWave = require('draw-wave')
var DEFAULT_WIDTH = 600

module.exports = WaveEdit

inherits(WaveEdit, EventEmitter)

function WaveEdit(opts) {
  EventEmitter.call(this);
  if (!opts.width) opts.width = DEFAULT_WIDTH
  if (!opts.height) opts.height = opts.width / 2
  if (!opts.onclick) opts.onclick = noop
  if (!opts.onmouseup) opts.onmouseup = noop
  if (!opts.onmousedown) opts.onmousedown = noop
  if (!opts.onmousemove) opts.onmousemove = noop
  if (!opts.buffer) opts.buffer = null
  if (!opts.selectable) opts.selectable = false
  if (!opts.selectionColor) opts.selectionColor = 'rgba(197, 95, 199, 0.45098)'
  if (!opts.cursorStyle) opts.cursorStyle = '1px solid orange'

  this.width = opts.width
  this.height = opts.height
  this.onclick = opts.onclick
  this.onmouseup = opts.onmouseup
  this.onmousedown = opts.onmousedown
  this.onmousemove = opts.onmousemove
  this.buffer = opts.buffer

  // locally tracked state YUCK!
  this.selectable = opts.selectable

  var wave = this
  var initState = {progress: 0, haveBuffer: false, bufferNeedsUpdate: true,
                   buffer: opts.buffer, selectionLeft: 0, selectionWidth: 0,
                   moving: false, initSelection: false}
  this.loop = main(initState, render, require('virtual-dom'))
  this.target = this.loop.target
  this.progressColor = opts.progressColor || '#DF79DF'
  this.waveColor = opts.waveColor || '#DF79DF'

  function noop() {}

  render(initState)

  function render(state) {
    if (state.bufferNeedsUpdate && wave.loop && state.buffer) {
      wave.drawWaves(state.buffer)
      wave.loop.update(xtend(state, {bufferNeedsUpdate: false}))
    }

    return h('div', {style: {position: 'relative', width: opts.width+'px',
                             '-webkit-user-select': 'none',
                             '-moz-user-select': 'none',
                             '-ms-user-select': 'none',
                             'user-select': 'none'},
                     onclick: onclick,
                     onmousedown: onmousedown,
                     onmousemove: debounce(onmousemove),
                     onmouseup: onmouseup,
                     onmouseleave: onmouseup,
                     onmouseout: onmouseup
                    },
             [h('div.selection', {style: {
               width: state.selectionWidth+'px',
               left: state.selectionLeft+'px',
               display: state.initSelection ? 'block' : 'none',
               height: '100%',
               background: opts.selectionColor,
               position: 'absolute',
               'border-left': '1px solid transparent',
               'border-right': '1px solid transparent',
               'z-index': 3
             }}),
              h('div.progress-contain', {style: {
                width: state.progress,
                position: 'absolute',
                overflow: 'hidden',
                'border-right': opts.cursorStyle
             }},
                h('canvas#progress', {width: opts.width, height: opts.height})),
              h('div.wave-contain',
                h('canvas#wave', {width: opts.width, height: opts.height}))
             ])

    function onclick(ev) {
      opts.onclick(ev)
    }

    function onmouseup(ev) {
      // should be attatched to selection div
      if (!wave.selectable) return;
      wave.emit('selection', {
        left: state.selectionLeft,
        right: state.selectionLeft + state.selectionWidth,
        width: state.selectionWidth
      });
      wave.loop.update(xtend(state, {moving: false}))
      opts.onmouseup(ev)
    }

    function onmousedown(ev) {
      if (!wave.selectable) return;
      if (!state.moving) {
        wave.loop.update(xtend(state, {
          selectionLeft: (ev.offsetX / ev.target.offsetWidth) * wave.width,
          selectionWidth: 0,
          initSelection: true,
          moving: true}))
      }
      opts.onmousedown(ev)
    }

    function onmousemove(ev) {
      if (!state.moving) return;
      var leftPosition = state.selectionLeft;
      var rightPosition = ev.clientX;
      var diff = rightPosition - leftPosition;

      if (diff <=0) {
        diff = leftPosition - rightPosition;
        wave.loop.update(xtend(state, {selectionLeft: rightPosition}))
      }

      wave.loop.update(xtend(state, {selectionWidth: diff}))

      opts.onmousemove(ev)
    }
  }
}

WaveEdit.prototype.drawWaves = function(buffer) {
  drawWave.canvas(this.loop.target.querySelector('#progress'), buffer, this.progressColor);
  drawWave.canvas(this.loop.target.querySelector('#wave'), buffer, this.waveColor);
}

WaveEdit.prototype.setProgress = function(percent) {
  this.loop.update({progress: percent})
}
