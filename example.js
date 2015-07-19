var ctx = new AudioContext()
var AudioSource = require('audiosource');
var WaveEdit = require('./lib/wave-edit');

var wave;
var src = new AudioSource({
  url: './vibrate.mp3',
  context: ctx
});

src.on('load', function() {
  // src.play();
  wave = new WaveEdit({
    progressColor: '#DF79DF',
    waveColor: '#52F6A4',
    width: 800,
    height: 800 / 6,
    buffer: src.buffer,
    onclick: onclickwave,
    selectable: true
  });

  var selectionContain = document.querySelector('span');
  wave.on('selection', function(obj) {
    selectionContain.innerText = JSON.stringify(obj, null, 2);
  })

  document.querySelector('#content').appendChild(wave.target);
});

src.on('time', function(time) {
  wave.setProgress(time.percent)
});

src.load();

function onclickwave(ev) {
  if (wave.selectable) return;
  if (src.source) src.pause();
  src.play(src.time().total * (ev.offsetX / wave.width))
}

document.querySelector('.play').addEventListener('click', function (ev) {
  if (src.source) src.pause();
  wave.selectable = false;
  src.play()
});
