https://www.w3schools.com/nodejs/nodejs_mongodb_delete.asp

#Delete

##One
```angular2html
  db.collection("customers").deleteOne(myquery, function(err, obj) {
    if (err) throw err;
    console.log("1 document deleted");
  });
```

##Many
```angular2html
  dbo.collection("customers").deleteMany(myquery, function(err, obj) {
    if (err) throw err;
    console.log(obj.result.n + " document(s) deleted");
    db.close();
  });
```