const predictClassification = require("../services/inferenceService");
const { storeData } = require('../services/storeData');
const { getPredictionHistories } = require('../services/storeData');
const crypto = require("crypto");
const InputError = require('../exceptions/InputError');

async function postPredictHandler(request, h) {
    try {
        const { image } = request.payload;
        const { model } = request.server.app;

        if (!image) {
            throw new InputError('Terjadi kesalahan dalam melakukan prediksi', 400);
        }

        const { confidenceScore, label, suggestion } = await predictClassification(model, image);

        const id = crypto.randomUUID();
        const createdAt = new Date().toISOString();

        const data = {
            id: id,
            result: label,
            suggestion: suggestion,
            createdAt: createdAt,
        };

        await storeData(id, data);

        const response = h.response({
            status: "success",
            message: confidenceScore > 0 ? "Model is predicted successfully" : "Please use the correct picture",
            data,
        });
        response.code(201);
        return response;
    } catch (error) {
        const errorMessage = 'Terjadi kesalahan dalam melakukan prediksi';
        
        if (error instanceof InputError) {
            throw new InputError(errorMessage, 400);
        }

        throw new InputError(errorMessage, 400);
    }
}

async function getPredictionHistoriesHandler(request, h) {
    try {
        const histories = await getPredictionHistories();

        return h.response({
            status: "success",
            data: histories,
        }).code(200);
    } catch (error) {
        console.error('Error fetching prediction histories:', error);

        return h.response({
            status: "error",
            message: "Failed to retrieve prediction histories.",
        }).code(500);
    }
}

module.exports = {
    postPredictHandler,
    getPredictionHistoriesHandler,
};