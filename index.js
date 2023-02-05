const app = require('express')();
const limiter = require('express-rate-limit');
const fs = require('fs');
const port = process.env.PORT || 1234;

if (!fs.existsSync('./pin.txt')) fs.writeFileSync('./pin.txt',
  Math.floor(1000 + Math.random() * 9000).toString().slice(0, 4)
);
if (!fs.existsSync('./correct.txt')) fs.writeFileSync('./correct.txt', (0).toString());

app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));

app.set('trust proxy', 1);
app.use('/g', limiter({
  windowMs: 5 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: true,
  message: 'Too Many Requests, Blocked For 5 Minutes'
}));

app.get('/s', (req, res) => {
  res.send(fs.readFileSync('./correct.txt', {encoding: 'UTF-8'}));
});

app.get('/g', (req, res) => {
  let guess = req.query.pin;
  let pin = fs.readFileSync('./pin.txt', {encoding: 'UTF-8'});
  let correct = fs.readFileSync('./correct.txt', {encoding: 'UTF-8'});

  if (!guess) return res.send('Enter A Pin In The Query');
  if (isNaN(guess)) return res.send('Not A Number');
  if (guess.length !== 4) return res.send('4 Digit Pin Required');

  console.log(guess, '?', pin);

  if (Math.floor(guess) !== Math.floor(pin)) {
    res.send('Incorrect Pin!');
  } else {
    correct++;
    res.send('Pin Correct, Rerolling...')
    fs.writeFileSync('./pin.txt',
      Math.floor(1000 + Math.random() * 9999).toString().slice(0, 4)
    );
    fs.writeFileSync('./correct.txt', correct.toString());
  }
});

app.listen(port,() => console.log('Online At', port));
