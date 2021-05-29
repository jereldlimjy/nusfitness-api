const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const cors = require('cors');

// Database
mongoose.connect('mongodb://localhost:27017/nusfitness', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
})

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected!');
});

const app = express();

app.use(express.json());
app.use(cors({ origin: true, credentials: true }));

// Session
const sessionConfig = {
	secret: 'secret',
	resave: false,
	saveUninitialized: true,
}

app.use(session(sessionConfig));

// Passport.js
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy({ usernameField: 'email' }, User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.post('/register', async (req, res) => {
	try {
		const { email, password } = req.body;
		const user = new User({ email });
		const newUser = await User.register(user, password);
		req.login(newUser, err => {
			console.log(err);
		})
		res.json(newUser);
	} catch(err) {
		console.log(err);
		res.status(400).json(err);
	}
});

app.post('/login', passport.authenticate('local'), (req, res) => {
	res.status(200).json({ success: true });
});

app.get('/logout', (req, res) => {
	req.logout();
	console.log(req.isAuthenticated());
	res.status(200).json({ success: true });
})

// app.get('/isLoggedIn', (req, res) => {
// 	const authenticated = req.isAuthenticated();
// 	res.json({ authenticated });
// })

app.listen(process.env.PORT || 3000);