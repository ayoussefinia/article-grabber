var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 8080;
var app = express();

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Initialize Express


// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect(process.env.MONGODB_URI ||"mongodb://localhost/news", { useNewUrlParser: true });

// Routes
app.get("/", function(req, res) {
  db.Article.find({}).populate('notes').then(function(data){
    res.render('index', {data});
  }) 
});
app.post("/notes", function(req, res) {
  console.log(req.body);
  db.Note.create(req.body).then(function(dbNote){
    res.json(dbNote);
  })
  // Grab every document in the Articles collection
// db.Note.create()
});

app.delete('/articles/:id', function (req, res){
  db.Article.deleteOne({ _id: req.params.id }, function (err) {
    console.log(err)
    res.send("deleted");
  });
});

// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with axios


    axios.get("https://www.nytimes.com/section/world").then(function(response) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(response.data);

      // Now, we grab every h2 within an article tag, and do the following:
      var result = [];
      var result2 = [];
      var result3 = [];

      async function grabArticles(){
        $("h2 ~ p.e134j7ei1").each(function(i, element) {
          // Save an empty result object
          var articleObj = {};

          // Add the text and href of every link, and save them as properties of the result object
          articleObj.desc = $(this)
            .text();
        
          result.push(articleObj);
          // Create a new Article using the `result` object built from scraping
          // db.Article.create(result)
          //   .then(function(dbArticle) {
          //     // View the added result in the console
          //     console.log(dbArticle);
          //   })
          //   .catch(function(err) {
          //     // If an error occurred, log it
          //     console.log(err);
          //   });
          return result;
        });



      $("h2.e134j7ei0").each(function(i, element) {
        // Save an empty result object
      result[i].title = $(this).text();
      result[i].link = $(this).children().attr('href');
      });





      //grabs the last 10 article titles


      $("h2.e1xfvim30").each(function(i, element) {
        var artObj = {}
        artObj.title = $(this).text();
        result2.push(artObj);
      });


  
      //grabs the last 10 links 

      $("div.css-4jyr1y > a").each(function(i, element) {
        result2[i].link = $(this).attr('href');
      });

      //grabs the last 10 short descriptions on world news page

      $("p.e1xfvim31").each(function(i, element) {
        result2[i].desc = $(this).text()
      });



        result3 =  result.concat(result2);



      }
      
    grabArticles().then(function(){
      console.log("********r3",result3)
      console.log("********", result3.length)
      for(i=0; i<result3.length; i++) {
        db.Article.create(result3[i])
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, log it
          console.log(err);
        });
      }
      // Send a message to the client
      res.send("Scrape Complete");
    })

    // var c = firstAsync().then(secondAsync().then(thirdAsync().then(fourthAsync().then(fifthAsync().then(sixthAsync().then(function(){
    //   console.log(result.length);
    //   console.log(result2.length)
    //   console.log(result3.length);
    // })
    // )))));
    // thirdAsync().then(fourthAsync().then(fifthAsync().then(
    //   function() {
    //     return result2
    //   }
    // )))


  
 
    });
    // console.log("***********************",result3.length);
    // console.log("**********************",result3);

  // poputlateData().then(function(){
  //   console.log("hi")
  //   // console.log("***********************",result3.length);
  //   // console.log("**********************",result3);
  // })
 
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    // .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  console.log("post note/article::::::", req.body);
  // Create a new note and pass the req.body to the entry
  // db.Note.create(req.body)
  //   .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
  //     // return 
  db.Article.findOneAndUpdate({ _id: req.params.id }, { notes: req.body.notes }, { new: true })
    // })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
