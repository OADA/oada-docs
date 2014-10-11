#OADA View Proposal

####**Version 3** 


###**OVERVIEW**
The "view" query parameter in the OADA API handles turning on and off key/value pairs in a JSON response.  Key/value pairs refer both to JSON objects and to JSON arrays, except that in the case of arrays, the "keys" are the array indices.

Note that it is NOT currently the job of "view" to do any special types of grouping, ordering, or otherwise re-organizing the returned JSON document.  Just turning on/off key value pairs in a response.

----------

####**FULL LIST OF VIEW RULES**
If this is your first time reading this document, you can skip over this section listing all the rules in one place.

>**Rule #1:** What you put into an OADA cloud is what you get back by default, "un-messed-around-with".

>**Rule #2:** View specifies the CHANGES you want to the default response. 

>**Rule #3:** If any part of a linked resource is asked to be viewed, then the resource is automatically expanded.

----------

###**NECESSARY BACKGROUND: THE RULES**
If you upload a file to an OADA cloud we want you to be able to get the file without messing with all this stuff.  Therefore if original uploaded file is exactly you want, there is no need to use "view".  To that end, we have defined the first rule of OADA "view":

>**OADA View Rule #1:** What you put into an OADA cloud is what you get back by default, "un-messed-around-with".

In the case of JSON, what you put into an OADA cloud is a JSON document that has native objects and arrays in it.  OADA adds a hidden "_meta/" key to each level of a JSON document to support partial synchronization, and for documents at the resource level (i.e. /resources/123), the "_meta" key holds all the resource-specific things like permissions, syncs, modified times, etc.  Therefore, in order to support Rule #1, the _meta key (and all of it’s child documents) do not come back by default. If the default response is not what you want, you add rules to the view query to change the default. This is Rule #2.

> **OADA View Rule #2:** View specifies the CHANGES you want to the default response.

Since native parts of a document come back by default according to Rule 1, then you would only use view to turn off native keys.  Likewise, you would use it to turn on any "_meta" keys.  

With OADA you can include resources inside of other resources. You simply put a link (ie. just an "_id") in the JSON document to the other resource.  An OADA cloud can expand these links for you in-place to reduce the total number of requests you need to make to get all your linked information.  However, since you only put up the "_id" at the link by default, then that's all that comes back by default according to Rule #1.  You need to use "view" to ask the cloud to expand them if that's what you want.  This also eliminates the problem of circular links that might have been expanded infinitely.  This brings us to OADA View Rule #3:

>**OADA View Rule #3:** If any part of a linked resource is asked to be viewed, then the resource is automatically expanded.


###**EXAMPLES**
The rest of this document will be written in the style of "The Little Lisper" and "The Little Schemer": as a series of questions and their answers.  I figure if they can explain Scheme so beautifully and completely with that method then surely we can explain our view syntax in that way.

IMPORTANT NOTE: You have to URL encode the view parameters listed below.  You should also remove all whitespace before encoding.  They are listed here in readable form for clarity only.  We are also thinking of adding optional support for simpler to read options such as https://github.com/Sage/jsurl.



####**EXAMPLE SET 1**

Below is an example of a field named "Smith30" represented in a JSON format.

```json
{
  "name": "Smith30",
  "acres": 30.3,
  "boundary": { geojson of boundary polygons }
}
```

If the above document is uploaded to an OADA cloud some keys get added automatically to support OADA: "_id" and "_meta". The automatically added keys are not returned on a GET request unless explicitly asked for.  Here is the full document with both hidden keys expanded: 

```json
{
  "_id": "123",
  "_meta": { … },
  "name": "Smith30",
  "acres": 30.3,
  "boundary": { geojson of boundary polygons }
}
```
<br/>

> **Question 1.1:** How do I get back the "Smith" field I uploaded using its "_id" key?

> **Answer:** You put the id value after the /resources endpoint.

> **Request:**
> ```json
> GET /resources/123
> ```
> **Response:**
> ```http
> HTTP/1.1 200 OK
> Content-Type: application/json
> 
> {
>   "name": "Smith30",
>   "acres": 30.3,
>   "boundary": { geojson of boundary polygons }
> }  
> ```

<br/>

