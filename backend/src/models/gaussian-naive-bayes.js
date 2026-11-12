
const fs = require('fs');
const path = require('path');

const datasetPath = path.join(__dirname, 'iris.data');

// Membaca dataset Iris
function loadDataset() {
    const content = fs.readFileSync(datasetPath, 'utf8');

    return content
        .split(/\r?\n/)
        .filter(line => line.trim() !== '')
        .map(line => {
            const values = line.split(',');

            return {
                features: values.slice(0, 4).map(Number),
                label: values[4].trim()
            };
        });
}

// Menghitung rata-rata
function mean(values) {
    return values.reduce((sum, value) => sum + value, 0) / values.length;
}

// Menghitung varians
function variance(values, average) {
    return values.reduce(
        (sum, value) => sum + Math.pow(value - average, 2),
        0
    ) / values.length;
}

// Fungsi probabilitas distribusi Gaussian
function gaussianProbability(value, average, varianceValue) {
    const safeVariance = Math.max(varianceValue, 1e-9);

    const exponent = Math.exp(
        -Math.pow(value - average, 2) / (2 * safeVariance)
    );

    return (
        1 / Math.sqrt(2 * Math.PI * safeVariance)
    ) * exponent;
}

// Melatih model Gaussian Naive Bayes
function trainModel() {
    const dataset = loadDataset();
    const classes = {};

    dataset.forEach(item => {
        if (!classes[item.label]) {
            classes[item.label] = [];
        }

        classes[item.label].push(item.features);
    });

    const model = {};

    for (const label of Object.keys(classes)) {
        const samples = classes[label];

        model[label] = {
            prior: samples.length / dataset.length,
            means: [],
            variances: []
        };

        for (let featureIndex = 0; featureIndex < 4; featureIndex++) {
            const values = samples.map(
                sample => sample[featureIndex]
            );

            const average = mean(values);

            model[label].means.push(average);
            model[label].variances.push(
                variance(values, average)
            );
        }
    }

    return model;
}

const model = trainModel();

// Menjalankan prediksi
function predict(features) {
    if (
        !Array.isArray(features) ||
        features.length !== 4 ||
        !features.every(
            value => typeof value === 'number' && Number.isFinite(value)
        )
    ) {
        throw new Error('Input harus berupa 4 angka numerik yang valid');
    }

    const scores = {};

    for (const [label, parameters] of Object.entries(model)) {
        let score = Math.log(parameters.prior);

        for (let i = 0; i < 4; i++) {
            const probability = gaussianProbability(
                features[i],
                parameters.means[i],
                parameters.variances[i]
            );

            score += Math.log(Math.max(probability, 1e-300));
        }

        scores[label] = score;
    }

    // Mengubah skor menjadi probabilitas relatif
    const maxScore = Math.max(...Object.values(scores));

    const probabilities = {};

    const total = Object.values(scores).reduce(
        (sum, score) => sum + Math.exp(score - maxScore),
        0
    );

    for (const [label, score] of Object.entries(scores)) {
        probabilities[label] =
            Math.exp(score - maxScore) / total;
    }

    const predictedClass = Object.entries(probabilities)
        .sort((a, b) => b[1] - a[1])[0][0];

    return {
        predictedClass,
        probabilities
    };
}

module.exports = {
    predict
};
