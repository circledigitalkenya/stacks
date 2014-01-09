var current_book;

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
            var db = window.sqlitePlugin.openDatabase("ladders", "1.0", "Demo", -1);
            db.transaction(
              function(tx){
                tx.executeSql(
                  'SELECT isbn FROM books where isbn ='+response.data.ASIN+' LIMIT 1', [],
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
            $('.book-results').empty().html('<h2>No books found</h2>');
          }
        });
      }
      return false;
    });

    // add book to library
    $('.main-window').on('click', '.addbook', function(){
      console.log(current_book);

      tx.executeSql('INSERT INTO books(isbn, title, author, pubdata) VALUES("0262620200","History and Class Consciousness: Studies in Marxist Dialectics","YGyorgy Lukacs")');
    });

  });

});