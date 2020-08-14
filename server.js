const path = require('path');
const express = require('express');
const hbs = require('hbs');


const publicDirPath = path.join(__dirname,"../public")
const templatesDirPath = path.join(__dirname,'../anki-extension/templates')
const app = express();
const anki = require('/home/joaoeira/Drive/1 - Projects/anki-extension/app.js');

app.set('view engine', 'hbs');
app.set('views', path.join(templatesDirPath,'/views'));
hbs.registerPartials(path.join(templatesDirPath,'/partials'));

app.use(express.static(publicDirPath));

app.get('/card', (req,res) => {

    anki.getCurrentCardInfo()
        .then(cardInfo => {
            anki.returnRenderElements(cardInfo)
                .then(cardObject => {
                    console.log(cardObject);
                    res.render("card", {
                        card: JSON.stringify(cardObject)
                    })
                })
        })
        .catch(error => console.error(error))
});

app.get('', (req,res) => {
    res.send("this is the main page");
})

app.listen(3000, ()=> console.log("Server has been initiated on port 3000"));
