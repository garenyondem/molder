# Molder Service

This is a standalone image processing service for your toolbelt. Harnessing the power of awesome [Sharp](https://github.com/lovell/sharp) library, [gRPC](https://github.com/grpc/grpc-node) and [Node.js](https://github.com/nodejs/node)

<br/>

### Disclaimer

Use with caution. Experiment with small images and workloads (<300 uploads/s), watch for memory and cpu consumption levels before using in production.

Besides you will probably want to make some modifications, currently it saves processed images to file sytem which is not a viable solution for any environment especially if you plan to tuck this in a container.
