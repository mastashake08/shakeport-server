require('dotenv').config();
const { createQuicSocket } = require('net');

// Create the QUIC UDP IPv4 socket bound to local IP port 1234
const socket = createQuicSocket({ endpoint: { port: 1234 } });

// Tell the socket to operate as a server using the given
// key and certificate to secure new connections, using
// the fictional 'hello' application protocol.
socket.listen({ process.env.KEY, process.env.CERT, alpn: 'hello' });

socket.on('session', (session) => {
  // A new server side session has been created!
  console.log('session opened....')
  session.on('secure', () => {
    console.log('secure connection established....')
    // Once the TLS handshake is completed, we can
    // open streams...
    const uni = session.openStream({ halfOpen: process.env.HALF_OPEN });
    uni.write('hi ');
    uni.end('from the server!');
  });

  // The peer opened a new stream!
  session.on('stream', (stream) => {
    // Let's say hello
    stream.end('Hello World');

    // Let's see what the peer has to say...
    stream.setEncoding('utf8');
    stream.on('data', console.log);
    stream.on('end', () => console.log('stream ended'));
  });
});

socket.on('listening', () => {
  // The socket is listening for sessions!
  console.log('Listening for connections.....')
});
