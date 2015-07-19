# wave-edit

selectable wave ui component [demo](http://davejustice.com/wave-edit/)

## usage

``` js
wave = new WaveEdit({
  progressColor: '#DF79DF',
  waveColor: '#52F6A4',
  width: 800,
  height: 800 / 6,
  buffer: src.buffer, // audiobuffer
  onclick: onclickwave,
  cursorStyle: '1px solid orange'
  selectable: true
});

wave.on('selection', function(obj) {
  // obj {left: 150, right: 255, width: 105}
})

src.on('time', function(time) {
  wave.setProgress(time.percent)
});

function onclickwave(ev) {
  if (wave.selectable) return;
  if (src.source) src.pause();
  src.play(src.time().total * (ev.offsetX / wave.width))
}
```

`src` above is an [audiosource](https://npmjs.com/package/audiosource)
but could easily be another abstraction over the web audio api.

Further documentation will be added in future(PRs welcome!), for now take a look at the constructor
method in [lib/wave-edit.js](lib/wave-edit.js) for available options.
