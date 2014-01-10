var current_book;
var db;

$(document).ready(function() {

  $(document).bind('deviceready', function() {

    $('form.search_isbn').on('submit', function(){
      var isbn = $.trim($(this).find('input[name=isbn]').val());
      if( isbn.length > 0 ) {
        $.getJSON('http://localhost/amazon/?isbn='+isbn, function(response){

          if( response.status == 'success' ) {

            var template = Handlebars.compile(
              $("#book-result-template").html()
            );

            // find out if the book is already in
            // this users library
            var book_in_library = false;
            db = window.sqlitePlugin.openDatabase("ladders", "1.0", "Demo", -1);
            db.transaction(
              function(tx){
                tx.executeSql(
                  'SELECT isbn FROM books WHERE isbn ='+response.data.ASIN, [],
                  function(tx, results){
                    if( results.rows.length > 0 ) {
                      book_in_library = true;
                    }
                  }
                );
              },
              function(e) {
                console.log("ERROR: " + e.message);
              }
            );

            //add it to the view
            $('.main-window').empty().html(
              template({
                isbn : response.data.ASIN,
                author : response.data.ItemAttributes.Author,
                title : response.data.ItemAttributes.Title,
                description : response.data.EditorialReviews.EditorialReview.Content.slice(0, 400).replace(/(<([^>]+)>)/ig,""), //slice and strip out html
                pages : response.data.ItemAttributes.NumberOfPages,
                publisher : response.data.ItemAttributes.Publisher,
                publication_date : response.data.ItemAttributes.PublicationDate,
                image_source : response.data.SmallImage.URL,
                book_in_library : book_in_library
              })
            );
            current_book = response.data;
          } else {
            $('.book-results')
            .empty()
            .html('<h2>No books found</h2>');
          }
        });
      }
      return false;
    });

    // add book to library
    $('.main-window').on('click', '.addbook', function(){
      db.transaction(
        function(tx){
          tx.executeSql(
            'INSERT INTO books(isbn, title, author, image_path)' +
            ' VALUES'+
            '('+
              '"'+current_book.ASIN +'",'+
              '"'+current_book.ItemAttributes.Title +'",'+
              '"'+current_book.ItemAttributes.Author+'",'+
              '"'+current_book.SmallImage.URL+'"'+
            ')'
          );
          console.log(
            'INSERT INTO books(isbn, title, description, author, image_path)' +
            ' VALUES'+
            '('+
              '"'+current_book.ASIN +'",'+
              '"'+current_book.ItemAttributes.Title +'",'+
              '"'+current_book.ItemAttributes.Author+'",'+
              '"'+current_book.SmallImage.URL+'"'+
            ')'
          );

          // book was added to library successfuly!
          // show the library
          var libary_template = Handlebars.compile(
            $("#book-library-template").html()
          );
          db.transaction(function(tx){
            tx.executeSql('SELECT * FROM books', [], function(tx, results){
              // loop through the result set to create an object to pass to the template
              var books = [];
              var len = results.rows.length;

              for (var i=0; i<len; i++){
                books.push({
                  isbn : results.rows.item(i).isbn,
                  author : results.rows.item(i).author,
                  title : results.rows.item(i).title,
                  image_path : results.rows.item(i).image_path
                });
              }

              $('.main-window').empty().html(
                libary_template({
                  books :  books
                })
              );

            }, function(e){ 
              console.log("ERROR: " + e.message);
            });
          },
          function(e){ 
            console.log("ERROR: " + e.message);
          });


        },
        [],
        function(e) {
          console.log("ERROR: " + e.message);
        }
      );


    });

  });

});
