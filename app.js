const express = require('express')
const bodyParser = require('body-parser')
const mysql = require('mysql')
const handlebars = require('express-handlebars')
const { Console } = require('console')
const session = require('express-session');
const flash = require('connect-flash')
const urlencodeParser = bodyParser.urlencoded({ extended: false })

const sql = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'crudgames'
})

sql.connect((err) => {
    if (err) console.error('erro ao realizar a conexao com banco de dados: ' + err.stack); return;
})

const app = express()

//Configuraçoes
//Sessao
app.use(session({
    secret: "cursodenode",
    resave: true,
    saveUninitialized: true
}));
app.use(flash());
//Middleware
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash('error_msg');
    next();
})
//Body-Parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//HandleBars
app.engine(
    'handlebars', handlebars({ extname: "handlebars", defaultLayout: "main", layoutsDir: "views/layouts", }));
app.set('view engine', 'handlebars');


//ROTAS
app.get('/', (req, res) => {
    sql.query('SELECT * FROM games where ativo = 1', function(err, results, fields){
        res.render('index', {results})
    })
})

app.get('/inserir', (req, res) => {
    res.render('inserir')
})

app.post('/inserir/add', urlencodeParser, (req, res) => {
    sql.query('INSERT INTO games(nome, quantidade, preco, ativo) VALUES (?, ?, ?, 1)', [req.body.nome, req.body.quantidade, req.body.preco], (err) => {
        if (!err) {
            
        } else {
            console.log(err)
            
        }
    })
    res.redirect('/')
})

app.get('/editar/:id', (req, res) => {
    sql.query('SELECT * FROM games WHERE id = ?', [req.params.id], function(err, results, fields){
        res.render('editar', {results})
    })
})

app.post('/editar/confirmar', urlencodeParser, (req, res) => {
    sql.query('UPDATE games SET nome = ?, quantidade = ?, preco = ? WHERE id = ?', [req.body.nome, req.body.quantidade, req.body.preco, req.body.id], (err) => {
        if (!err) {
            req.flash('success_msg', 'Jogo editado com Sucesso')
        } else {
            console.log(err)
            req.flash('error_msg', 'Erro ao editar o Jogo')
        }
        res.redirect('/')
    })
})

app.post('/deletar/:id', urlencodeParser, (req, res) => {
    sql.query('UPDATE games SET ativo = 0 WHERE id = ?', [req.params.id], (err) => {
        if (!err) {
            req.flash('success_msg', 'Jogo deletado com Sucesso')
        } else {
            console.log(err)
            req.flash('error_msg', 'Erro ao deletar o Jogo')
        }
        res.redirect('/')
    })
})

//Iniciar Servidor
app.listen(3000, (req, res) => {
    console.log('Servidor esta Rodando')
})