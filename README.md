# eshop-backend-base

This is a simple E-shop backend created with the following technologies:
- [**Express**](https://expressjs.com/) as the underlying framework
- [**MongoDB**](https://www.mongodb.com/) as the database technology, integrated with [**mongoose**](https://mongoosejs.com/)
- [**JSON Web Tokens**](https://jwt.io/) to secure the API, using [**jsonwebtoken**](https://github.com/auth0/node-jsonwebtoken) and [**express-jwt**](https://github.com/auth0/express-jwt)
- [**multer**](https://github.com/expressjs/multer) for file upload, used to upload product images to the server
- [**bcryptjs**](https://github.com/dcodeIO/bcrypt.js) to hash passwords

**NOTE: This application was created within a week and is not production-ready. It probably has a ton of bugs.**

## Set up

**Remember to do every step described below to fully set up the application.**

### Repository
```sh
git clone https://github.com/jonisavo/eshop-backend-base.git
cd eshop-backend-base
npm install
```

### .env file
The app fetches various information from a `.env` file, which should be located in the root folder. You must create it yourself. It looks like this:
```env
API_URL = /api/v1
PORT = 3000
MONGO_CONSTRING = mongodb+srv://...
```
Where `API_URL` is the base url of your API (e.g. `http://localhost:3000/api/v1`) and `MONGO_CONSTRING` is the credentials used to connect to your MongoDB database. `PORT` is the the port used by the server.

The `.env` file is ignored by Git. Remove it from the `.gitignore` file to be able to check it into version control, but remember to not publish it!

### MongoDB

Enter your database connection string to the `.env` file as described above. Also, in the MongoDB web client, you must allow your IP address to access the database via the `Network > Network Access` menu.

### JSON Web Tokens

The JSON web tokens are generated using a secret, which is read from a file named `jwtRS256.key`. You must create it yourself. It may look something like this:
```rsa
-----BEGIN RSA PRIVATE KEY-----
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx...
```
Refer to https://gist.github.com/ygotthilf/baa58da5c3dd1f69fae9 on how to generate a key.

The `jwtRS256.key` file is also ignored by Git. Be careful with exposing it to version control.

## Usage

```sh
npm start
```
If you see
```
The server is running in port 3000
Database connection is ready...
```
you are good to go!

## Schemas

### Category

```javascript
{
  name: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    default: '',
  },
}
```

### Product

```javascript
{
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  richDescription: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    default: '',
  },
  images: [{
    type: String,
  }],
  brand: {
    type: String,
    default: '',
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
  },
  rating: {
    type: Number,
    default: 0.0,
    min: 0.0,
    max: 5.0,
  },
  numReviews: {
    type: Number,
    default: 0,
    min: 0,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
}
```

### User

```javascript
{
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    default: ''
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  street: {
    type: String,
    default: ''
  },
  apartment: {
    type: String,
    default: ''
  },
  zip: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    default: ''
  },
  country: {
    type: String,
    default: ''
  },
  dateRegistered: {
    type: Date,
    default: Date.now,
  },
}
```

### Order

```javascript
{
  orderItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OrderItem',
    required: true
  }],
  shippingAddress1: {
    type: String,
    required: true
  },
  shippingAddress2: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    required: true,
    default: OrderStatus.PENDING
  },
  totalPrice: {
    type: Number,
    min: 0,
    default: 0
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dateOrdered: {
    type: Date,
    default: Date.now
  }
}
```

### Order item

```javascript
{
  quantity: {
    type: Number,
    required: true,
    min: 0,
    max: 99
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  }
}
```

## API

### In a nutshell

- `API_URL/categories`
    - `GET /`: get all categories
    - `GET /:id`: get a single category
    - `POST /`: create a new category
    - `PUT /:id`: update an existing category
    - `DELETE /:id`: remove an existing category
- `API_URL/products`
    - `GET /`: get all products
        - `GET /?categories=x,y`: filter by given categories
    - `GET /brief`: get all products with only the name and image returned
        - `GET /brief?categories=x,y`
    - `GET /:id`: get a single product
    - `GET /brief/:id`
    - `GET /get/count`: get the count of products
    - `GET /get/featured`: get all featured products
        - `GET /get/featured/:count`: get first `:count` featured products
    - `POST /`: create a new product
    - `PUT /:id`: update an existing product
    - `PUT /:id/gallery`: upload additional images for the product
    - `DELETE /:id`: remove an existing product
- `API_URL/users`
    - `GET /`: get all users
    - `GET /:id`: get a single user
    - `GET /get/count`: get the user count
    - `POST /`: create a new user
    - `POST /register`: create a new user
    - `POST /login`: log in with an email and password
    - `POST /change/password`: change the password of a user
    - `PUT /:id`: update an existing user
    - `DELETE /:id`: remove an existing user
- `API_URL/orders`
    - `GET /`: get all orders
    - `GET /:id`: get a single order
    - `GET /get/user/:id`: get all orders for the given user
    - `GET /get/count`: get total order count
    - `GET /get/totalsales`: get total sales
    - `POST /`: create a new order
    - `POST /:id/set/status/:status`: set order `:order` status to `:status`
    - `PUT /:id`: update an existing order
    - `DELETE /:id`: remove an existing order

### General

All responses are either in the form of

```json
{
    "success": true,
    "result": {} // can also be an array of objects or a primitive value, see in-depth documentation below
}
```

or

```json
{
    "success": false,
    "error": {
        "toString": "message"
        // can also contain other data included in the error
    }
}
```

The API is secured with JSON web tokens, which contain the user ID and admin flag. The admin flag is used to determine whether the user should have access to certain functions.

### `/categories`

#### `GET /`

Returns all categories.

#### `GET /:id`

Returns a single category with id `:id`. Returns a `404` error if none exists.

#### `POST /`
**Requires admin status.**

Creates a new category with the provided information.

#### `PUT /:id`
**Requires admin status.**

Updates an existing category, changing only the values given. Returns a `404` error if the category does not exist.

#### `DELETE /:id`
**Requires admin status.**

Removes a category with id `:id`. Returns a `404` error if the category does not exist.

### `/products`

#### `GET /`

Returns a list of all products. The list can be filtered by category with the `?categories=x,y` query parameter.

Example:

```
GET https://localhost:3000/api/v1/products?categories=6027dce9b0aea13ac46c4299,61274f9bb8aec707ec60ef4d
```

#### `GET /brief`

Returns a list of all products, returning only their name and image fields. The list can be filtered with `?categories=x,y`.

#### `GET /:id`

Returns a single product, or a `404` error if none exists.

#### `GET /brief/:id`

Returns a single product's name and image fields, or a `404` error if the product does not exist.

#### `GET /get/count`

Returns the product count. A successful response looks like

```json
{
  "success": true,
  "result": 5
}
```

#### `GET /get/featured`

Returns all featured products.

#### `GET /get/featured/:count`

Returns the `:count` first featured products.

#### `POST /`
**Requires admin status.**

Creates a new product with the provided information. Validates the product's category. An image must be uploaded with the `image` key.

#### `PUT /:id`
**Requires admin status.**

Updates an existing product, changing only the values given. Returns a `404` error if the product does not exist. The image can be changed with the `image` key.

#### `PUT /:id/gallery`
**Requires admin status.**

Uploads additional images to the product, with to 20 at a time. The images are sent with the `images` key.

#### `DELETE /:id`
**Requires admin status.**

Removes a product with id `:id`. Returns a `404` error if the category does not exist.

### `/users`

#### `GET /`
**Requires admin status.**

Returns a list of all users. The hashed password is omitted.

#### `GET /:id`
**Requires authorization.**

Returns a single user with id `:id`, or a `404` error if none exists. The hashed password is omitted.

The user must be logged in as the user whose information is being accessed. Admins can fetch the information of any user.

#### `GET /get/count`
**Requires admin status.**

Returns the total user count.

#### `POST /`
**Requires admin status.**

Creates a new user with the provided information. A plaintext password is given in the `password` field,
which is then hashed in the backend and stored as the `passwordHash` property. Only one user can be created for each e-mail.

#### `POST /register`

A user-facing alias for `POST /`.

#### `POST /login`

Log in to the server. Takes an email and plaintext password in the form of

```json
{
  "email": "example@example.org",
  "password": "password"
}
```

and replies with a JWT token if authentication was successful:

```json
{
  "success": true,
  "result": {
    "user": "example@example.org",
    "token": "..."
  }
}
```

An error will be returned if the user is already logged in.

#### `POST /change/password`

Change the password of a user. Takes an email, the current password and new password:

```json
{
  "email": "example@example.org",
  "currentPassword": "password",
  "newPassword": "password2"
}
```

Fails if:
- User with given e-mail does not exist
- Current password is wrong
- New password is the same as the current password

#### `PUT /:id`
**Requires admin status.**

Updates an existing user, changing only the values given. Returns a `404` error if the user does not exist.

#### `DELETE /:id`
**Requires admin status.**

Removes a user with id `:id`. Returns a `404` error if the user does not exist.

### `/orders`

#### `GET /`
**Requires admin status.**

Returns a list of all orders.

#### `GET /:id`
**Requires authorization.**

Returns a single order with id `:id`, or a `404` error if none exists.

An order can be fetched if it has been made by the authorized user. Attempting to fetch an order made by someone else will result in a `404` error. Admins can fetch any order.

#### `GET /get/user/:id`
**Requires authorization.**

Returns all orders made by a user with id `:id`. If the user is authorized, they can view their own orders. Admins can view anyone's orders.

#### `GET /get/count`
**Requires admin status.**

Returns the total count of orders.

#### `GET /get/totalsales`
**Requires admin status.**

Returns the total sum of all sales.

#### `POST /`
**Requires admin status.**

Creates a new order with the provided information.

#### `POST /:id/set/status/:status`
**Requires admin status.**

Changes the order `:id`'s status to `:status`, which can be one of the following:
- `pending`
- `shipped`
- `cancelled`

#### `PUT /:id`
**Requires admin status.**

Updates an existing order, changing only the values given. Returns a `404` error if the order does not exist.

#### `DELETE /:id`
**Requires admin status.**

Removes an order with id `:id`. Returns a `404` error if the order does not exist.
