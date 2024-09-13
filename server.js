const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


function runModel(formData) {
    return Math.random() > 0.5 ? 'yes' : 'no';
}

app.post('/submit', (req, res) => {
    const formData = req.body;
    const dataRow = Object.values(formData).join(',') + '\n';

    fs.appendFile('data_points.csv', dataRow, (err) => {
        if (err) {
            console.error('Error writing to CSV file', err);
            return res.status(500).send('Error saving data');
        }

        const modelResult = runModel(formData);
        fs.appendFile('output.csv', `${modelResult}\n`, (err) => {
            if (err) {
                console.error('Error writing to output.csv', err);
                return res.status(500).send('Error saving model result');
            }
            res.redirect(`/result?lastResult=${modelResult}`);
        });
    });
});
app.get('/result', (req, res) => {
    const lastResult = req.query.lastResult; 
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Model Result</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }
                h1 { font-size: 24px; color: #333; }
                .result { font-size: 36px; color: ${lastResult === 'yes' ? 'green' : 'red'}; }
            </style>
        </head>
        <body>
            <h1>Model Result</h1>
            <p class="result">${lastResult}</p>
            <a href="/">Go Back</a>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