> **Question 1.2:** How do I get back the "Smith" field I uploaded using its "_id" key?

> **Answer:** You put the id value after the /resources endpoint.

> **Request:**
> ```json
> GET /resources/123?view={
>  "_id": true
> }
> ```
> **Response:**
> ```http
> HTTP/1.1 200 OK
> Content-Type: application/json
> 
> {
>   "_id": "123",
>   "name": "Smith30",
>   "acres": 30.3,
>   "boundary": { geojson of boundary polygons }
> }
> ```

####**EXAMPLE SET 2**
Next let’s look at a JSON file that contains a list of our field resources. It is shown below. It’s resource "_id" upon being uploaded is "9999" (not shown).

```json
{
  "fields": [
    {
      "_id": "123"
    },
    {
      "_id": "124"
    }
  ]
}
```
> **Question 2.1:** How do I get back my fields list (resource `id` "9999") with each field expanded in the array?

> **Answer:** Use the `$expand` keyword. Expanding will follow each "_id" in the array and add it’s corresponding resource in place.

> **Request:**
> ```json
> GET /resources/9999?view={
>   "fields": {
>     "$each": {
>       "$expand": true
>     }
>   }
> }
> ```
> **Response:**
> ```http
> HTTP/1.1 200 OK
> Content-Type: application/json
> 
> {
>   "fields": [
>     {
>       "_id": "123",
>       "name": "Smith30",
>       "acres": 30.3,
>       "boundary": { geojson of boundary polygons }
>     },
>     {
>       "_id": "124",
>       "name": "Back40",
>       "acres": 42.8,
>       "boundary": { geojson of boundary polygons }
>     }
>   ]
> }
> ```

<br/>

> **Question 2.2:** How do I get back my fields list (resource `id` "9999") with each field expanded in the array, but only return the `name` key for each field (ie. don’t return the "_id", "boundary", or "acres" keys)?

> **Answer:** `$expand` is not needed in this case. This is because when we mention the "_id", "acres", and "boundary" keys in the request therefore we are implicitly telling the server to expand the resource.

> **Request:**
> ```json
> GET /resources/9999?view={
>   "fields": {
>     "$each": {
>       "_id": false,
>       "acres": false,
>       "boundary": false
>     }
>   }
> }
> ```
> **Response:**
> ```http
> HTTP/1.1 200 OK
> Content-Type: application/json
> 
> {
>   "fields": [
>     {
>       "name": "Smith30"
>     },
>     {
>       "name": "Back40"
>     }
>   ]
> }
> ```

<br/>

> **Question 2.3:** You may notice from the request in question 4.0 that it would be rather cumbersome to return a single key from an object with a large number of keys. How can we complete the same request more efficiently?

> **Answer:** Use the "$others" keyword to turn off all the keys except the `name` key. It affects all native keys left unmentioned in the object.

> **Request:**
> ```json
> GET /resources/9999?view={
>   "fields": {
>     "$each": {
>       "name": true,
>       "$others": false
>     }
>   }
> }
> ```
> **Response:**
> ```http
> HTTP/1.1 200 OK
> Content-Type: application/json
> 
> {
>   "fields": [
>     {
>       "name": "Smith30"
>     },
>     {
>       "name": "Back40"
>     }
>   ]
> }
> ```


> **Question 2.4:** How do I only return fields that have names starting with "S"? 

> **Answer:** Add a regular expression condition on the `name` key. The keyword for a regular expression is $regex.

> **Request:**
> ```json
GET /resources/9999?view={
  "fields": {
    "$each": {
      "name": { "$regex": "^S.*" }
    }
  }
}
> ```
> **Response:**
> ```http
> HTTP/1.1 200 OK
> Content-Type: application/json
> 
{
  "fields": [
    {
      "_id": "123",
      "name": "Smith30",
      "acres": 30.3,
      "boundary": { geojson of boundary polygons }
    }
  ]
}
> ```

<br/>

> **Question 2.5:** How do I filter the fields array by two parameters? 

> **Answer:** Add another condition. Conditions are ANDed by default.

