console.log("app js called")

$(".add-note").on("click", function() {  
  console.log($(this).attr("index"));
  console.log('clicked');
  console.log(this);
  var id = "#display-"+$(this).attr("index");
  console.log("id::::::", id);
  console.log($(id));
  if($(id).css("display") == "none"){
   $(id).css("display", "block");
  } else {
   $(id).css("display", "none");
  }
})
$(".note-submit").on("click", function(){
  var index = "#comment-"+$(this).attr("index");
  // console.log(index);
  // console.log($(index).val());
  var note = {};
  note.body = $(index).val();
  var objId = $(this).data("id");
  console.log(objId)
  $.post('/notes', note, function(dbNote) {
    console.log(dbNote);
    $.get('/articles/'+objId , function(response){
      console.log("hello from inside get");
      var article = response;
      article.notes.push(dbNote);
      console.log(article);
      $.post('/articles/'+objId, article, function(respose) {
        console.log(response)
        window.location.reload();
      })
    })
  })

})

$(".delete-article").on('click', function(){
  console.log("delete clicked")
  var objId = $(this).data("id");
  console.log(objId);
  $.ajax({
    url: '/articles/'+ objId,
    type: 'DELETE',
    success: function(result) {
      console.log(result);
      window.location.reload();
    }
});
})
$(".scrape-news").on('click', function(){
  $.get('/scrape', function(response) {
    console.log(response.data);
    window.location.reload();
  })
  
})
// // Grab the articles as a json
// $.getJSON("/articles", function(data) {
//   // For each one
//   for (var i = 0; i < data.length; i++) {
//     // Display the apropos information on the page
//     $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
//   }
// });


// // Whenever someone clicks a p tag
// $(document).on("click", "p", function() {
//   // Empty the notes from the note section
//   $("#notes").empty();
//   // Save the id from the p tag
//   var thisId = $(this).attr("data-id");

//   // Now make an ajax call for the Article
//   $.ajax({
//     method: "GET",
//     url: "/articles/" + thisId
//   })
//     // With that done, add the note information to the page
//     .then(function(data) {
//       console.log(data);
//       // The title of the article
//       $("#notes").append("<h2>" + data.title + "</h2>");
//       // An input to enter a new title
//       $("#notes").append("<input id='titleinput' name='title' >");
//       // A textarea to add a new note body
//       $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
//       // A button to submit a new note, with the id of the article saved to it
//       $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

//       // If there's a note in the article
//       if (data.note) {
//         // Place the title of the note in the title input
//         $("#titleinput").val(data.note.title);
//         // Place the body of the note in the body textarea
//         $("#bodyinput").val(data.note.body);
//       }
//     });
// });

// // When you click the savenote button
// $(document).on("click", "#savenote", function() {
//   // Grab the id associated with the article from the submit button
//   var thisId = $(this).attr("data-id");

//   // Run a POST request to change the note, using what's entered in the inputs
//   $.ajax({
//     method: "POST",
//     url: "/articles/" + thisId,
//     data: {
//       // Value taken from title input
//       title: $("#titleinput").val(),
//       // Value taken from note textarea
//       body: $("#bodyinput").val()
//     }
//   })
//     // With that done
//     .then(function(data) {
//       // Log the response
//       console.log(data);
//       // Empty the notes section
//       $("#notes").empty();
//     });

//   // Also, remove the values entered in the input and textarea for note entry
//   $("#titleinput").val("");
//   $("#bodyinput").val("");
// });
