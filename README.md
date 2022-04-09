# Kika
An e-commerce api for Kika
# Kika api

A basic feature of an e-commerce service with the following features:

### Users can :

- Register
- Login 
- Logout
- Updatedetails
- Updatepassword

## Usage

- Add "config.env" file to "/src/config/" folder and update the values to your own
- Check "/src/config/envSample.txt" for sample

## Install Dependencies

```
npm install
```

## Run App

```
# Run in dev mode
npm run dev

# Run in prod mode
npm start

run this before npm start
npm install -g win-node-env (this install node.env globally)
```
## Routes and Payload

```
// @desc      Register user
// @route     POST /api/v1/auth/register
// @access    Public
// @payload   { name, email, password, role }

// @desc      Login user
// @route     POST /api/v1/auth/login
// @access    Public
// @payload   { email, password } 

// @desc      Log user out / clear cookie
// @route     GET /api/v1/auth/logout
// @access    Private

// @desc      Update user details
// @route     PUT /api/v1/auth/updatedetails
// @access    Private
// @payload    {name or email or name and email}

// @desc      Update password
// @route     PUT /api/v1/auth/updatepassword
// @access    Private
// @payload   {password}

## Products

// @desc      Get all products
// @route     GET /api/v1/products
// @access    Public

// @desc      Get product
// @route     GET /api/v1/products/:id
// @access    PUBLIC
// @param     :product_id

// @desc      Get products via slug
// @route     GET /api/v1/products/slug/:slug
// @access    PUBLIC
// @param     :product_slug

// @desc      Create a product
// @route     Post /api/v1/products
// @access    Private (Vendor)
// @payload   { name, image, price, category, brand, countInStock, description }

// @desc      Update a product
// @route     PATCH /api/v1/products/:id
// @access    Private
// @payload   { name, image, price, category, brand, countInStock, description }

// @desc      Delete a product
// @route     DELETE /api/v1/products/:id
// @access    Private (Vendor)
// @param     :product_id


    