> **Request:**
> ```json
> GET /resources/9999?view={
>   "fields": {
>     "$each": {
>       "name": { "$regex": "^S.*" },
>       "acres": { "$gt": 20 }
>     }
>   }
> }
> ```
> **Response:**
> ```http
> HTTP/1.1 200 OK
> Content-Type: application/json
> 
> {
>   "fields": [
>     {
>       "_id": "123",
>       "name": "Smith30",
>       "acres": 30.3,
>       "boundary": { geojson of boundary polygons }
>     }
>   ]
> }
> ```

<br/>

> **Question 2.6:** How do I or two or more conditions?

> **Answer:** Wrap the conditions in an `$or`, the `$or` conditional can be an array or an object.

> **Request:**
> ```json
> GET /resources/9999?view={
>   "fields": {
>     "$each": {
>       $or {
>         "name": { "$regex": "^S.*" },
>         "acres": { "$gt": 20 }
>       }
>     }
>   }
> }
> ```
> **Response:**
> ```http
> HTTP/1.1 200 OK
> Content-Type: application/json
> 
> {
>   "fields": [
>     {
>       "_id": "123",
>       "name": "Smith30",
>       "acres": 30.3,
>       "boundary": { geojson of boundary polygons }
>     },
>     {
>       "_id": "124",
>       "name": "Back40",
>       "acres": 42.8,
>       "boundary": { geojson of boundary polygons }
>     }
>   ]
> }
> ```

<br/>


> **Question 2.7:** That view parameter is starting to look really ugly with all those curly braces in there.  Is there a shorthand that makes it cleaner?

> **Answer:** Yes, use the "dot" notation from Javascript, where each set of braces is replaced with a "."

> **Request:**
> ```json
> GET /resources/9999?view={
>   "fields.$each.$or": {
>     "name.$regex": "^S.*",
>     "acres.$gt": 20
>   }
> }
> ```
> **Response:**
> ```http
> HTTP/1.1 200 OK
> Content-Type: application/json
> 
> {
>   "fields": [
>     {
>       "_id": "123",
>       "name": "Smith30",
>       "acres": 30.3,
>       "boundary": { geojson of boundary polygons }
>     },
>     {
>       "_id": "124",
>       "name": "Back40",
>       "acres": 42.8,
>       "boundary": { geojson of boundary polygons }
>     }
>   ]
> }
> ```

#### Example Set 3 - Advanced cases:

> **Question 3.1:** How do I turn on/off keys when I am filtering with conditionals?

> **Answer:** You can can still turn keys on/off inside conditionals as you would normally.

> **Request:**
> ```json
> GET /resources/9999?view={
>   "fields.$each.$or": {
>     "name.$regex": "^S.*",
>     "acres.$gt": 20,
>     "boundary": true,
>     "$others": false
>   }
> }
> ```
> **Response:**
> ```http
> HTTP/1.1 200 OK
> Content-Type: application/json
> 
> {
>   "fields": [
>     {
>       "boundary": { geojson of boundary polygons }
>     },
>     {
>       "boundary": { geojson of boundary polygons }
>     }
>   ]
> }
> ```

<br/>

> **Question 3.2:** How do you turn off a key you are filtering on?

> **Answer:** You have to use the $view keyword.

> **Request:**
> ```json
> GET /resources/9999?view={
>   "fields.$each.$or": {
>     "name": { "$view": false, "$regex": "^S.*" }
>     "acres.$gt": 20,
>   }
> }
> ```
> **Response:**
> ```http
> HTTP/1.1 200 OK
> Content-Type: application/json
> 
> {
>   "fields": [
>     {
>       "_id": "123",
>       "acres": 30.3,
>       "boundary": { geojson of boundary polygons }
>     },
>     {
>       "_id": "124",
>       "acres": 42.8,
>       "boundary": { geojson of boundary polygons }
>     }
>   ]
> }
> ```

<br/>

> **Question 3.3:** What happens to a native array when you turn on one of it's OADA keys?

> **Answer:** The array is returned as an object with a `_array` key containing the original array. This is the behavior whenever an OADA key is returned from a native array.

> **Request:**
> ```json
> GET /resources/9999?view={
>   "fields._id": true
> }
> ```
> **Response:**
> ```http
> HTTP/1.1 200 OK
> Content-Type: application/json
> 
> {
>   "fields": {
>     "_id": "876",
>     "_array": [
>       { "_id": "123"},
>       { "_id": "124"}
>     ] 
>   }
> }
> ```

