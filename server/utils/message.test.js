var expect = require('expect');
var {generateMessage, generateLocationMessage} = require('./message');

describe('genergateMessage', () => {
  it('should generate correct message object', () => {
    var from = 'jen';
    var text = 'Some message';
    var message = generateMessage(from, text);

    expect(message.createdAt).toBeA('number');
    expect(message).toInclude({
      from,
      text
    });
  });
});

describe('generateLocationMessage', () => {
  it('should generate correct location message', () => {
    var from = 'admin';
    var latitude = 44;
    var longitude = 55;
    var url = `https://www.google.com/maps?q=44,55`;
    var message = generateLocationMessage(from,latitude,longitude);

    expect(message.createdAt).toBeA('number');
    expect(message).toInclude({from, url});
  });
});
