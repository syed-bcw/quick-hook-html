var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');

var app = express();


const echoRequests = [];

app.use(bodyParser.text({
    type: function (req) {
        return 'text';
    }
}));

const echo = (req, res) => {
    res = res.status(200);
    if (req.get('Content-Type')) {
        res = res.type(req.get('Content-Type'));
    }
    const echoRequest = {
        headers: req.headers,
        body: req.body,
        method: req.method,
        url: req.url,
        time: new Date(),
    };
    console.log(echoRequest);
    echoRequests.push(echoRequest);
    if (echoRequests.length > 100) {
        echoRequests.shift();
    }
}

app.post('*', function (req, res) {
    echo(req, res);
    res.send(req.body);
});

app.get('/', function (req, res) {
    // echo(req, res);
    res.setHeader("Content-Type", "text/html")
    res.send(`
    <!DOCTYPE HTML>
    <html lang="en">
    <head>
        <!-- when using the mode "code", it's important to specify charset utf-8 -->
        <meta charset="utf-8">
    
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jsoneditor/9.10.3/jsoneditor.min.css" integrity="sha512-brXxIa/fpMfluh8HUWyrNssKy/H0oRzA0HhmipgfVwbXPamMUTZn1jEsvoGGwJYCRpSx4idujdul4vFwWgPROA==" crossorigin="anonymous" referrerpolicy="no-referrer" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jsoneditor/9.10.3/jsoneditor.min.js" integrity="sha512-TINESV2NynbuCVWErXJOCrqZCZPwUjjcRdOWUqfEQl35n/oEYJETHnhl9B3D4q/yJqnzFFLJZNP+ANYyxj4lcQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    </head>
    <body>
        <div id="jsoneditor" style=""></div>
    
        <script>
            // create the editor
            const container = document.getElementById("jsoneditor")
            const options = {}
            const editor = new JSONEditor(container, options)
    
            // set json
            const initialJson = ${JSON.stringify(
                echoRequests.reduce((acc, cur) => {
                    acc[cur.time] = cur;
                    return acc;
                }, {})
                , null, 2)}
            editor.set(initialJson)
    
            // get json
            const updatedJson = editor.get()
        </script>
    </body>
    </html>
  `)

});


http.createServer(app).listen(3000);