<br/>

> **Question 3.4:** What if I want to filter results but not expand the resource.

> **Answer:** `$expand` to the rescue again!

> **Request:**
> ```json
> GET /resources/9999?view={
>   "fields.$each": {
>     "$expand": false,
>     "name.$regex": "^S.*",
>     "acres.$gt": 20
>   }
> }
> ```
> **Response:**
> ```http
> HTTP/1.1 200 OK
> Content-Type: application/json
> 
> {
>   "fields": [
>     { "_id": "123" }
>   ]
> }
> ```

<br/>

Suppose each of our field resources have a child array containing alternate names for the field. Shown below.
```json
{
  "name": "Smith30",
  "acres": 30.3,
  "boundary": { geojson of boundary polygons }
  "alt_names": [
    "S30",
    "Smith South"
  ]
}
```


#### Example Set 4 - Advanced cases:

> **Question 4.1:** How do we filter our fields array by the "alt_names" key in our field objects?

> **Answer:** Use the $any condition on the "alt_names" array. It evaluates to true of ANY of the elements in the "alt_names" array meet the conditions.

> **Request:**
> ```json
> GET /resources/9999?view={
>   "fields.$each.alt_names.$any": { "$eq": "S30" }
> }
> ```
> **Response:**
> ```http
> HTTP/1.1 200 OK
> Content-Type: application/json
> 
> {
>   "fields": [
>     {
>       "name": "Smith30",
>       "acres": 30.3,
>       "boundary": { geojson of boundary polygons }
>       "alt_names": [
>         "S30",
>         "Smith South"
>       ]
>     }
>   ]
> }
> ```

<br/>

> **Question 4.2:** What do I do if I only want the field to be returned if EVERY element in the "alt_names" array matches a condition?

> **Answer:** Use the $every condition on the "alt_names" array. It evaluates to true only if EVERY one of the elements in the "alt_names" array meets the conditions.

> **Request:**
> ```json
> GET /resources/9999?view={
>   "fields.$each.alt_names.$every": { "$eq": "S30" }
> }
> ```
> **Response:**
> ```http
> HTTP/1.1 200 OK
> Content-Type: application/json
> 
> {
>   "fields": []
> }
> ```

<br/>

> **Question 4.3:** How do we filter our "alt_names" array by a condition?

> **Answer:** In the previous question we filtered our outer array (fields) by conditions on a inner array (alt_names). We can change the $any to an $each to leave the outer array unchanged and only filter "alt_names".

> **Request:**
> ```json
> GET /resources/9999?view={
>   "fields.$each.alt_names.$each": { "$eq": "S30" }
> }
> ```
> **Response:**
> ```http
> HTTP/1.1 200 OK
> Content-Type: application/json
> 
> {
>   "fields": [
>     {
>       "_id": "123",
>       "name": "Smith30",
>       "acres": 30.3,
>       "boundary": { geojson of boundary polygons },
>       "alt_names": [ "S30" ]
>     },
>     {
>       "_id": "124",
>       "name": "Back40",
>       "acres": 42.8,
>       "boundary": { geojson of boundary polygons },
>       "alt_names": []
>     }
>   ]
> }
> ```

<br/>

OADA filter and expand vs. MongoDB find and project:

For those who are familiar with MongoDB’s syntax for find and project, there are obvious similarities between the "$" keys that we’ve defined and those MongoDB has defined.  So the natural question is: why take some of their structure but not copy it verbatim?  There were three reasons behind this:
Mongo’s find seems confusing because they return items from sub-arrays that you intended to filter out.  We intend to allow you to nest filters and therefore just get back parts of a complex JSON hierarchy in the intuitive way you expect.
Mongo’s design goals were to have fast queries in their document database.  To accomplish this, they do not allow you to run find against objects in a way that treats them as an unordered list of key/value pairs.  You can only run "find" on an array.  Any object that contains a bunch of unique id’s as keys would be unsearchable in Mongo’s find syntax.
Similarly, Mongo’s find syntax provides no means to run queries against keys themselves, which is pretty common practice in a normal JSON document.
