const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const jwt = require('jsonwebtoken');
const port = 3000;
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


const SESSION_KEY = 'Authorization';

function verifyToken(token) {
    if (!token) return null;

    try {
        const data = jwt.verify(token, process.env.JWT_SECRET);
        const user = users.find(user => user.login == data.login);

        if (!user) return null;
        return user.username;
    } catch (error) {
        console.error("JWT Verification Error:", error.message);
        return null;
    }
}

app.use((req, res, next) => {
    const sessionId = req.get(SESSION_KEY);

    req.username = verifyToken(sessionId);
    req.sessionId = sessionId;

    next();
});

app.get('/', (req, res) => {
    if (req.username) {
        return res.json({
            username: req.username,
            logout: 'http://localhost:3000/logout',
        });
    }
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/logout', (req, res) => {
    res.redirect('/');
});

const users = [
    {
        login: 'Login',
        password: 'Password',
        username: 'Username',
    },
    {
        login: 'Login1',
        password: 'Password1',
        username: 'Username1',
    }
];

app.post('/api/login', (req, res) => {
    const {login, password} = req.body;

    const user = users.find(user => {
        if (user.login == login && user.password == password) {
            return true;
        }
        return false;
    });

    if (user) {
        const token = jwt.sign({login: user.login}, process.env.JWT_SECRET);
        console.log(token);
        res.json({token});
    }

    res.status(401).send();
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});