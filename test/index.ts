import server from './server';
import client from './client';

(async () => {
    // first server
    await server();
    // then client
    await client();
})();
