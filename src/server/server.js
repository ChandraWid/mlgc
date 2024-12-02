require('dotenv').config();

const Hapi = require('@hapi/hapi');
const routes = require('../server/routes');
const loadModel = require('../services/loadModel');
const InputError = require('../exceptions/InputError');


(async () => {
    const server = Hapi.server({
        port: 8080,
        host: '0.0.0.0',
        routes: {
            cors: {
                origin: ['*'],
            },
            payload: {
                maxBytes: 1024 * 1024,
            },
        },
    });

    const model = await loadModel();
    server.app.model = model;

    server.route(routes);

    server.ext('onPreResponse', function (request, h) {
        const response = request.response;

        if (response.isBoom) {
            if (response.output.statusCode === 413) {
                const newResponse = h.response({
                    status: "fail",
                    message: "Payload content length greater than maximum allowed: 1000000",
                });
                newResponse.code(413);
                return newResponse;
            }

            if (response instanceof InputError) {
                const newResponse = h.response({
                    status: "fail",
                    message: response.message,
                });
                newResponse.code(response.statusCode || 400);
                return newResponse;
            }

            const newResponse = h.response({
                status: "error",
                message: "An internal server error occurred.",
            });
            newResponse.code(500);
            return newResponse;
        }

        return h.continue;
    });

    await server.start();
    console.log(`Server start at: ${server.info.uri}`);
})();