'use strict';
var app = app || {};
(function(module) {
  function Article(rawDataObj) {
  /* REVIEW: In Lab 8, we explored a lot of new functionality going on here. Let's re-examine the concept of context.
  Normally, "this" inside of a constructor function refers to the newly instantiated object.
  However, in the function we're passing to forEach, "this" would normally refer to "undefined" in strict mode. As a result, we had to pass a second argument to forEach to make sure our "this" was still referring to our instantiated object.
  One of the primary purposes of lexical arrow functions, besides cleaning up syntax to use fewer lines of code, is to also preserve context. That means that when you declare a function using lexical arrows, "this" inside the function will still be the same "this" as it was outside the function.
  As a result, we no longer have to pass in the optional "this" argument to forEach!*/
    Object.keys(rawDataObj).forEach(key => this[key] = rawDataObj[key]);
  }
  module.Article = Article;

  Article.all = [];

  var toHtml = Article.prototype.toHtml = function() {
    var template = Handlebars.compile($('#article-template').text());

    this.daysAgo = parseInt((new Date() - new Date(this.published_on)) / 60 / 60 / 24 / 1000);
    this.publishStatus = this.published_on ? `published ${this.daysAgo} days ago` : '(draft)';
    this.body = marked(this.body);

    return template(this);
  };

  module.toHtml = toHtml;

  var loadAll = Article.loadAll = articleData => {
    articleData.sort((a, b) => (new Date(b.published_on)) - (new Date(a.published_on)));

   
    Article.all = articleData.map(articleObject => (new Article(articleObject)));
  

  };

  module.loadAll = loadAll;

  Article.fetchAll = callback => {
    $.get('/articles')
      .then(results => {
        Article.loadAll(results);
        callback();
      })
  };


  var numWordsAll = Article.numWordsAll = () => {
    return Article.all
      .map(article => article.body.split(' '))
      .reduce((total, current) => total + current.length,
        0)
  };

  module.numWordsAll = numWordsAll;

  var allAuthors = Article.allAuthors = () => {
    return Article.all
      .map(article => article.author)
      .reduce((total, current) => {
        console.log(total);
        if (!total.includes(current))
          total.push(current);
        return total;
        
        
        
      },[]);
  };

  module.allAuthors = allAuthors;

  var numWordsByAuthor = Article.numWordsByAuthor = () => {
    return Article.allAuthors().map(author =>{
      return {
        name: author,
        numWords: Article.all.filter(article => article.author === author)
          .map(article => article.body.split(' '))
          .reduce((total, current) => total + current.length, 0)
      }
    })
  };

  module.numWordsByAuthor = numWordsByAuthor;

  var truncateTable = Article.truncateTable = callback => {
    $.ajax({
      url: '/articles',
      method: 'DELETE',
    })
      .then(console.log)
    // REVIEW: Check out this clean syntax for just passing 'assumed' data into a named function! The reason we can do this has to do with the way Promise.prototype.then() works. It's a little outside the scope of 301 material, but feel free to research!
      .then(callback);
  };

  module.truncateTable = truncateTable;

  var insertRecord = Article.prototype.insertRecord = function(callback) {
  // REVIEW: Why can't we use an arrow function here for .insertRecord()?
    $.post('/articles', { author: this.author, author_url: this.author_url, body: this.body, category: this.category, published_on: this.published_on, title: this.title })
      .then(console.log)
      .then(callback);
  };

  module.insertRecord = insertRecord;

  var deleteRecord = Article.prototype.deleteRecord = function(callback) {
    $.ajax({
      url: `/articles/${this.article_id}`,
      method: 'DELETE'
    })
      .then(console.log)
      .then(callback);
  };

  module.deleteRecord = deleteRecord;

  var updateRecord = Article.prototype.updateRecord = function(callback) {
    $.ajax({
      url: `/articles/${this.article_id}`,
      method: 'PUT',
      data: {
        author: this.author,
        author_url: this.author_url,
        body: this.body,
        category: this.category,
        published_on: this.published_on,
        title: this.title,
        author_id: this.author_id
      }
    })
      .then(console.log)
      .then(callback);
  };

  module.updateRecord = updateRecord;
})(app);
